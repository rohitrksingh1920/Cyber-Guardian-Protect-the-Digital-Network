"""
Quiz API — serves randomized questions and validates submissions
"""
import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app import models
from app.core.security import get_current_user
from app.questions_bank import QUESTION_BANK

router = APIRouter()

#  Config 
QUESTIONS_PER_SESSION = 10   # how many to show per play
PASS_THRESHOLD        = 0.60  # 60% to pass (6/10 correct)


#  Schemas 

class QuestionOut(BaseModel):
    id:       int
    q:        str
    opts:     List[str]
    # NOTE: 'a' (answer index) is NOT included — never sent to client

class QuizSessionRequest(BaseModel):
    level: int

class QuizSessionOut(BaseModel):
    session_id: str
    level:      int
    questions:  List[QuestionOut]
    total:      int
    pass_at:    int   # number correct needed to pass

class AnswerItem(BaseModel):
    question_id: int
    chosen:      int  # 0-indexed answer the player chose

class QuizSubmitRequest(BaseModel):
    session_id: str
    level:      int
    answers:    List[AnswerItem]
    time_taken: int   # seconds

class QuizResultItem(BaseModel):
    question_id: int
    correct:     bool
    correct_idx: int
    explanation: str
    chosen:      int

class QuizSubmitResponse(BaseModel):
    correct:   int
    total:     int
    pct:       int
    passed:    bool
    pass_at:   int
    results:   List[QuizResultItem]
    score:     int
    xp_earned: Optional[int] = None
    new_level: Optional[int] = None
    new_total_xp:    Optional[int] = None
    new_total_score: Optional[int] = None
    achievements_unlocked: Optional[List[str]] = None
    level_up:  Optional[bool] = None


#  In-memory session cache (per process) 
# Maps session_id -> {"level": int, "question_ids": [int, ...]}
# For production, use Redis; for showcase this is fine
_sessions: dict = {}


def _make_session_id(user_id: str, level: int) -> str:
    import hashlib, time
    raw = f"{user_id}-{level}-{time.time()}"
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


#  Endpoints 

@router.get("/levels/{level}/questions/count")
def get_question_count(level: int):
    """Return total question bank size for a level."""
    if level not in QUESTION_BANK:
        raise HTTPException(status_code=404, detail="Level not found")
    return {"level": level, "total": len(QUESTION_BANK[level])}


@router.post("/session/start", response_model=QuizSessionOut)
def start_quiz_session(
    req: QuizSessionRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Start a new quiz session.
    Randomly samples QUESTIONS_PER_SESSION from the full question bank.
    Returns questions WITHOUT the correct answer index.
    """
    if req.level not in QUESTION_BANK:
        raise HTTPException(status_code=400, detail=f"Level {req.level} not found")

    pool = QUESTION_BANK[req.level]
    count = min(QUESTIONS_PER_SESSION, len(pool))

    selected = random.sample(pool, count)
    session_id = _make_session_id(str(current_user.id), req.level)

    # Store session (question ids and correct answers, server-side only)
    _sessions[session_id] = {
        "user_id":     str(current_user.id),
        "level":       req.level,
        "question_ids": [q["id"] for q in selected],
        "answers":     {q["id"]: q["a"] for q in selected},
    }

    questions_out = [
        QuestionOut(id=q["id"], q=q["q"], opts=q["opts"])
        for q in selected
    ]

    pass_at = max(1, round(count * PASS_THRESHOLD))

    return QuizSessionOut(
        session_id=session_id,
        level=req.level,
        questions=questions_out,
        total=count,
        pass_at=pass_at,
    )


@router.post("/session/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    req: QuizSubmitRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit answers for a quiz session.
    Validates server-side, returns results + XP if passed.
    """
    session = _sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=400, detail="Invalid or expired session")
    if session["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Session mismatch")
    if session["level"] != req.level:
        raise HTTPException(status_code=400, detail="Level mismatch")

    correct_map  = session["answers"]   # {question_id: correct_index}
    question_ids = session["question_ids"]
    total        = len(question_ids)
    pass_at      = max(1, round(total * PASS_THRESHOLD))

    # Build results
    results: List[QuizResultItem] = []
    num_correct = 0

    # Create lookup for submitted answers
    answer_lookup = {a.question_id: a.chosen for a in req.answers}

    # Look up full question data for explanations
    level_pool = {q["id"]: q for q in QUESTION_BANK.get(req.level, [])}

    for qid in question_ids:
        correct_idx = correct_map[qid]
        chosen      = answer_lookup.get(qid, -1)   # -1 = unanswered
        is_correct  = chosen == correct_idx
        if is_correct:
            num_correct += 1

        q_data = level_pool.get(qid, {})
        results.append(QuizResultItem(
            question_id=qid,
            correct=is_correct,
            correct_idx=correct_idx,
            explanation=q_data.get("exp", ""),
            chosen=chosen,
        ))

    pct    = round((num_correct / total) * 100)
    passed = num_correct >= pass_at

    # Score calculation
    speed_bonus  = max(0, 300 - req.time_taken) if req.time_taken > 0 else 0
    base_score   = num_correct * 200
    quiz_score   = base_score + (speed_bonus if passed else 0)

    # If passed — submit to backend for XP
    xp_earned = new_level = new_total_xp = new_total_score = None
    achievements_unlocked = []
    level_up = False

    if passed:
        from app.api.game import calculate_xp, check_achievements
        xp_earned = calculate_xp(quiz_score, pct, req.time_taken, req.level)

        old_level              = current_user.level
        current_user.xp        += xp_earned
        current_user.total_score += quiz_score

        XP_PER_LEVEL   = 1000
        MAX_LEVEL       = 6
        new_level_calc  = min((current_user.xp // XP_PER_LEVEL) + 1, MAX_LEVEL)
        level_up        = new_level_calc > old_level
        current_user.level = new_level_calc

        # Save score record
        db.add(models.Score(
            user_id=current_user.id,
            level=req.level,
            score=quiz_score,
            accuracy=float(pct),
            time_taken=req.time_taken,
            completed=True,
            difficulty='agent',
        ))

        achievements_unlocked = check_achievements(
            quiz_score, pct, req.time_taken, req.level, db, current_user
        )
        db.commit()
        db.refresh(current_user)

        xp_earned        = xp_earned
        new_level        = current_user.level
        new_total_xp     = current_user.xp
        new_total_score  = current_user.total_score

    # Clean up session
    _sessions.pop(req.session_id, None)

    return QuizSubmitResponse(
        correct=num_correct,
        total=total,
        pct=pct,
        passed=passed,
        pass_at=pass_at,
        results=results,
        score=quiz_score,
        xp_earned=xp_earned,
        new_level=new_level,
        new_total_xp=new_total_xp,
        new_total_score=new_total_score,
        achievements_unlocked=achievements_unlocked,
        level_up=level_up,
    )


@router.get("/bank/stats")
def get_bank_stats():
    """Return question bank stats (public)."""
    return {
        "total_questions": sum(len(v) for v in QUESTION_BANK.values()),
        "levels": {k: len(v) for k, v in QUESTION_BANK.items()},
        "questions_per_session": QUESTIONS_PER_SESSION,
        "pass_threshold": f"{int(PASS_THRESHOLD * 100)}%",
    }
