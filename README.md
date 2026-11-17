# DIU Copilot — AI-Powered Digital Campus Assistant

<div align="center">

![DIU Copilot](frontend/src/assets/diu-logo.png)

**An intelligent, multi-agent academic companion engineered specifically for Daffodil International University (DIU).**

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61dafb?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20Express%20Microservices-339933?logo=node.js)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO%204-010101?logo=socket.io)](https://socket.io/)
[![Redis](https://img.shields.io/badge/Cache%20%26%20PubSub-Redis%207-dc382d?logo=redis)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47a248?logo=mongodb)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/AI%20Inference-Groq%20Llama%20%26%20DeepSeek-f55036)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🌟 Overview

**DIU Copilot** is a digital campus platform designed to empower students and faculty at Daffodil International University (DIU). By unifying institutional academic routines, past semester exam papers, student portal data, faculty mentorship, campus lost & found reporting, and assignment document generation into one real-time multi-agent system, DIU Copilot automates university workflows.

---

## ⚡ Core Capabilities

### 1. 🎓 Multi-Agent University Intelligence
- **Intelligent Query Router**: Automatically identifies student intent (course schedules, coding help, mentors, past papers, document generation).
- **Sub-Second Groq Engine**: Powered by Groq's high-throughput LPU inference (`openai/gpt-oss-120b`) for rapid response times.
- **DeepSeek V3 Fallback**: Seamless fallback for advanced coding challenges and system diagrams.

### 2. 📅 Class Routine & Schedule Assistant
- Natural language query parser for DIU section, teacher, and room schedules:
  - *"CSE 221 er class kobe?"*
  - *"68_M er routine dao"*
  - *"MRC sir er class schedule dao"*
  - *"KT-218 e ki class hoy?"*

### 3. 📄 Academic Assignment Cover Page Studio
- Generates pixel-perfect, academic-compliant cover pages following Daffodil International University formatting rules.
- **Interactive On-Canvas Editing**: Click to edit course code, student ID, section, semester, teacher credentials, and submission dates.
- **High-Resolution Exports**: Instant **Download PDF** (A4 proportioned via `jsPDF`) and **Download PNG** (via `html2canvas`).

### 4. 📚 DIU Question Bank Repository
- Instant search across past midterm and final examination papers by course code and department (CSE, SWE, EEE, BBA).
- One-click downloads for archived PDF question papers.

### 5. 🤝 Faculty & Peer Mentor Matchmaker
- Searchable directory of verified DIU faculty and student mentors across AI, Cyber Security, Web Engineering, and Mobile Apps.
- **Direct Real-Time Chat**: Launch 1-on-1 direct conversations with mentors without intermediate AI interference.

### 6. 🔍 Campus Lost & Found System
- Report lost and found belongings across Daffodil Smart City (Ashulia campus, libraries, labs, cafeteria).
- **Bidirectional Match Engine**: Automatically connects students with counterparty reports.
- **Mutual Return Confirmation**: Both parties must confirm return before the case is closed.

### 7. 📊 Student Academic Portal
- Connects directly to student profile data for CGPA, completed credits, registered courses, and attendance statistics.

### 8. 💻 Live Code & Document Artifact Studio
- Multi-file interactive project sandbox featuring the **Monaco Code Editor**.
- In-browser live preview for HTML/CSS/JavaScript builds, plus instant single-file code downloads.

---

## 🏗️ Architecture

```
[ Frontend: React 19 + Vite + Tailwind CSS v4 ] (Port 5173)
                      │
            (HTTP + Socket.IO Handshake)
                      ▼
[ API Gateway & Real-Time Socket.IO Server ] (Port 8080)
   ├── Session Authentication via Redis
   ├── User & Conversation Room Isolation
   └── Redis Pub/Sub Event Fanout
          │
          ├── /api/auth ────────► [ Auth Microservice ] (Port 8090)
          ├── /api/chat ────────► [ Chat Microservice ] (Port 8091)
          ├── /api/agent ───────► [ LangGraph Agent Service ] (Port 8092)
          ├── /api/mentor ──────► [ Mentor Finder Service ] (Port 8096)
          ├── /api/lost-found ──► [ Lost & Found Service ] (Port 8097)
          ├── /api/qbank ───────► [ Question Bank Service ] (Port 8095)
          └── /api/student ─────► [ Student Portal Service ] (Port 6000)
                      │
   [ Redis 7 ] (Port 6379) ───► [ MongoDB Local/Atlas ] (Port 27017)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ 
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Redis](https://redis.io/) (v6+)

### 1. Clone the Repository
```bash
git clone https://github.com/banrayndox/mvp-diu-copilot.git
cd mvp-diu-copilot
```

### 2. Configure Environment Files
Copy each `.env.example` to `.env`:
```bash
# Gateway
cp backend/gateway/.env.example backend/gateway/.env

# AI Agent Service
cp backend/services/agent/.env.example backend/services/agent/.env

# Auth & Chat Services
cp backend/services/auth/.env.example backend/services/auth/.env
cp backend/services/chat/.env.example backend/services/chat/.env

# Academic Services
cp backend/services/lostFound/.env.example backend/services/lostFound/.env
cp backend/services/mentor/.env.example backend/services/mentor/.env
cp backend/services/qBank/.env.example backend/services/qBank/.env
cp backend/services/studentPortal/.env.example backend/services/studentPortal/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend && npm install && cd ..

# Gateway
cd backend/gateway && npm install && cd ../..

# Services
cd backend/services/auth && npm install && cd ../../..
cd backend/services/chat && npm install && cd ../../..
cd backend/services/agent && npm install && cd ../../..
cd backend/services/mentor && npm install && cd ../../..
cd backend/services/lostFound && npm install && cd ../../..
cd backend/services/qBank && npm install && cd ../../..
cd backend/services/studentPortal && npm install && cd ../../..
```

### 4. Start All Services
On Windows PowerShell:
```powershell
.\start-all.ps1
```

Or start manually in individual terminals:
```bash
# Terminal 1: Redis Server
redis-server

# Terminal 2: Gateway
cd backend/gateway && npm run dev

# Terminal 3: Agent Service
cd backend/services/agent && npm run dev

# Terminal 4: Chat Service
cd backend/services/chat && npm run dev

# Terminal 5: Auth Service
cd backend/services/auth && npm run dev

# Terminal 6: Academic Services
cd backend/services/mentor && npm run dev
cd backend/services/lostFound && npm run dev
cd backend/services/qBank && npm run dev
cd backend/services/studentPortal && npm run dev

# Terminal 7: Frontend Web App
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔒 Security & Privacy

- All sensitive credentials, API keys (Groq, OpenRouter, Google, Firebase), and database connection strings are managed exclusively via `.env` files and are excluded from git tracking via `.gitignore`.
- Authentication uses Firebase ID Tokens verified against Google's public keys and cached in isolated Redis sessions (`7-day TTL`).
- WebSocket connections are secured via HTTP-only session cookies and room-based access controls.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
