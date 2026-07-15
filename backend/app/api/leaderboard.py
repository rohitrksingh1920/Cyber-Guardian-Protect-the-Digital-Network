from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.LeaderboardEntry])
def get_leaderboard(
    limit: int = Query(default=10, le=100),
    school_code: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.User).filter(models.User.show_on_leaderboard == True)
    if school_code:
        query = query.filter(models.User.school_code == school_code)
    users = query.order_by(models.User.total_score.desc()).limit(limit).all()

    return [
        schemas.LeaderboardEntry(
            rank=i + 1,
            username=u.username,
            avatar=u.avatar,
            level=u.level,
            total_score=u.total_score,
            xp=u.xp
        )
        for i, u in enumerate(users)
    ]
