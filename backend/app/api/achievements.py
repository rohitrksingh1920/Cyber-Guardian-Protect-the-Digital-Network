from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.core.security import get_current_user

router = APIRouter()

# Full achievement list — keep in sync with game.py ACHIEVEMENT_CHECKS keys
DEFAULT_ACHIEVEMENTS = [
    {"key": "first_line",        "title": "First Line of Defense",    "description": "Complete Level 1 with 100% accuracy.",              "icon": "🛡️", "xp_reward": 200, "pts_reward": 200},
    {"key": "phishing_phreak",   "title": "Phishing Phreak",          "description": "Score 800+ on Level 2 — Phishing Hunt.",            "icon": "🎣", "xp_reward": 300, "pts_reward": 300},
    {"key": "speed_demon",       "title": "Speed Demon",              "description": "Finish any mission in under 60 seconds.",           "icon": "⚡", "xp_reward": 150, "pts_reward": 150},
    {"key": "combo_master",      "title": "Combo Master",             "description": "Achieve a ×5 combo chain in one session.",          "icon": "🔥", "xp_reward": 200, "pts_reward": 200},
    {"key": "network_guardian",  "title": "Network Guardian",         "description": "Score 1000+ on Level 4 — Network Guardian.",        "icon": "🌐", "xp_reward": 250, "pts_reward": 250},
    {"key": "precision_agent",   "title": "Precision Agent",          "description": "Complete any mission with 100% accuracy.",          "icon": "🎯", "xp_reward": 200, "pts_reward": 200},
    {"key": "inbox_zero",        "title": "Inbox Zero Threats",       "description": "Complete Level 2 with 100% accuracy.",              "icon": "📬", "xp_reward": 180, "pts_reward": 180},
    {"key": "early_access",      "title": "Early Access",             "description": "Be among the first 100 agents to register.",       "icon": "🚀", "xp_reward": 100, "pts_reward": 100},
    {"key": "boss_slayer",       "title": "Boss Slayer",              "description": "Score 900+ on Level 3 — Malware Hunter.",           "icon": "☠️", "xp_reward": 350, "pts_reward": 350},
    {"key": "crypto_king",       "title": "Crypto King",              "description": "Complete Level 5 with 100% accuracy.",              "icon": "🔒", "xp_reward": 400, "pts_reward": 400},
    {"key": "legendary_defender","title": "Legendary Defender",       "description": "Complete the Final Boss — Level 6.",                "icon": "💀", "xp_reward": 750, "pts_reward": 750},
    {"key": "cyber_scholar",     "title": "Cyber Scholar",            "description": "Answer 100 security quiz questions correctly.",     "icon": "📚", "xp_reward": 350, "pts_reward": 350},
]


def seed_default_achievements(db: Session):
    """Idempotently insert default achievements. Safe to call multiple times."""
    for d in DEFAULT_ACHIEVEMENTS:
        exists = db.query(models.Achievement).filter(
            models.Achievement.key == d["key"]
        ).first()
        if not exists:
            db.add(models.Achievement(**d))
    db.commit()


@router.get("/", response_model=List[schemas.AchievementOut])
def get_achievements(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Auto-seed if table is empty
    if db.query(models.Achievement).count() == 0:
        seed_default_achievements(db)

    all_achievements = db.query(models.Achievement).all()
    unlocked_map = {
        ua.achievement_id: ua.unlocked_at
        for ua in db.query(models.UserAchievement)
            .filter(models.UserAchievement.user_id == current_user.id).all()
    }

    return [
        schemas.AchievementOut(
            id=a.id,
            key=a.key,
            title=a.title,
            description=a.description or "",
            icon=a.icon,
            xp_reward=a.xp_reward,
            pts_reward=a.pts_reward,
            unlocked=a.id in unlocked_map,
            unlocked_at=unlocked_map.get(a.id)
        )
        for a in all_achievements
    ]


@router.post("/seed")
def seed_achievements(db: Session = Depends(get_db)):
    """Manually seed achievements — call once after first deploy."""
    seed_default_achievements(db)
    count = db.query(models.Achievement).count()
    return {"message": f"Achievements seeded successfully ({count} total)"}
