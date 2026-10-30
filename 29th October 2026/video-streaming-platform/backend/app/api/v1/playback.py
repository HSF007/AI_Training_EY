
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import UUID

import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.enums import AssetState, PublicationStatus
from app.models.user import User
from app.models.video import Video
from app.models.video_asset import VideoAsset
from app.schemas.playback import PlaybackSessionResponse
from app.services.media_store import (
    resolve_media_file,
    resource_url,
    rewrite_playlist,
    validate_asset_relative_path,
)


router = APIRouter(tags=["playback"])


def create_playback_token(
    user: User,
    video: Video,
    asset: VideoAsset,
) -> tuple[str, datetime]:
    now = datetime.now(timezone.utc)

    expires_at = now + timedelta(
        minutes=settings.playback_token_minutes
    )

    payload = {
        "sub": str(user.id),
        "video_id": str(video.id),
        "asset_id": str(asset.id),
        "scope": "playback",
        "iss": settings.jwt_issuer,
        "aud": settings.playback_audience,
        "iat": now,
        "exp": expires_at,
    }

    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    return token, expires_at


def validate_playback_token(
    token: str,
    db: Session,
):
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.playback_audience,
            options={
                "require": [
                    "sub",
                    "video_id",
                    "asset_id",
                    "scope",
                    "iss",
                    "aud",
                    "exp",
                ]
            },
        )

        if payload["scope"] != "playback":
            raise jwt.InvalidTokenError("Invalid playback scope")

        user_id = UUID(payload["sub"])
        video_id = UUID(payload["video_id"])
        asset_id = UUID(payload["asset_id"])

    except (jwt.InvalidTokenError, ValueError, KeyError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired playback reference",
        )

    user = db.get(User, user_id)
    video = db.get(Video, video_id)
    asset = db.get(VideoAsset, asset_id)

    if (
        user is None
        or not user.active
        or video is None
        or video.publication_status != PublicationStatus.PUBLISHED
        or asset is None
        or asset.video_id != video.id
        or asset.state != AssetState.READY
        or not asset.manifest_ref
    ):
        raise HTTPException(
            status_code=404,
            detail="Playback resource is unavailable",
        )

    return payload, video, asset


@router.post(
    "/videos/{video_id}/playback-session",
    response_model=PlaybackSessionResponse,
)
def create_playback_session(
    video_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    video = db.scalar(
        select(Video).where(
            Video.id == video_id,
            Video.publication_status == PublicationStatus.PUBLISHED,
        )
    )

    if video is None:
        raise HTTPException(
            status_code=404,
            detail="Video not found",
        )

    asset = db.scalar(
        select(VideoAsset)
        .where(
            VideoAsset.video_id == video.id,
            VideoAsset.state == AssetState.READY,
            VideoAsset.manifest_ref.is_not(None),
        )
        .order_by(VideoAsset.created_at.desc())
    )

    if asset is None:
        raise HTTPException(
            status_code=409,
            detail="No ready streaming asset is available",
        )

    try:
        manifest_file = resolve_media_file(asset.manifest_ref)
    except HTTPException:
        raise HTTPException(
            status_code=409,
            detail="The streaming asset is not available",
        )

    if manifest_file.suffix.lower() != ".m3u8":
        raise HTTPException(
            status_code=409,
            detail="The streaming manifest is invalid",
        )

    token, expires_at = create_playback_token(
        current_user,
        video,
        asset,
    )

    playback_url = (
        f"{settings.api_public_base_url.rstrip('/')}"
        f"/api/v1/playback/{token}/manifest"
    )

    return PlaybackSessionResponse(
        playback_url=playback_url,
        expires_at=expires_at,
        expires_in=settings.playback_token_minutes * 60,
    )



def serve_manifest(
    token: str,
    manifest_ref: str,
    db: Session,
):
    _, _, asset = validate_playback_token(token, db)

    # Validate that the requested manifest belongs to this asset.
    manifest_ref = validate_asset_relative_path(
        asset.manifest_ref,
        manifest_ref,
    )

    # Resolve the validated path inside MEDIA_ROOT.
    file_path = resolve_media_file(manifest_ref)

    if file_path.suffix.lower() != ".m3u8":
        raise HTTPException(
            status_code=404,
            detail="Manifest not found",
        )

    content = file_path.read_text(encoding="utf-8")

    rewritten = rewrite_playlist(
        content,
        manifest_ref,
        token,
    )

    return Response(
        content=rewritten,
        media_type="application/vnd.apple.mpegurl",
        headers={
            "Cache-Control": "private, no-store",
        },
    )



@router.get("/playback/{token}/manifest")
def get_playback_manifest(
    token: str,
    db: Session = Depends(get_db),
):
    _, _, asset = validate_playback_token(token, db)

    return serve_manifest(
        token,
        asset.manifest_ref,
        db,
    )


@router.get("/playback/{token}/resource/{resource_path:path}")

@router.get("/playback/{token}/resource/{resource_path:path}")
def get_playback_resource(
    token: str,
    resource_path: str,
    db: Session = Depends(get_db),
):
    # Validate the playback token and asset.
    _, _, asset = validate_playback_token(token, db)

    # Validate that the requested resource belongs to this asset.
    resource_path = validate_asset_relative_path(
        asset.manifest_ref,
        resource_path,
    )

    # Resolve the validated file safely.
    file_path = resolve_media_file(resource_path)

    # Nested HLS playlists must also be validated and rewritten.
    if file_path.suffix.lower() == ".m3u8":
        return serve_manifest(
            token,
            resource_path,
            db,
        )

    content_types = {
        ".ts": "video/mp2t",
        ".m4s": "video/iso.segment",
        ".mp4": "video/mp4",
        ".aac": "audio/aac",
        ".vtt": "text/vtt",
        ".key": "application/octet-stream",
    }

    return FileResponse(
        file_path,
        media_type=content_types.get(
            file_path.suffix.lower(),
            "application/octet-stream",
        ),
        headers={
            "Cache-Control": "private, no-store",
        },
    )
