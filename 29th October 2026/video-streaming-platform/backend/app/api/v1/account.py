
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import UpdateProfileRequest, UserOut


router = APIRouter(prefix="/me", tags=["account"])


@router.get("", response_model=UserOut)
def get_profile(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.patch("", response_model=UserOut)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.display_name = payload.display_name.strip()

    db.commit()
    db.refresh(current_user)

    return current_user
