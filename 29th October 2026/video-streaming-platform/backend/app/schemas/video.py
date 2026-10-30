
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class VideoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    synopsis: str
    release_year: int
    duration_seconds: int
    content_rating: str
    publication_status: str
    poster_asset_id: UUID | None = None
    backdrop_asset_id: UUID | None = None
    published_at: datetime | None = None
    genres: list[str] = Field(default_factory=list)
    playable: bool = False


class VideoListResponse(BaseModel):
    items: list[VideoOut]
    page: int
    page_size: int
    total: int
