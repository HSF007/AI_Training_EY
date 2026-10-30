
from fastapi import APIRouter

from app.api.v1.account import router as account_router
from app.api.v1.auth import router as auth_router
from app.api.v1.library import router as library_router
from app.api.v1.playback import router as playback_router
from app.api.v1.videos import router as videos_router


api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(account_router)
api_router.include_router(videos_router)
api_router.include_router(library_router)
api_router.include_router(playback_router)

