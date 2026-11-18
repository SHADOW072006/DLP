# IntelliDLP — Enterprise Endpoint-First Data Loss Prevention System

IntelliDLP is a next-generation endpoint Data Loss Prevention (DLP) system featuring centralized management, real-time file system monitoring, pattern-based sensitive data classification, risk scoring, safe policy simulation mode, and AI-assisted security analysis.

---

## 1. Architectural Highlights
- **Strict Project Isolation**: Confined strictly inside `c:\IPS\data_loss_prevention`.
- **Backend**: Spring Boot 3.3.4 (Java 21/25), Spring Security, Spring Data JPA, Apache Tika 2.9.2, WebSocket STOMP, Java WatchService.
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Persistence Layer**: PostgreSQL 18.4 with a normalized 15-entity schema, audit logs, and risk breakdowns.
- **Role-Based Access Control**: Granular RBAC (`ROLE_ADMIN`, `ROLE_ANALYST`, `ROLE_USER`) with JWT authentication and audit trails.
- **Safe Policy Simulation**: Policies evaluate in `SIMULATION` mode by default, preventing disruptive lockouts until explicitly authorized.
- **Privacy-Preserving AI**: Local Ollama integration (`llama3.2:latest`) with sensitive token masking before LLM submission.

---

## 2. Directory Structure

```
c:\IPS\data_loss_prevention\
├── backend\                # Spring Boot 3 REST API & Monitoring Engine
│   ├── mvnw.cmd            # Maven wrapper batch script
│   ├── pom.xml             # Spring Boot 3.3.4 & Tika dependencies
│   ├── src\main\java\      # Modular domain packages (auth, user, discovery, policy, etc.)
│   └── src\main\resources\ # PostgreSQL config & Flyway migrations
├── frontend\               # React 18 + Tailwind Administration Dashboard
│   ├── package.json
│   ├── vite.config.js
│   └── src\                # Layout, AuthContext, ProtectedRoute, 15 SOC management pages
├── test-monitored-folders\ # Sandboxed test folders for WatchService
│   ├── finance-drop\
│   └── hr-drop\
├── docs\                   # API Specifications and Security Hardening Guides
└── README.md
```

---

## 3. Quick Start & Execution

### Seeded Demonstration Accounts:
| Role | Username | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin` | `Admin@IntelliDLP2026!` | Full system config, user management, policy rules |
| **Security Analyst** | `analyst` | `Analyst@IntelliDLP2026!` | Incident triage, file scanning, evidence notes |
| **Standard User** | `user` | `User@IntelliDLP2026!` | Endpoint file self-service & warnings |

### Running the Backend:
```powershell
cd c:\IPS\data_loss_prevention\backend
.\mvnw.cmd spring-boot:run
```
Backend runs on `http://localhost:8080`.
Health endpoint: `http://localhost:8080/api/health`

### Running the Frontend:
```powershell
cd c:\IPS\data_loss_prevention\frontend
npm run dev
```
Frontend runs on `http://localhost:5173` with automatic API and WebSocket proxying to the backend.

---

## 4. Implementation Status
- [x] **PHASE 1**: Project Initialization, Folder Structure, Database Connection & Baseline Schema
- [x] **PHASE 2**: Authentication, Roles and Dashboard Foundation
- [ ] **PHASE 3**: File Upload, Extraction & Sensitive Data Detection
- [ ] **PHASE 4**: Data Classification & PostgreSQL Persistence
- [ ] **PHASE 5**: Endpoint Monitoring Agent (WatchService Daemon)
- [ ] **PHASE 6**: Policy Engine & Safe Simulation Mode
- [ ] **PHASE 7**: Risk Scoring & Incident Management
- [ ] **PHASE 8**: Redaction, Audit Logging & Notifications
- [ ] **PHASE 9**: AI-Assisted Security Analyst
- [ ] **PHASE 10**: Testing, Hardening & Final Verification
