from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, users, game, leaderboard, achievements
from app.database import engine, Base, SessionLocal
from app.api.achievements import seed_default_achievements

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cyber Guardian API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","http://localhost:80"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(auth.router,         prefix="/auth",        tags=["Auth"])
app.include_router(users.router,        prefix="/users",       tags=["Users"])
app.include_router(game.router,         prefix="/game",        tags=["Game"])
app.include_router(leaderboard.router,  prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(achievements.router, prefix="/achievements", tags=["Achievements"])

@app.on_event("startup")
def on_startup():
    """Auto-seed achievements on every startup — idempotent."""
    db = SessionLocal()
    try:
        seed_default_achievements(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Cyber Guardian API is running 🛡️", "version": "1.0.0"}
