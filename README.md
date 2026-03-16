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