# Mortifera C2 Framework

A full-stack command and control framework for cybersecurity research and penetration testing. Mortifera (Latin for "deadly" or "lethal") demonstrates modern C2 techniques including Malleable C2 profiles for traffic mimicry and comprehensive post-exploitation capabilities.

**Built with FastAPI (Python) backend and React (TypeScript) frontend.**

---

## 🎓 Research Project

**Course:** Winter 2026 Network Security  
**Institution:** Oakland University  
**Researcher:** Jaylen Terry  
**Purpose:** Educational demonstration of C2 infrastructure and network security concepts  
**Status:** Complete (Phase 1 & 2)

---

## ⚡ Key Features

### Malleable C2 Profiles
Traffic camouflage system that mimics legitimate applications through HTTP header manipulation:
- **Chrome Browser** - Generic web browsing traffic
- **Microsoft Teams** - Corporate collaboration tool traffic
- **Slack** - Team messaging application traffic
- **Windows Update** - Trusted Windows system service traffic

### Agent Capabilities
- **Terminal Command Execution** - Built-in shell interface for remote command execution
- **Screenshot Capture** - Real-time screen capture with Pillow library
- **Keylogger** - Cross-platform keystroke monitoring with pynput
- **Credential Harvesting** - Extract saved credentials from Windows Credential Manager and browsers (Windows only)

### Core Infrastructure
- **Multi-agent Management** - Handle multiple compromised systems simultaneously
- **Beacon System** - Configurable check-in intervals with jitter for evasion
- **Task Queue System** - Centralized command distribution and result collection
- **Agent Generator** - Create customized agents with profile selection
- **Web Dashboard** - Real-time monitoring and control interface

---

## ✅ Implementation Status

### Backend (Python/FastAPI)
- ✅ **Authentication System** - JWT-based with role-based access control (Admin/Operator/Viewer)
- ✅ **PostgreSQL Database** - Complete schema for agents, tasks, operators, and results
- ✅ **Agent Generator** - Dynamic agent creation with PyInstaller (~21MB executables)
- ✅ **Malleable C2 System** - 4 profile configurations with header mimicry
- ✅ **Agent Features** - Terminal, screenshot, keylogger, credential harvesting
- ✅ **RESTful API** - Full OpenAPI/Swagger documentation
- ✅ **Beacon Management** - Sleep intervals, jitter, profile-based traffic
- ✅ **Background Cleanup** - Automated removal of inactive agents

### Frontend (React/TypeScript)
- ✅ **Authentication UI** - Login with JWT token management
- ✅ **Dashboard** - Real-time statistics and quick actions
- ✅ **Agents Page** - Complete agent lifecycle management
  - Real-time status monitoring (auto-refresh)
  - Search, filter, and sort functionality
  - Detailed agent information modal
  - Terminal interface for command execution
  - Delete and cleanup capabilities
- ✅ **Tasks Page** - Task creation and result viewing
- ✅ **Generator Page** - Web-based agent generation
  - Platform selection (Windows/Linux/macOS)
  - Feature selection (screenshot, keylogger, credentials)
  - Malleable C2 profile selection
  - Custom beacon intervals and jitter
  - Download Python source or compiled executable
- ✅ **Responsive Design** - Mobile-friendly with Tailwind CSS
- ✅ **State Management** - Zustand for auth, React Query for server state

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**

### Backend Setup
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/C2Py-framework.git
cd C2Py-framework/backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment
# Copy .env.example to .env and update:
# - DATABASE_URL=postgresql://user:password@localhost/c2framework
# - SECRET_KEY=your-secret-key-here
# - POSTGRES_PASSWORD=your-password

# 6. Run database migrations
alembic upgrade head

# 7. Start server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Backend available at:** http://localhost:8000  
**API Documentation:** http://localhost:8000/api/v1/docs

**Default Admin Credentials:**
- Email: `admin@c2framework.com`
- Password: `admin123`

⚠️ **Change credentials immediately in production environments**

### Frontend Setup
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
# Copy .env.example to .env:
# VITE_API_URL=http://localhost:8000

