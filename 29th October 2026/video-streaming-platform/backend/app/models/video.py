from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.common import TimestampMixin
from app.models.enums import PublicationStatus


class Video(TimestampMixin, Base):
    __tablename__ = "videos"

    __table_args__ = (
        CheckConstraint(
            "release_year >= 1888",
            name="ck_videos_release_year_min",
        ),
        CheckConstraint(
            "duration_seconds > 0",
            name="ck_videos_duration_positive",
        ),
        Index(
            "ix_videos_status_year",
            "publication_status",
            "release_year",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    slug: Mapped[str] = mapped_column(
        String(220),
        nullable=False,
        unique=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    synopsis: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    release_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    duration_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    content_rating: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    publication_status: Mapped[PublicationStatus] = mapped_column(
        SAEnum(
            PublicationStatus,
            name="publication_status",
            values_callable=lambda enum_cls: [
                item.value for item in enum_cls
            ],
        ),
        nullable=False,
        default=PublicationStatus.DRAFT,
        index=True,
    )

    # These foreign keys use ALTER TABLE to avoid the
    # Video <-> VideoAsset circular table dependency.
    poster_asset_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "video_assets.id",
            name="fk_videos_poster_asset_id",
            ondelete="SET NULL",
            use_alter=True,
        ),
        nullable=True,
    )

    backdrop_asset_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey(
            "video_assets.id",
            name="fk_videos_backdrop_asset_id",
            ondelete="SET NULL",
            use_alter=True,
        ),
        nullable=True,
    )

    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    archived_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    genres: Mapped[list["Genre"]] = relationship(
        "Genre",
        secondary="video_genres",
        back_populates="videos",
        lazy="selectin",
    )