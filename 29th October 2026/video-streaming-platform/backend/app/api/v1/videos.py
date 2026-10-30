
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.enums import AssetState, PublicationStatus
from app.models.genre import Genre
from app.models.video import Video
from app.models.video_asset import VideoAsset
from app.schemas.video import VideoListResponse, VideoOut


router = APIRouter(tags=["catalogue"])


SortOption = Literal[
    "title_asc",
    "title_desc",
    "release_year_asc",
    "release_year_desc",
    "newest",
]


def get_ready_video_ids(
    db: Session,
    video_ids: list,
) -> set:
    """Return titles with at least one ready streaming manifest."""
    if not video_ids:
        return set()

    statement = select(VideoAsset.video_id).where(
        VideoAsset.video_id.in_(video_ids),
        VideoAsset.state == AssetState.READY,
        VideoAsset.manifest_ref.is_not(None),
    )

    return set(db.scalars(statement).all())


def serialize_video(video: Video, playable: bool) -> VideoOut:
    return VideoOut(
        id=video.id,
        slug=video.slug,
        title=video.title,
        synopsis=video.synopsis,
        release_year=video.release_year,
        duration_seconds=video.duration_seconds,
        content_rating=video.content_rating,
        publication_status=video.publication_status.value,
        poster_asset_id=video.poster_asset_id,
        backdrop_asset_id=video.backdrop_asset_id,
        published_at=video.published_at,
        genres=[genre.name for genre in video.genres],
        playable=playable,
    )


@router.get("/videos", response_model=VideoListResponse)
def list_videos(
    q: str | None = Query(default=None, max_length=200),
    genre: str | None = Query(default=None, max_length=120),
    year: int | None = Query(default=None, ge=1888, le=2200),
    content_rating: str | None = Query(default=None, max_length=30),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort: SortOption = Query(default="release_year_desc"),
    db: Session = Depends(get_db),
):
    # Visitors can see published titles only.
    filters = [
        Video.publication_status == PublicationStatus.PUBLISHED
    ]

    if q and q.strip():
        search_term = f"%{q.strip()}%"
        filters.append(
            or_(
                Video.title.ilike(search_term),
                Video.synopsis.ilike(search_term),
            )
        )

    if genre and genre.strip():
        normalized_genre = genre.strip().lower()
        filters.append(
            Video.genres.any(
                or_(
                    func.lower(Genre.name) == normalized_genre,
                    Genre.slug == normalized_genre,
                )
            )
        )

    if year is not None:
        filters.append(Video.release_year == year)

    if content_rating and content_rating.strip():
        filters.append(
            func.lower(Video.content_rating)
            == content_rating.strip().lower()
        )

    # Calculate the total before applying pagination.
    total_statement = (
        select(func.count())
        .select_from(Video)
        .where(*filters)
    )

    total = db.scalar(total_statement) or 0

    # Every sort uses a stable tie-breaker.
    if sort == "title_asc":
        ordering = (func.lower(Video.title).asc(), Video.id.asc())
    elif sort == "title_desc":
        ordering = (func.lower(Video.title).desc(), Video.id.asc())
    elif sort == "release_year_asc":
        ordering = (
            Video.release_year.asc(),
            func.lower(Video.title).asc(),
            Video.id.asc(),
        )
    elif sort == "newest":
        ordering = (Video.published_at.desc().nulls_last(), Video.id.asc())
    else:
        ordering = (
            Video.release_year.desc(),
            func.lower(Video.title).asc(),
            Video.id.asc(),
        )

    statement = (
        select(Video)
        .where(*filters)
        .options(selectinload(Video.genres))
        .order_by(*ordering)
        .offset((page - 1) * page_size)
        .limit(page_size)
    )

    videos = list(db.scalars(statement).all())

    ready_ids = get_ready_video_ids(
        db,
        [video.id for video in videos],
    )

    return VideoListResponse(
        items=[
            serialize_video(video, video.id in ready_ids)
            for video in videos
        ],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/videos/{slug}", response_model=VideoOut)
def get_video_by_slug(
    slug: str,
    db: Session = Depends(get_db),
):
    statement = (
        select(Video)
        .where(
            Video.slug == slug,
            Video.publication_status == PublicationStatus.PUBLISHED,
        )
        .options(selectinload(Video.genres))
    )

    video = db.scalar(statement)

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found",
        )

    ready_ids = get_ready_video_ids(db, [video.id])

    return serialize_video(video, video.id in ready_ids)
