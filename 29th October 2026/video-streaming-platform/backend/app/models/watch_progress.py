from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    UniqueConstraint,
    Uuid,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.common import TimestampMixin


class WatchProgress(TimestampMixin, Base):
    __tablename__ = "watch_progress"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "video_id",
            name="uq_watch_progress_user_video",
        ),
        CheckConstraint(
            "position_seconds >= 0",
            name="ck_progress_position_nonnegative",
        ),
        CheckConstraint(
            "duration_seconds_snapshot > 0",
            name="ck_progress_duration_positive",
        ),
        CheckConstraint(
            "position_seconds <= duration_seconds_snapshot",
            name="ck_progress_position_within_duration",
        ),
        Index(
            "ix_watch_progress_user_last_watched",
            "user_id",
            "last_watched_at",
        ),
    )

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    user_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    video_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("videos.id", ondelete="RESTRICT"),
        nullable=False,
    )

    position_seconds: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    duration_seconds_snapshot: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    last_watched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )