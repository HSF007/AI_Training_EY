
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PlaybackSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    playback_url: str
    expires_at: datetime
    expires_in: int
