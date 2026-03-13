# RL Portfolio Management

A full-stack Reinforcement Learning-based portfolio management application.

- **Backend**: FastAPI (Python) with Stable-Baselines3 RL agents
- **Frontend**: React + Vite + TailwindCSS

---

## 🚀 One-Click Setup & Run

We've provided easy scripts to set up the environment, install all requirements, and start both the backend and frontend at the same time using **minimum commands**.

### Prerequisites
- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Sandesh633a/rl_portfolio.git
cd rl_portfolio
```

### Step 2 — Run the Project

**On Windows:**
Simply double-click `setup_and_run.bat` or run it in your terminal:
```cmd
setup_and_run.bat
```

**On macOS / Linux:**
Run the shell script:
```bash
bash setup_and_run.sh
```

---

*That's it!* The script will automatically:
1. Create a Python virtual environment (`venv`).
2. Install all backend dependencies silently.
3. Start the FastAPI backend at `http://localhost:8000`.
4. Install all frontend Node modules via npm.
5. Start the React frontend at `http://localhost:5173`.

---

## Project Structure

```text
rl_portfolio/
├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── ...
├── rlproject/         # FastAPI Python backend
│   ├── app/
│   ├── models/
│   ├── requirements.txt
│   └── run.py
├── setup_and_run.bat  # 1-click start for Windows
├── setup_and_run.sh   # 1-click start for Mac/Linux
└── README.md
```