# 4. Start development server
npm run dev
```

**Frontend available at:** http://localhost:5173

---

## 🧪 Testing the Framework

### 1. Generate an Agent

**Using the Generator Page (Recommended):**
1. Navigate to http://localhost:5173/generator
2. Select platform (Windows/Linux/macOS)
3. Choose Malleable C2 profile (Chrome/Teams/Slack/Windows Update)
4. Enable features (screenshot, keylogger, credentials)
5. Configure beacon interval and jitter
6. Click "Generate Agent"
7. Download Python source or executable

**Via API (http://localhost:8000/api/v1/docs):**
```json
POST /api/v1/generator/generate
{
  "name": "test_agent",
  "platform": "windows",
  "profile": "chrome_browser",
  "c2_server": "http://localhost:8000/api/v1/agents",
  "features": ["screenshot", "keylogger", "credentials"],
  "sleep_interval": 60,
  "jitter": 0.2
}
```

**Output:**
- Python source: `backend/generated_agents/test_agent.py`
- Executable: `backend/generated_agents/executables/test_agent.exe` (~21MB)

### 2. Deploy Agent
```powershell
# Copy to target system
Copy-Item backend\generated_agents\executables\test_agent.exe C:\Users\Test\Downloads\

# Run agent
cd C:\Users\Test\Downloads
.\test_agent.exe
```

**Agent will:**
- Register with C2 server
- Beacon every 60 seconds (±20% jitter)
- Send HTTP requests with Chrome browser headers
- Execute queued commands automatically
- Report results back to server

### 3. Interact with Agent

**Via Dashboard:**
1. Navigate to http://localhost:5173/agents
2. Click on connected agent
3. Use built-in terminal to execute commands
4. View system information and status

**Via API:**
```json
POST /api/v1/tasks
{
  "agent_id": "agent_abc123",
  "task_type": "shell",
  "command": "whoami"
}
```

### 4. View Results

**Dashboard:** Click task in agent details panel  
**API:** `GET /api/v1/tasks/{task_id}`

---

## 📁 Project Structure
```
Mortifera-C2/
├── agents/                          # Agent templates and modules
│   ├── templates/
│   │   └── base_agent.py.template  # Agent template with profile support
│   └── modules/                    # Feature modules
│       ├── screenshot.py
│       ├── keylogger.py
│       └── credentials.py
│
├── backend/                        # FastAPI server
│   ├── app/
│   │   ├── api/                   # API routes
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── agents.py
│   │   │       ├── tasks.py
│   │   │       └── generator.py
│   │   ├── core/                  # Core configuration
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/                # Database models
│   │   │   ├── agent.py
│   │   │   ├── task.py
│   │   │   └── operator.py
│   │   └── services/              # Business logic
│   │       ├── agent_builder.py
│   │       ├── agent_generator.py
│   │       └── communication/
│   │           └── profiles.py    # Malleable C2 profiles
│   ├── generated_agents/          # Generated agents
│   │   └── executables/
│   ├── alembic/                   # Database migrations
│   └── requirements.txt
│
├── frontend/                      # React TypeScript app
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── AgentsPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   └── GeneratorPage.tsx
│   │   ├── stores/               # State management
│   │   ├── lib/                  # API client
│   │   └── types/                # TypeScript types
│   ├── package.json
│   └── .env
│
└── docs/                         # Documentation
    └── research/                 # Research paper and analysis
