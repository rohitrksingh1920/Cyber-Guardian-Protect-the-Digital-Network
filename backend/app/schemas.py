from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

# Auth 
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

# User
class UserProfile(BaseModel):
    id: uuid.UUID
    username: str
    email: str
    level: int
    xp: int
    total_score: int
    avatar: str
    school_code: Optional[str]
    show_on_leaderboard: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UpdateProfileRequest(BaseModel):
    avatar: Optional[str] = None
    school_code: Optional[str] = None
    show_on_leaderboard: Optional[bool] = None

# Game 
class SubmitLevelRequest(BaseModel):
    level: int
    score: int
    accuracy: float
    time_taken: int
    difficulty: str = "agent"

class SubmitLevelResponse(BaseModel):
    xp_earned: int
    new_total_xp: int
    new_level: int
    new_total_score: int
    achievements_unlocked: List[str]
    level_up: bool

# Leaderboard 
class LeaderboardEntry(BaseModel):
    rank: int
    username: str
    avatar: str
    level: int
    total_score: int
    xp: int

# Achievement 
class AchievementOut(BaseModel):
    id: int
    key: str
    title: str
    description: str
    icon: str
    xp_reward: int
    pts_reward: int
    unlocked: bool
    unlocked_at: Optional[datetime]

    class Config:
        from_attributes = True
