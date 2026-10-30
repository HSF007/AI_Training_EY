from enum import Enum


class UserRole(str, Enum):
    REGISTERED_USER = "registered_user"
    ADMIN = "admin"


class PublicationStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    UNPUBLISHED = "unpublished"
    ARCHIVED = "archived"


class AssetState(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"