```

---

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance async web framework
- **PostgreSQL** - Relational database with full ACID compliance
- **SQLAlchemy** - Python ORM with async support
- **Alembic** - Database migration management
- **PyInstaller** - Python to executable compilation
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation and serialization
- **Python-Jose** - JWT token handling
- **Passlib + Bcrypt** - Password hashing
- **Pillow** - Screenshot capture
- **Pynput** - Keyboard event monitoring
- **Pywin32** - Windows API access (credentials)

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Lucide React** - Icon library

---

## 🔒 Security & Legal Disclaimer

### ⚠️ IMPORTANT - READ BEFORE USE

**This framework is designed for:**
- ✅ Educational cybersecurity research
- ✅ Authorized penetration testing
- ✅ Red team exercises with written permission
- ✅ Academic study of C2 infrastructure

**This framework is NOT intended for:**
- ❌ Unauthorized access to computer systems
- ❌ Malicious activities of any kind
- ❌ Deployment without explicit authorization
- ❌ Any illegal purposes

### Legal Requirements
- **Written Authorization Required** - Never deploy agents without explicit permission from system owners
- **Isolated Environment** - Run only in controlled lab/VM environments
- **No Public Exposure** - Never expose C2 server to public internet
- **Compliance** - Follow all applicable laws, regulations, and ethical guidelines
- **Academic Use** - Understand legal and ethical implications before deployment

### Security Best Practices
- Change default admin credentials immediately
- Generate strong random JWT secret key
- Use strong database passwords
- Run in isolated network segments
- Monitor all agent activity
- Maintain audit logs
- Regular security updates

**The authors assume no liability for misuse of this framework. Users are solely responsible for ensuring legal and ethical use.**

---

## 📚 API Documentation

**Interactive API Docs:** http://localhost:8000/api/v1/docs

### Authentication Endpoints
- `POST /api/v1/auth/login` - Authenticate and receive JWT token
- `POST /api/v1/auth/register` - Register new operator
- `GET /api/v1/auth/me` - Get current user information

### Agent Management
- `GET /api/v1/agents` - List all registered agents
- `GET /api/v1/agents/{agent_id}` - Get detailed agent information
- `DELETE /api/v1/agents/{agent_id}` - Remove agent from database
- `POST /api/v1/agents/beacon` - Agent check-in endpoint (internal)
- `POST /api/v1/agents/results` - Agent result submission (internal)

### Task Management
- `GET /api/v1/tasks` - List all tasks
- `GET /api/v1/tasks/{task_id}` - Get task details and results
- `POST /api/v1/tasks` - Create new task for agent
- `DELETE /api/v1/tasks/{task_id}` - Delete task

### Agent Generator
- `GET /api/v1/generator/platforms` - List supported platforms
- `GET /api/v1/generator/features/{platform}` - List available features per platform
- `GET /api/v1/generator/profiles` - List Malleable C2 profiles
- `POST /api/v1/generator/generate` - Generate new agent
- `GET /api/v1/generator/download/{filename}` - Download generated agent

---

## 🧪 Research & Testing

### Malleable C2 Profile Testing

Network traffic was captured using Wireshark to verify each profile correctly mimics target application signatures:

**Chrome Browser Profile:**
- User-Agent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0`
- Standard browser headers (Accept-Language, Accept-Encoding, etc.)
- Effective against signature-based detection

**Microsoft Teams Profile:**
- User-Agent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Teams/1.5.00.10453 Electron/17.1.2`
- Microsoft-specific headers: `X-Ms-Client-Version`, `Origin: https://teams.microsoft.com`
- Blends with corporate collaboration traffic

**Slack Profile:**
- User-Agent: `Mozilla/5.0 (X11; Linux x86_64) Slack/4.29.149 Electron/18.0.1`
- Slack-specific headers: `X-Slack-Client: desktop`, `X-Slack-Version`
- Mimics team messaging application

**Windows Update Profile:**
- User-Agent: `Microsoft-WNS/10.0`
- Microsoft Correlation Vector: `MS-CV`
- Highest stealth - mimics trusted system service

### Detection Evasion Analysis

**What Malleable C2 Profiles Evade:**
- Signature-based detection examining HTTP headers
- User-Agent filtering
- Basic traffic pattern recognition

**What They Don't Evade:**
- Destination IP analysis (traffic goes to wrong servers)
- Deep packet inspection (payload structure mismatch)
- Protocol behavior analysis (HTTP POST vs real protocols)
- Machine learning anomaly detection
- SSL certificate verification

**Conclusion:** Header-level mimicry provides camouflage, not invisibility. Sophisticated detection systems can identify suspicious traffic through behavioral analysis and destination verification.

---

## 📖 Architecture & Design

### OSI Model Implementation

