# Team Quick Start Guide

## Setup (First Time Only)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd C2Py-framework
git checkout templating
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
pip install -r requirements.txt

# Copy .env.example to .env and update values
copy .env.example .env

# Run migrations
alembic upgrade head
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy .env.example to .env
copy .env.example .env
```

### 4. Database Setup (PostgreSQL)
- Install PostgreSQL if not already installed
- Create database named `c2db`
- Update DATABASE_URL in backend/.env

## Daily Development

### Starting the System
```bash
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Access Points
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/v1/docs

### Login Credentials
- **Email:** admin@c2framework.com
- **Password:** changethis123

## Testing

1. Login at http://localhost:5173
2. Go to Agents page
3. Generate agent via API docs (http://localhost:8000/api/v1/docs)
4. Download and run agent
5. See it appear in dashboard!

## Git Workflow
```bash
# Pull latest changes
git pull origin templating

# Create your feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of changes"

# Push and create PR
git push origin feature/your-feature-name
```

## Need Help?

Check the main README.md for detailed documentation!