
from datetime import datetime, timezone
from math import ceil
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session, selectinload

from app.api.deps import get_current_user
from app.api.v1.videos import get_ready_video_ids, serialize_video
from app.db.session import get_db
from app.models.enums import PublicationStatus
from app.models.user import User
from app.models.video import Video
from app.models.watch_progress import WatchProgress
from app.models.watchlist_item import WatchlistItem
from app.schemas.library import ProgressItemOut, ProgressListResponse
from app.schemas.video import VideoListResponse
from app.schemas.library import ProgressUpsert


router = APIRouter(prefix="/me", tags=["personal library"])


def published_video(db: Session, video_id: UUID) -> Video:
    video = db.scalar(
        select(Video)
        .where(
            Video.id == video_id,
            Video.publication_status == PublicationStatus.PUBLISHED,
        )
        .options(selectinload(Video.genres))
    )

    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")

    return video


@router.get("/watchlist", response_model=VideoListResponse)
def get_watchlist(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filters = [
        WatchlistItem.user_id == current_user.id,
        Video.publication_status == PublicationStatus.PUBLISHED,
    ]

    total = db.scalar(
        select(func.count())
        .select_from(WatchlistItem)
        .join(Video, Video.id == WatchlistItem.video_id)
        .where(*filters)
    ) or 0

    statement = (
        select(Video)
        .join(WatchlistItem, WatchlistItem.video_id == Video.id)
        .where(*filters)
        .options(selectinload(Video.genres))
        .order_by(WatchlistItem.created_at.desc(), Video.id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    videos = list(db.scalars(statement).all())
    ready_ids = get_ready_video_ids(db, [video.id for video in videos])

    return VideoListResponse(
        items=[
            serialize_video(video, video.id in ready_ids)
            for video in videos
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.post("/watchlist/{video_id}")
def add_watchlist_item(
    video_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    published_video(db, video_id)

    statement = (
        pg_insert(WatchlistItem)
        .values(
            user_id=current_user.id,
            video_id=video_id,
        )
        .on_conflict_do_nothing(
            index_elements=[
                WatchlistItem.user_id,
                WatchlistItem.video_id,
            ]
        )
    )

    db.execute(statement)
    db.commit()

    return {"status": "saved"}


@router.delete("/watchlist/{video_id}", status_code=204)
def remove_watchlist_item(
    video_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(
        delete(WatchlistItem).where(
            WatchlistItem.user_id == current_user.id,
            WatchlistItem.video_id == video_id,
        )
    )

    db.commit()
    return Response(status_code=204)


@router.get("/progress", response_model=ProgressListResponse)
def get_progress(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filters = [
        WatchProgress.user_id == current_user.id,
        WatchProgress.completed.is_(False),
        Video.publication_status == PublicationStatus.PUBLISHED,
    ]

    total = db.scalar(
        select(func.count())
        .select_from(WatchProgress)
        .join(Video, Video.id == WatchProgress.video_id)
        .where(*filters)
    ) or 0

    statement = (
        select(WatchProgress, Video)
        .join(Video, Video.id == WatchProgress.video_id)
        .where(*filters)
        .options(selectinload(Video.genres))
        .order_by(
            WatchProgress.last_watched_at.desc(),
            Video.id.asc(),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    rows = db.execute(statement).all()
    ready_ids = get_ready_video_ids(
        db,
        [video.id for _, video in rows],
    )

    items = [
        ProgressItemOut(
            video=serialize_video(video, video.id in ready_ids),
            position_seconds=progress.position_seconds,
            duration_seconds_snapshot=progress.duration_seconds_snapshot,
            completed=progress.completed,
            last_watched_at=progress.last_watched_at,
        )
        for progress, video in rows
    ]

    return ProgressListResponse(
        items=items,
        page=page,
        page_size=page_size,
        total=total,
    )


@router.put("/progress/{video_id}", response_model=ProgressItemOut)
def save_progress(
    video_id: UUID,
    payload: ProgressUpsert,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Import kept at module scope in the final code below.
    video = published_video(db, video_id)

    # The database, not the browser, determines the asset duration.
    if payload.duration_seconds_snapshot != video.duration_seconds:
        raise HTTPException(
            status_code=422,
            detail="The supplied duration does not match the current title duration",
        )

    if payload.position_seconds > video.duration_seconds:
        raise HTTPException(
            status_code=422,
            detail="Progress position exceeds the video duration",
        )

    is_completed = (
        payload.completed
        or payload.position_seconds >= ceil(video.duration_seconds * 0.9)
    )

    now = datetime.now(timezone.utc)

    statement = (
        pg_insert(WatchProgress)
        .values(
            id=uuid4(),
            user_id=current_user.id,
            video_id=video.id,
            position_seconds=payload.position_seconds,
            duration_seconds_snapshot=video.duration_seconds,
            completed=is_completed,
            last_watched_at=now,
        )
        .on_conflict_do_update(
            index_elements=[
                WatchProgress.user_id,
                WatchProgress.video_id,
            ],
            set_={
                "position_seconds": payload.position_seconds,
                "duration_seconds_snapshot": video.duration_seconds,
                "completed": is_completed,
                "last_watched_at": now,
                "updated_at": now,
            },
        )
    )

    db.execute(statement)
    db.commit()

    ready_ids = get_ready_video_ids(db, [video.id])

    return ProgressItemOut(
        video=serialize_video(video, video.id in ready_ids),
        position_seconds=payload.position_seconds,
        duration_seconds_snapshot=video.duration_seconds,
        completed=is_completed,
        last_watched_at=now,
    )