Mortifera demonstrates C2 communication across all seven OSI layers:

- **Layer 7 (Application):** HTTP/HTTPS with RESTful API, JSON payloads, Malleable C2 headers
- **Layer 6 (Presentation):** TLS encryption, data compression, base64 encoding
- **Layer 5 (Session):** Persistent agent sessions via unique IDs, beacon lifecycle management
- **Layer 4 (Transport):** TCP connections, reliable delivery, connection management
- **Layer 3 (Network):** IP routing, outbound connections to C2 server
- **Layer 2 (Data Link):** Standard Ethernet/WiFi frames
- **Layer 1 (Physical):** Works over any physical medium (Ethernet, WiFi, cellular)

### Design Patterns

- **Factory Pattern** - Agent generation with custom configurations
- **Builder Pattern** - Step-by-step agent construction
- **Strategy Pattern** - Pluggable feature modules (screenshot, keylogger, etc.)
- **Observer Pattern** - Beacon system and task queue monitoring
- **Template Method** - Base agent template with customizable components

---

## 🔧 Database Management

### Clean Up Inactive Agents
```bash
cd backend
python scripts/cleanup_agents.py
```

Removes agents not seen in 7+ days.

### Manual Database Operations
```bash
# PostgreSQL CLI
psql -U postgres -d c2framework

# List all agents
SELECT agent_id, hostname, last_seen FROM agents;

# Delete specific agent
DELETE FROM agents WHERE agent_id = 'agent_abc123';

# Clear all tasks
DELETE FROM tasks;
```

---

## 🎯 Use Cases Demonstrated

### Educational Concepts
- Client-server architecture
- RESTful API design
- Database schema design
- Authentication & authorization
- Role-based access control
- Asynchronous programming
- State management patterns
- Real-time data updates

### Cybersecurity Concepts
- Command and control infrastructure
- Agent beaconing techniques
- Traffic evasion (Malleable C2)
- Post-exploitation capabilities
- Network protocol analysis
- Detection methods and limitations
- Defense-in-depth strategies

---

## 📊 Performance & Scalability

### Server Capacity
- **Concurrent Agents:** Tested with 50+ simultaneous connections
- **Beacon Frequency:** Supports 10-300 second intervals
- **Database Performance:** PostgreSQL handles thousands of tasks efficiently
- **API Response Time:** <100ms for typical operations

### Agent Footprint
- **Executable Size:** ~21MB (includes Python runtime)
- **Memory Usage:** ~30MB average
- **CPU Usage:** <1% during idle beaconing
- **Network Traffic:** ~2KB per beacon (depends on profile)

---

## 🙏 Acknowledgments

Developed by Jaylen Terry for Winter 2026 Network Security course at Oakland University with guidance from Dr. Hany Othman.

Built with assistance from Claude (Anthropic AI) for research and implementation guidance.

Special thanks to the open-source community for the excellent tools and frameworks that made this project possible.

---

## 📄 License

This project is licensed for academic and educational use only. See LICENSE file for details.

**Commercial use, unauthorized deployment, and malicious activities are strictly prohibited.**

---

## 📞 Contact & Support

**For academic inquiries or collaboration:**
- **Researcher:** Jaylen Terry
- **Institution:** Oakland University
- **Course:** CSI-5600/4600 Network Security

**For technical issues:**
- Open an issue on GitHub
- Include detailed description and reproduction steps
- Attach relevant logs (sanitize sensitive information)

---

## 🔄 Version History

### v2.0 (Current) - Malleable C2 Implementation
- ✅ Added 4 Malleable C2 profiles (Chrome, Teams, Slack, Windows Update)
- ✅ Enhanced agent capabilities (terminal, screenshot, keylogger, credentials)
- ✅ Complete frontend dashboard with generator UI
- ✅ Comprehensive testing and documentation

### v1.0 - Core Framework
- ✅ Basic agent generation and management
- ✅ Authentication system
- ✅ RESTful API implementation
- ✅ Frontend dashboard foundation

---

**⚠️ Remember: With great power comes great responsibility. Always use this framework ethically and legally.** ⚠️