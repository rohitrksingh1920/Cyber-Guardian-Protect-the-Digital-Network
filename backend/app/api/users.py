from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter()

@router.get("/profile", response_model=schemas.UserProfile)
def get_profile(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserProfile)
def update_profile(
    req: schemas.UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if req.avatar is not None:
        current_user.avatar = req.avatar
    if req.school_code is not None:
        current_user.school_code = req.school_code
    if req.show_on_leaderboard is not None:
        current_user.show_on_leaderboard = req.show_on_leaderboard
    db.commit()
    db.refresh(current_user)
    return current_user
