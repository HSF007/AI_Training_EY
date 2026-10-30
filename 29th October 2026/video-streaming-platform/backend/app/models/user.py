from uuid import UUID, uuid4

from sqlalchemy import Boolean, Enum as SAEnum, String, Uuid, text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base
from app.models.common import TimestampMixin
from app.models.enums import UserRole


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    external_subject: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
    )

    email: Mapped[str | None] = mapped_column(
        String(254),
        nullable=True,
        unique=True,
    )

    display_name: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    role: Mapped[UserRole] = mapped_column(
        SAEnum(
            UserRole,
            name="user_role",
            values_callable=lambda enum_cls: [
                item.value for item in enum_cls
            ],
        ),
        nullable=False,
        default=UserRole.REGISTERED_USER,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=text("true"),
    )
    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )