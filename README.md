# 🛡️ Cyber Guardian — Protect the Digital Network

> **Interactive Cybersecurity Learning Game** · IDEAS 4.0 University Innovation Showcase · K.R. Mangalam University

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com)

---

## 📖 Overview

Cyber Guardian is a full-stack, browser-based cybersecurity education game where players defend a digital network across **6 progressive levels**, each teaching real-world security concepts through interactive MCQ challenges. The game combines gamification with genuine cybersecurity education — players don't just read about threats, they experience and defeat them.

**Built for:** IDEAS 4.0 – University Innovation Showcase  
**Category:** I – Innovation (Gamified Cybersecurity Awareness Platform)

---

## 🎮 Game Features

| Feature | Details |
|---------|---------|
| 6 Progressive Levels | Personal Security → Global Attack Simulation |
| 600-Question Bank | 100 unique MCQ questions per level |
| Random Question Selection | 10 different random questions every session |
| 60% Pass Threshold | Score ≥6/10 to unlock the next level |
| Fail = Reset Forward Progress | Must retry from Level 1 if any level fails |
| XP & Scoring System | Earn XP, level up, track total score |
| Achievements & Badges | 12+ achievements with Bronze→Legendary badge tiers |
| Leaderboard | Global + School/Institution Code filtering |
| School Code System | Private class leaderboards via institution codes |
| Daily Security Tips | Toggle-able cybersecurity tips on dashboard |
| Sound Effects | Toggle-able in-game sounds |
| Animations | Toggle-able page and card animations |
| Reset All Progress | Full progress wipe with confirmation |
| Docker Ready | Single-command deployment |

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **Vite** — fast SPA with hot reload
- **React Router v6** — client-side routing
- Custom CSS design system (cyberpunk dark theme, CSS variables)
- localStorage for progress, settings, and preferences

### Backend
- **FastAPI** (Python) — async REST API
- **SQLAlchemy** ORM with **PostgreSQL** database
- **JWT Authentication** (access + refresh tokens)
- **Uvicorn** ASGI server

### Infrastructure
- **Docker** + **Docker Compose** — full containerized deployment
- **PostgreSQL 15** database container
- Health checks and auto-restart policies

---

## 🗂️ Project Structure

```
cyber-guardian/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Topbar.jsx          # Navigation bar
│   │   │   ├── XPBar.jsx           # Animated XP progress
│   │   │   ├── ResultModal.jsx     # Mission Complete overlay
│   │   │   ├── SystemBreach.jsx    # Level Failed screen (60% rule)
│   │   │   ├── DailyTip.jsx        # Dismissable daily tip card
│   │   │   └── RunnerStage.jsx     # Level 1 runner mini-game
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx       # Agent dashboard with stats
│   │   │   ├── LevelSelect.jsx     # Mission select (60% rule)
│   │   │   ├── Achievements.jsx    # Badges + achievements
│   │   │   ├── Leaderboard.jsx     # Global + school filter
│   │   │   ├── Settings.jsx        # 5-tab settings page
│   │   │   ├── HowToPlay.jsx       # Game guide
│   │   │   └── Levels/
│   │   │       ├── LevelGate.js    # Progression logic (localStorage)
│   │   │       ├── QuizLevel.jsx   # Universal quiz component
│   │   │       ├── Level1.jsx      # Password Fortress (Runner + Quiz)
│   │   │       ├── Level2.jsx      # Phishing Hunt
│   │   │       ├── Level3.jsx      # Malware Hunter
│   │   │       ├── Level4.jsx      # Network Guardian
│   │   │       ├── Level5.jsx      # Encryption Lab
│   │   │       └── Level6.jsx      # Global Attack Simulation
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # JWT auth state
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── hooks/
│   │   │   └── useToast.js         # Toast notification system
│   │   ├── App.jsx
│   │   └── index.css               # Full design system
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   └── app/
│       ├── main.py                 # FastAPI app + router registration
│       ├── database.py             # SQLAlchemy engine + session
│       ├── models.py               # DB models (User, Score, Achievement)
│       ├── schemas.py              # Pydantic request/response schemas
│       ├── questions_bank.py       # 600 questions (100 per level)
│       └── api/
│           ├── auth.py             # /auth/register, /auth/login, /auth/refresh
│           ├── users.py            # /users/profile
│           ├── game.py             # /game/level/submit
│           ├── quiz.py             # /quiz/session/start, /quiz/session/submit
│           ├── leaderboard.py      # /leaderboard/
│           └── achievements.py     # /achievements/
│
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- Ports `5173`, `8000`, `5432` available

### 1. Clone & Start

```bash
git clone https://github.com/your-org/cyber-guardian.git
cd cyber-guardian
docker compose up --build
```

### 2. Access

| Service | URL |
|---------|-----|
| 🎮 Game (Frontend) | http://localhost:5173 |
| ⚡ API (Backend) | http://localhost:8000 |
| 📚 API Docs | http://localhost:8000/docs |

### 3. First Run
1. Open http://localhost:5173
2. Click **Register** — create your agent account
3. Click **PLAY NOW** to start Level 1
4. Score 6/10 or above to unlock the next level

---

## 🔧 Local Development (without Docker)

### Backend

```bash
cd backend
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://postgres:password@localhost:5432/cyberguardian"
export SECRET_KEY="your-secret-key-here"

# Run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 🎯 Game Levels

| # | Level | Topic | Questions |
|---|-------|-------|-----------|
| 1 | 💻 Password Fortress | Personal Device Security | 100 |
| 2 | 📧 Phishing Hunt | Email & Communication Security | 100 |
| 3 | 🦠 Malware Hunter | Malware Defense System | 100 |
| 4 | 🌐 Network Guardian | Network Security Operations | 100 |
| 5 | 🔐 Encryption Lab | Advanced Cyber Defense | 100 |
| 6 | 💀 Global Attack Simulation | Incident Response & Advanced Threats | 100 |
| | **Total** | | **600** |

### How Questions Work
- Each session randomly selects **10 questions** from that level's bank of 100
- Correct answers are **never sent to the client** — all validation is server-side
- Every replay gives a different set — no two sessions are identical

---

## 📊 Passing Rules

```
Score ≥ 60%  (6/10 or more correct)  →  PASS  →  Next level unlocked
Score  < 60%  (5/10 or fewer correct) →  FAIL  →  All forward progress RESET
```

**Fail Rule:** Failing any level (e.g., Level 4) locks Levels 2–6. The player must restart from Level 1 and clear every level sequentially.

---

## 🏅 Badge & Achievement System

### Badge Tiers (based on total achievements unlocked)

| Tier | Achievements | Badge |
|------|-------------|-------|
| 🥉 Bronze | 0–2 | Starting out |
| 🥈 Silver | 3–5 | Building skills |
| 🥇 Gold | 6–8 | Skilled defender |
| 💎 Platinum | 9–10 | Elite agent |
| 💠 Diamond | 11 | Expert guardian |
| 🔱 Legendary | 12 | Master of all |

### Level Badges

| Badge | Unlocked When |
|-------|--------------|
| 🖥️ Device Defender | Complete Level 1 |
| 📨 Secure Messenger | Complete Level 2 |
| 🦠 Malware Hunter | Complete Level 3 |
| 🌐 Network Guardian | Complete Level 4 |
| 🔐 Cyber Strategist | Complete Level 5 |
| 💀 Global Defender | Complete Level 6 |

### Special Badges

| Badge | Condition |
|-------|-----------|
| 🧠 Cyber Genius | Score 100% on any level |
| 🏆 Elite Guardian | Complete all 6 levels |
| 🎯 Perfectionist | 100% accuracy in a session |
| 🔥 Rising Guardian | 3 consecutive level clears |
| 👑 Legendary Defender | Complete all levels without any failure |

---

## 🔌 API Reference

### Authentication
```
POST /auth/register    { username, email, password }
POST /auth/login       { email, password } → { access_token, refresh_token }
POST /auth/refresh     { refresh_token }  → { access_token }
```

### Quiz (Question Bank)
```
POST /quiz/session/start    { level: 1-6 }
     → { session_id, questions[], total, pass_at }

POST /quiz/session/submit   { session_id, level, answers[], time_taken }
     → { correct, total, pct, passed, results[], xp_earned, ... }

GET  /quiz/bank/stats
     → { total_questions: 600, levels: { "1":100, ... } }
```

### User & Progress
```
GET  /users/profile
PUT  /users/profile   { avatar, school_code, show_on_leaderboard }
POST /game/level/submit  { level, score, accuracy, time_taken, difficulty }
```

### Social
```
GET  /leaderboard/?limit=50&school_code=KRMU2026
GET  /achievements/
```

---

## ⚙️ Settings

| Setting | Description |
|---------|-------------|
| 🔊 Sound Effects | Toggle in-game alert and action sounds |
| ✨ Animations | Toggle page transitions and visual effects |
| 💡 Daily Security Tips | Toggle daily tip on dashboard |
| 🏫 School Code | Join class leaderboard (e.g., KRMU2026) |
| 🌐 Show on Leaderboard | Toggle global visibility |
| 🔄 Reset All Progress | Wipe all scores, achievements, and level progress |

---

## 🏫 School Code System

Teachers can create a private class leaderboard by sharing a code:

1. Teacher decides a code: `KRMU2026`
2. Students enter it in **Settings → Privacy → School Code**
3. Filter leaderboard by the code to see only classmates

No registration needed — codes are free-form strings.

---

## 🌐 Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:password@db:5432/cyberguardian
SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (`vite.config.js`)
```js
// VITE_API_URL defaults to http://localhost:8000
```

---

## 👥 Team

| Name | Program | Enrollment |
|------|---------|-----------|
| Rohit          | BCA (AI & DS) - A | 2501060098 |
| Rakshit Kamboj | BCA (AI & DS) - A | 2501060039 |

**Faculty Coordinator:** Dr. Surabhi Shanker  
**Institution:** K.R. Mangalam University, Gurugram  
**Event:** IDEAS 4.0 – University Innovation Showcase

---

## 📄 License

Academic project — K.R. Mangalam University. All rights reserved.
