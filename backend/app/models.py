import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username      = Column(String(50), unique=True, nullable=False, index=True)
    email         = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    level         = Column(Integer, default=1)
    xp            = Column(Integer, default=0)
    total_score   = Column(Integer, default=0)
    avatar        = Column(String(10), default="🛡️")
    school_code   = Column(String(20), nullable=True)
    show_on_leaderboard = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)

    scores       = relationship("Score", back_populates="user")
    user_achiev  = relationship("UserAchievement", back_populates="user")
    sessions     = relationship("GameSession", back_populates="user")


class Achievement(Base):
    __tablename__ = "achievements"
    id          = Column(Integer, primary_key=True, autoincrement=True)
    key         = Column(String(50), unique=True, nullable=False)
    title       = Column(String(100), nullable=False)
    description = Column(Text)
    icon        = Column(String(10), default="🏅")
    xp_reward   = Column(Integer, default=100)
    pts_reward  = Column(Integer, default=100)

    user_achiev = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id             = Column(Integer, primary_key=True, autoincrement=True)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    achievement_id = Column(Integer, ForeignKey("achievements.id"), nullable=False)
    unlocked_at    = Column(DateTime, default=datetime.utcnow)

    user        = relationship("User", back_populates="user_achiev")
    achievement = relationship("Achievement", back_populates="user_achiev")


class Score(Base):
    __tablename__ = "scores"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    level      = Column(Integer, nullable=False)
    score      = Column(Integer, default=0)
    accuracy   = Column(Float, default=0.0)
    time_taken = Column(Integer, default=0)
    completed  = Column(Boolean, default=False)
    difficulty = Column(String(20), default="agent")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scores")


class GameSession(Base):
    __tablename__ = "game_sessions"
    id         = Column(Integer, primary_key=True, autoincrement=True)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    level      = Column(Integer, nullable=False)
    difficulty = Column(String(20), default="agent")
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at   = Column(DateTime, nullable=True)
    score      = Column(Integer, default=0)

    user = relationship("User", back_populates="sessions")
