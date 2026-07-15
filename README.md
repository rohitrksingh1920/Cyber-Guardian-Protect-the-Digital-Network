# 🛡️ Cyber Guardian — Protect the Digital Network

> **IDEAS 4.0 — University Innovation Showcase**  
> Category: I — Innovation  
> K.R. Mangalam University, Gurugram

An interactive cybersecurity learning game where players defend a digital network against real-world cyber threats. Built with **React + Vite**, **FastAPI**, and **PostgreSQL**.

---

## 📸 Screenshots

| Home | Dashboard | Level Select |
|------|-----------|--------------|
| Matrix rain + live leaderboard | XP bar, daily tips, achievements | 6 levels with mechanic tags |

| Level 1 — Runner | Level 2 — Phishing | Level 6 — Boss |
|------------------|--------------------|----------------|
| Cyber-themed runner + quiz | Classify 6 realistic emails | 6 defense tasks under 120s |

---

## 🎮 Game Overview

Players take on the role of a **Cyber Guardian** — a security analyst defending a company's digital infrastructure. Each level teaches a different domain of cybersecurity through interactive gameplay.

### Mission Flow
```
Select Level → Mission Brief → Gameplay → Score Points → XP & Achievements → Leaderboard
```

---

## 🗺️ Levels

| # | Name | Mechanic | Teaches |
|---|------|----------|---------|
| 1 | **Password Fortress** | Cyber runner + 5 MCQ quiz | Password strength, 2FA, credential hygiene |
| 2 | **Phishing Hunt** | Classify 6 emails + inspect panel | Email phishing detection, typosquatting, social engineering |
| 3 | **Malware Hunter** | Flag malicious files + analysis popup | File extension risks, malware types, false positives |
| 4 | **Network Guardian** | Multi-choice threat response | DDoS, SQL injection, MITM, brute force mitigation |
| 5 | **Encryption Lab** | Mixed cipher puzzles | Caesar, ROT13, Morse, reverse cipher, real encryption facts |
| 6 | **Global Attack Simulation** | Complete 6 defense tasks in 120s | Incident response, prioritization, coordinated defense |

---

## ✨ Features

### 🎯 Gameplay
- **Level 1** — Cyber-themed runner (collect strong passwords / avoid malware) + rich quiz with checkmark feedback
- **Level 2** — Email inspection panel, lives system, difficulty progression (Easy → Hard), per-email cybersecurity tips
- **Level 3** — Hover to inspect file metadata, analysis popup, malware type labels, false positive penalty
- **Level 4** — Multiple-choice incident response (correct tool matters), network health bar, consequence messages
- **Level 5** — Mixed cipher types (Caesar, ROT13, Morse, Reverse), lives system, reference tables, encryption facts
- **Level 6** — Randomized task order every run, dual progress bars (defense + integrity), win/lose screens
- **Mission Briefing** before each level
- **Final Statistics Screen** after each level with accuracy, grade, and lessons learned
- **Combo System** with multiplier bonuses
- **Next Level →** button on ResultModal

### 🏅 Progression
- **XP System** — Earn XP for every level completed; animated progress bar with shimmer
- **Level System** — Levels 1–6+ based on total XP
- **12 Achievements** — Auto-seeded on startup; unlock mid-game for bonus XP and points
- **Global Leaderboard** — Real-time scores; filter by school code
- **School Leaderboard** — Enter your institution code to compete with classmates

### 💡 Education
- **Daily Security Tip** — Rotating cybersecurity tip on Dashboard; dismissable; 10 topics
- **Rich Quiz Feedback** — After each answer: checkmarks for correct options + "why" explanation
- **Cyber Tips** — Short memorable tip after every phishing email verdict
- **Encryption Facts** — Real-world cryptography context after each cipher puzzle
- **Malware Education** — Trojan, Ransomware, Spyware, Keylogger, Adware explained in-game

### 🎨 UI/UX
- Cyberpunk dark theme (Orbitron + Exo 2 fonts)
- 15 CSS keyframe animations (fadeIn, pop, shake, pulse, shimmer, toastIn/Out, blink, floatUp)
- Page enter animations, hover glow effects, smooth transitions
- Toast notification system (success / error / info / gold)
- Skeleton loading states
- Responsive design (900px, 600px breakpoints)
- ← Back button on every page
- Active nav link underline indicator

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Pure CSS Variables + Orbitron / Exo 2 (Google Fonts) |
| Routing | React Router DOM v6 |
| HTTP | Axios with JWT auto-refresh interceptor |
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| ORM | SQLAlchemy 2.0 |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (frontend production) |

---

## 📁 Project Structure

