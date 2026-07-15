from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter()

LEVEL_CONFIGS = {
    1: {"name": "Personal Device Security",  "xp_base": 200, "xp_max": 400},
    2: {"name": "Email & Communication",     "xp_base": 300, "xp_max": 500},
    3: {"name": "Malware Defense",           "xp_base": 400, "xp_max": 650},
    4: {"name": "Network Security",          "xp_base": 500, "xp_max": 800},
    5: {"name": "Advanced Cyber Defense",    "xp_base": 600, "xp_max": 900},
    6: {"name": "Global Attack Simulation",  "xp_base": 800, "xp_max": 1200},
}

XP_PER_LEVEL = 1000
MAX_LEVEL    = 6


def calculate_xp(score: int, accuracy: float, time_taken: int, level: int) -> int:
    cfg          = LEVEL_CONFIGS.get(level, {"xp_base": 200, "xp_max": 400})
    score_bonus  = min(score // 20, cfg["xp_max"])
    acc_bonus    = int(accuracy * 2)
    speed_bonus  = max(0, 60 - time_taken)
    xp           = cfg["xp_base"] + score_bonus + acc_bonus + speed_bonus
    return min(xp, cfg["xp_max"])


# Achievement unlock conditions — (score, accuracy, time_taken, level) → bool
ACHIEVEMENT_CHECKS = {
    "first_line":        lambda s, a, t, l: l == 1 and a >= 100.0,
    "phishing_phreak":   lambda s, a, t, l: l == 2 and s >= 800,
    "speed_demon":       lambda s, a, t, l: t < 60,
    "precision_agent":   lambda s, a, t, l: a >= 100.0,
    "boss_slayer":       lambda s, a, t, l: l == 3 and s >= 900,
    "crypto_king":       lambda s, a, t, l: l == 5 and a >= 100.0,
    "legendary_defender":lambda s, a, t, l: l == 6,
    "inbox_zero":        lambda s, a, t, l: l == 2 and a >= 100.0,
    "network_guardian":  lambda s, a, t, l: l == 4 and s >= 1000,
}


def check_achievements(
    score: int, accuracy: float, time_taken: int, level: int,
    db: Session, user: models.User
) -> list[str]:
    unlocked = []
    for key, condition in ACHIEVEMENT_CHECKS.items():
        if not condition(score, accuracy, time_taken, level):
            continue
        achievement = db.query(models.Achievement).filter(
            models.Achievement.key == key
        ).first()
        if not achievement:
            continue
        already = db.query(models.UserAchievement).filter(
            models.UserAchievement.user_id == user.id,
            models.UserAchievement.achievement_id == achievement.id
        ).first()
        if already:
            continue
        # Unlock it
        db.add(models.UserAchievement(
            user_id=user.id,
            achievement_id=achievement.id
        ))
        user.xp          += achievement.xp_reward
        user.total_score += achievement.pts_reward
        unlocked.append(achievement.title)
    return unlocked


@router.get("/levels")
def get_levels():
    return [{"id": k, **v} for k, v in LEVEL_CONFIGS.items()]


@router.post("/level/submit", response_model=schemas.SubmitLevelResponse)
def submit_level(
    req: schemas.SubmitLevelRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if req.level not in LEVEL_CONFIGS:
        raise HTTPException(status_code=400, detail="Invalid level number")

    xp_earned = calculate_xp(req.score, req.accuracy, req.time_taken, req.level)

    # Save score record
    db.add(models.Score(
        user_id=current_user.id,
        level=req.level,
        score=req.score,
        accuracy=req.accuracy,
        time_taken=req.time_taken,
        completed=True,
        difficulty=req.difficulty
    ))

    # Update user XP, score, level
    old_level                = current_user.level
    current_user.xp         += xp_earned
    current_user.total_score += req.score

    new_level              = min((current_user.xp // XP_PER_LEVEL) + 1, MAX_LEVEL)
    level_up               = new_level > old_level
    current_user.level     = new_level

    # Check and unlock achievements
    achievements_unlocked = check_achievements(
        req.score, req.accuracy, req.time_taken, req.level, db, current_user
    )

    db.commit()
    db.refresh(current_user)

    return schemas.SubmitLevelResponse(
        xp_earned=xp_earned,
        new_total_xp=current_user.xp,
        new_level=current_user.level,
        new_total_score=current_user.total_score,
        achievements_unlocked=achievements_unlocked,
        level_up=level_up
    )
