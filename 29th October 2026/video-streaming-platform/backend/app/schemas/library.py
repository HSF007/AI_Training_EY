
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, StrictInt

from app.schemas.video import VideoOut


class ProgressUpsert(BaseModel):
    model_config = ConfigDict(extra="forbid")

    position_seconds: StrictInt = Field(ge=0)
    duration_seconds_snapshot: StrictInt = Field(gt=0)
    completed: bool = False


class ProgressItemOut(BaseModel):
    video: VideoOut
    position_seconds: int
    duration_seconds_snapshot: int
    completed: bool
    last_watched_at: datetime


class ProgressListResponse(BaseModel):
    items: list[ProgressItemOut]
    page: int
    page_size: int
    total: int