```
Cyber-Guardian/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── achievements.py   ← Auto-seeds 12 achievements on startup
│   │   │   ├── auth.py           ← Register, login, refresh token
│   │   │   ├── game.py           ← Level submit, XP calculation, achievement checks
│   │   │   ├── leaderboard.py    ← Global + school-filtered rankings
│   │   │   └── users.py          ← Profile get/update
│   │   ├── core/
│   │   │   └── security.py       ← JWT creation, bcrypt, get_current_user
│   │   ├── __init__.py
│   │   ├── database.py           ← SQLAlchemy engine + SessionLocal
│   │   ├── main.py               ← FastAPI app, CORS, startup seed
│   │   ├── models.py             ← User, Score, Achievement, UserAchievement
│   │   └── schemas.py            ← Pydantic request/response models
│   ├── .env
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DailyTip.jsx      ← Rotating daily security tip (NEW)
│   │   │   ├── ResultModal.jsx   ← Confetti, XP animation, Next Level button
│   │   │   ├── RunnerStage.jsx   ← Cyber Dash runner game engine
│   │   │   ├── Topbar.jsx        ← Back button support, active nav, scroll shadow
│   │   │   └── XPBar.jsx         ← Animated shimmer progress bar
│   │   ├── context/
│   │   │   └── AuthContext.jsx   ← JWT auth state, login/register/logout/refreshUser
│   │   ├── hooks/
│   │   │   └── useToast.js       ← Global toast notification system (NEW)
│   │   ├── pages/
│   │   │   ├── Levels/
│   │   │   │   ├── Level1.jsx    ← Mission brief + runner + rich quiz + stats screen
│   │   │   │   ├── Level2.jsx    ← Inspect panel + lives + difficulty progression
│   │   │   │   ├── Level3.jsx    ← Hover details + analysis popup + malware types
│   │   │   │   ├── Level4.jsx    ← Multi-choice response + health bar + consequences
│   │   │   │   ├── Level5.jsx    ← Mixed ciphers + lives + reference tables
│   │   │   │   └── Level6.jsx    ← Random task order + integrity drain + win/lose
│   │   │   ├── Achievements.jsx  ← Filter tabs, progress bar, unlock dates
│   │   │   ├── Dashboard.jsx     ← Daily tip, animated stats, skeleton loading
│   │   │   ├── Game.jsx          ← Cyber Dash main game page
│   │   │   ├── Home.jsx          ← Matrix rain, live leaderboard panel
│   │   │   ├── HowToPlay.jsx     ← Mission flow, core mechanics, scoring
│   │   │   ├── Leaderboard.jsx   ← School filter, current user highlight
│   │   │   ├── LevelSelect.jsx   ← Progress bar, CURRENT badge, mechanic tags
│   │   │   ├── Login.jsx         ← Loading spinner, error display
│   │   │   ├── Register.jsx      ← Password strength indicator, validation
│   │   │   └── Settings.jsx      ← 5-tab layout: Profile, Gameplay, Stats, Privacy, Danger
│   │   ├── services/
│   │   │   └── api.js            ← Axios + JWT auto-refresh on 401
│   │   ├── App.jsx               ← Routes + ToastContainer wrapper
│   │   ├── index.css             ← Global styles, animations, design system
│   │   └── main.jsx              ← React entry point
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| username | VARCHAR(50) | Unique agent name |
| email | VARCHAR(100) | Unique email |
| password_hash | TEXT | bcrypt hashed |
| level | INTEGER | Current player level (1–6+) |
| xp | INTEGER | Total XP earned |
| total_score | INTEGER | Cumulative game score |
| avatar | VARCHAR(10) | Emoji avatar |
| school_code | VARCHAR(20) | Institution code (optional) |
| show_on_leaderboard | BOOLEAN | Privacy setting |
| created_at | TIMESTAMP | Registration date |

### achievements
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| key | VARCHAR(50) | Unique identifier |
| title | VARCHAR(100) | Display name |
| description | TEXT | How to unlock |
| icon | VARCHAR(10) | Emoji |
| xp_reward | INTEGER | XP on unlock |
| pts_reward | INTEGER | Score points |

### scores
| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | FK → users |
| level | INTEGER | Level number (1–6) |
| score | INTEGER | Points scored |
| accuracy | FLOAT | 0.0–100.0% |
| time_taken | INTEGER | Seconds |
| difficulty | VARCHAR | agent / elite |
| completed | BOOLEAN | Completed flag |

### user_achievements
| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | FK → users |
| achievement_id | INTEGER | FK → achievements |
| unlocked_at | TIMESTAMP | When unlocked |

---

## 🔌 API Endpoints

### Auth
```
POST /auth/register     → { access_token, refresh_token }
POST /auth/login        → { access_token, refresh_token }
POST /auth/refresh      → { access_token, refresh_token }
```

### Users
```
GET  /users/profile     → UserProfile
PUT  /users/profile     → UserProfile  (avatar, school_code, show_on_leaderboard)
```

### Game
```
GET  /game/levels                → List of 6 level configs
POST /game/level/submit          → { xp_earned, new_level, new_total_xp, new_total_score, achievements_unlocked, level_up }
```

### Leaderboard
```
GET  /leaderboard/?limit=50                        → Global top 50
GET  /leaderboard/?limit=50&school_code=KRMU2026   → School leaderboard
```

### Achievements
```
GET  /achievements/     → All 12 achievements with unlock status for current user
POST /achievements/seed → Seed default achievements (auto-called on startup)
```

---

## 🏆 Achievements

| Key | Title | How to Unlock | XP |
|-----|-------|--------------|-----|
| first_line | First Line of Defense | Complete Level 1 with 100% accuracy | 200 |
| phishing_phreak | Phishing Phreak | Score 800+ on Level 2 | 300 |
| speed_demon | Speed Demon | Finish any mission in under 60 seconds | 150 |
| combo_master | Combo Master | Achieve a ×5 combo chain | 200 |
| network_guardian | Network Guardian | Score 1000+ on Level 4 | 250 |
| precision_agent | Precision Agent | Complete any mission with 100% accuracy | 200 |
| inbox_zero | Inbox Zero Threats | Complete Level 2 with 100% accuracy | 180 |
| early_access | Early Access | Be among first 100 agents to register | 100 |
| boss_slayer | Boss Slayer | Score 900+ on Level 3 | 350 |
| crypto_king | Crypto King | Complete Level 5 with 100% accuracy | 400 |
| legendary_defender | Legendary Defender | Complete Level 6 | 750 |
| cyber_scholar | Cyber Scholar | Answer 100 security questions correctly | 350 |

---

## 🚀 Quick Start

### Option A — Docker (Recommended)

```bash
# Clone
git clone https://github.com/your-repo/cyber-guardian.git
cd cyber-guardian

