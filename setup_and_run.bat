@echo off
echo ========================================================
echo Installing all requirements and starting the project...
echo ========================================================

echo.
echo [1/4] Setting up Python backend (rlproject)...
cd rlproject
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat

echo Installing Python requirements...
pip install -qr requirements.txt

echo Starting backend server in a new window...
start "FastAPI Backend" cmd /c "python run.py"
cd ..

echo.
echo [2/4] Setting up Node frontend...
cd frontend
echo Installing Node modules...
call npm install

echo Starting React frontend in a new window...
start "React Frontend" cmd /c "npm run dev"
cd ..

echo.
echo ========================================================
echo Setup complete! Both servers are starting up.
echo - FastAPI backend will be at http://localhost:8000
echo - React frontend will be at http://localhost:5173
echo ========================================================
pause
