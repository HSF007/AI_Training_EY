from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    JSON,
    String,
    Uuid,
    Index,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.common import TimestampMixin
from app.models.enums import AssetState


class VideoAsset(TimestampMixin, Base):
    __tablename__ = "video_assets"

    __table_args__ = (
        CheckConstraint(
            "resolution_width IS NULL OR resolution_width > 0",
            name="ck_assets_width_positive",
        ),
        CheckConstraint(
            "resolution_height IS NULL OR resolution_height > 0",
            name="ck_assets_height_positive",
        ),
        CheckConstraint(
            "bitrate_kbps IS NULL OR bitrate_kbps > 0",
            name="ck_assets_bitrate_positive",
        ),
        Index("ix_video_assets_video_state", "video_id", "state"),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    video_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("videos.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    asset_type: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
    )

    # Internal object-storage key; not a public signed URL.
    storage_key: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )

    manifest_ref: Mapped[str | None] = mapped_column(
        String(1024),
        nullable=True,
    )

    format: Mapped[str | None] = mapped_column(
        String(40),
        nullable=True,
    )

    state: Mapped[AssetState] = mapped_column(
        SAEnum(
            AssetState,
            name="asset_state",
            values_callable=lambda enum_cls: [
                item.value for item in enum_cls
            ],
        ),
        nullable=False,
        default=AssetState.PENDING,
        index=True,
    )

    resolution_width: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    resolution_height: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    bitrate_kbps: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    checksum: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
    )

    error_code: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    rendition_metadata: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=text("'{}'::jsonb"),
    )