# Start everything (DB + Backend + Frontend)
docker-compose up --build

# Open in browser
# Frontend: http://localhost:5173
# API docs: http://localhost:8000/docs
```

Achievements seed automatically on first startup. No extra steps needed.

---

### Option B — Local Development

#### 1. PostgreSQL
```sql
-- Create database
CREATE DATABASE cyberguardian;
```

#### 2. Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/cyberguardian
# SECRET_KEY=your-super-secret-key-here

# Start server
uvicorn app.main:app --reload --port 8000
```

API interactive docs: http://localhost:8000/docs

#### 3. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend: http://localhost:5173

---

## 🔐 Authentication Flow

```
Register/Login → access_token (1hr) + refresh_token (7 days)
     ↓
Every API request → Authorization: Bearer <access_token>
     ↓
On 401 → Auto-refresh via /auth/refresh
     ↓
New tokens stored in localStorage
```

---

## 🌐 Environment Variables

### Backend `.env`
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cyberguardian
SECRET_KEY=your-super-secret-key-change-in-production
```

### Frontend (Vite proxy in `vite.config.js`)
```js
// All /api/* requests proxy to http://localhost:8000
// No .env needed for local dev
```

---

## 🐳 Docker Services

```yaml
services:
  db:        PostgreSQL 16      → port 5432
  backend:   FastAPI + Uvicorn  → port 8000
  frontend:  React + Nginx      → port 5173 (80 in container)
```

---

## 📦 Deployment

### Render / Railway (Recommended for showcase)

**Backend**
1. Create Web Service from `backend/` folder
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add env vars: `DATABASE_URL`, `SECRET_KEY`

**Database**
- Create PostgreSQL instance on Render/Railway
- Copy connection string to `DATABASE_URL`

**Frontend**
1. Create Static Site from `frontend/` folder
2. Build: `npm install && npm run build`
3. Publish directory: `dist`
4. Update `vite.config.js` proxy target to your deployed backend URL

---

## 👥 Team

| Name | Roll Number | Course |
|------|-------------|--------|
| Uday Kumar Vijay   | 2501060136 | BCA (AI & DS) |
| Sneha Kumari       | 2501060163 | BCA (AI & DS) |
| Piyush Jain        | 2501060053 | BCA (AI & DS) |
| Rishabh Bhardwaj   | 2501060109 | BCA (AI & DS) |

**Faculty Coordinator:** Dr. Surabhi Shanker  
**Institution:** K.R. Mangalam University, Gurugram, Haryana

---

## 🔭 Future Roadmap

### Part 2 — Analytics & Profiles
- [ ] Player profile page with performance graphs
- [ ] Learning streak tracker (daily login rewards)
- [ ] Per-level statistics and history
- [ ] School admin dashboard

### Part 3 — AI Features
- [ ] AI Cyber Tutor — ask questions about any security concept
- [ ] Intelligent hint system powered by Claude API
- [ ] Adaptive difficulty based on player performance
- [ ] AI-generated phishing email examples

### Part 4 — Advanced Content
- [ ] Level 7+: Social Engineering, Cloud Security, IoT Threats
- [ ] Multiplayer challenge mode
- [ ] Certificate generation on 100% completion
- [ ] Mobile-responsive touch controls

---

## 📄 License

This project was created for academic purposes as part of the **IDEAS 4.0 University Innovation Showcase** at K.R. Mangalam University.

---

*🛡️ Learn. Defend. Secure the future.*
