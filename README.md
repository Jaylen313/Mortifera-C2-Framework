# C2 Framework - Command and Control System

A full-stack cybersecurity framework for agent management and remote task execution. Built with FastAPI (Python) backend and React (TypeScript) frontend.

## 🎓 Academic Project
**Course:** Winter 2026 Network Security  
**Team Members:** 
**Status:** In Development 

---

## ✅ What's Implemented (Phase 1)

### Backend (Python/FastAPI)
- ✅ **Authentication System** - JWT token-based with role-based access control (Admin/Operator/Viewer)
- ✅ **PostgreSQL Database** - Agent, Task, and Operator models with SQLAlchemy ORM
- ✅ **Agent Generation** - Dynamic agent creation with PyInstaller (15MB standalone executables)
- ✅ **Agent Features**
  - Screenshot capture (with Pillow)
  - Beacon system with jitter
  - Task execution framework
- ✅ **RESTful API** - Swagger/OpenAPI documentation at `/api/v1/docs`
- ✅ **Agent Management** - Registration, beaconing, task distribution
- ✅ **Database Cleanup Scripts** - Utility scripts for maintenance

### Frontend (React/TypeScript)
- ✅ **Authentication UI** - Login page with JWT token management
- ✅ **Dashboard** - Real-time stats and quick actions
- ✅ **Agents Page** - Full agent management interface
  - Real-time status monitoring (auto-refresh every 5s)
  - Search and filter functionality
  - Detailed agent information modal
  - Copy-to-clipboard for all fields
  - Delete agent capability
- ✅ **Responsive Design** - Mobile-friendly with Tailwind CSS
- ✅ **State Management** - Zustand for auth, React Query for server state

---

## 📋 What's Next (Phase 2)

### Backend
- ⏳ Additional agent features (file upload/download, credentials harvesting)
- ⏳ WebSocket for real-time updates
- ⏳ Task result storage and retrieval

### Frontend
- ⏳ **Tasks Page** - Create and monitor tasks
- ⏳ **Generator Page** - Web UI for agent generation
- ⏳ **Users Page** - Operator management (admin only)
- ⏳ Real-time notifications

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**

### Backend Setup
```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate venv (Windows)
.\venv\Scripts\Activate.ps1

# 4. Install dependencies
pip install -r requirements.txt

# 5. Create .env file
# Copy .env.example to .env and update values:
# - DATABASE_URL
# - SECRET_KEY
# - POSTGRES_PASSWORD

# 6. Run database migrations
alembic upgrade head

# 7. Start server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Backend will be available at:** http://localhost:8000  
**API Docs:** http://localhost:8000/api/v1/docs

**Default Admin Account:**
- Email: `admin@c2framework.com`
- Password: `admin123`

⚠️ **Change this password in production!**

### Frontend Setup
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file
# Copy .env.example to .env:
# VITE_API_URL=http://localhost:8000

# 4. Start development server
npm run dev
```

**Frontend will be available at:** http://localhost:5173

---

## 🧪 Testing the System

### 1. Generate an Agent

**Via Swagger UI (http://localhost:8000/api/v1/docs):**
```json
POST /api/v1/generator/generate
{
  "platform": "windows",
  "c2_server": "http://localhost:8000/api/v1/agents",
  "features": ["screenshot"],
  "sleep_interval": 10,
  "jitter": 0.2,
  "encryption_enabled": false
}
```

**This creates:**
- Python source: `backend/generated_agents/agent_XXXXX.py`
- Executable: `backend/generated_agents/executables/agent_XXXXX.exe` (15MB)

### 2. Deploy Agent
```powershell
# Copy executable to Downloads
Copy-Item backend\generated_agents\executables\agent_XXXXX.exe C:\Users\YourName\Downloads\test_agent.exe

# Run agent
cd C:\Users\YourName\Downloads
.\test_agent.exe
```

Agent will:
- Connect to C2 server
- Register itself
- Beacon every ~10 seconds
- Execute tasks automatically

### 3. Create a Task
```json
POST /api/v1/tasks
{
  "agent_id": "XXXXX",
  "task_type": "screenshot",
  "command": ""
}
```

### 4. View Result
```
GET /api/v1/tasks/{task_id}
```

Result contains base64-encoded screenshot.

---

## 📁 Project Structure
```
C2Py-framework/
├── agents/                 # Agent templates and modules
│   ├── templates/         # Agent code templates
│   └── modules/           # Feature modules (screenshot, keylogger, etc.)
│
├── backend/               # Python FastAPI server
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   └── services/     # Business logic (agent builder, generator)
│   ├── scripts/          # Utility scripts
│   ├── generated_agents/ # Generated agents
│   ├── alembic/          # Database migrations
│   └── requirements.txt  # Python dependencies
│
├── frontend/             # React TypeScript app
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # State management (Zustand)
│   │   ├── lib/          # API client (Axios)
│   │   └── types/        # TypeScript types
│   ├── package.json      # Node.js dependencies
│   └── .env              # Environment variables
│
└── docs/                 # Documentation
```

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **PyInstaller** - Executable generation
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Pillow** - Image processing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **React Query** - Server state
- **Axios** - HTTP client
- **Lucide React** - Icons

---

## 🔒 Security Notes

**For Academic/Testing Use Only:**
- Default admin password must be changed
- JWT secret should be randomly generated
- Database should have strong password
- Never expose to public internet
- Run in isolated VM/network environment

**This is a cybersecurity educational project** - understand legal and ethical implications before deployment.

---

## 📝 Database Management

### Clean Up Old Agents
```bash
cd backend
python scripts\cleanup_agents.py
```

This removes agents not seen in 7+ days.

---

## 🎯 Features Demonstrated

### Design Patterns
- **Factory Pattern** - Agent creation
- **Builder Pattern** - Agent configuration
- **Strategy Pattern** - Feature modules
- **Observer Pattern** - Beacon system

### Security Concepts
- Authentication & Authorization
- JWT tokens
- Password hashing (bcrypt)
- Role-based access control
- Agent identification

### Network Concepts
- Client-server architecture
- RESTful API design
- HTTP beaconing
- Asynchronous operations

---

## 👥 Team Collaboration

### Branch Structure
- `main` - Stable releases
- `templating` - Current development (Phase 1)
- `feature/*` - Feature branches

### Development Workflow
1. Pull latest from `templating`
2. Create feature branch
3. Develop and test
4. Create pull request to `templating`
5. Code review
6. Merge when approved

---

## 📚 API Documentation

**Live API Docs:** http://localhost:8000/api/v1/docs

**Key Endpoints:**

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `GET /api/v1/auth/me` - Get current user

### Agents
- `GET /api/v1/agents` - List all agents
- `GET /api/v1/agents/{agent_id}` - Get agent details
- `DELETE /api/v1/agents/{agent_id}` - Delete agent
- `POST /api/v1/agents/beacon` - Agent beacon (internal)

### Tasks
- `GET /api/v1/tasks` - List tasks
- `GET /api/v1/tasks/{task_id}` - Get task result
- `POST /api/v1/tasks` - Create task

### Generator
- `GET /api/v1/generator/platforms` - List platforms
- `GET /api/v1/generator/features/{platform}` - List features
- `POST /api/v1/generator/generate` - Generate agent
- `GET /api/v1/generator/download/{filename}` - Download agent

---

## ⚠️ Known Issues

None currently! Everything is working as expected.

---

## 🙏 Credits

Built with guidance from Claude (Anthropic AI) for Winter 2026 Network Security class.

---

## 📄 License

Academic project - see LICENSE file.