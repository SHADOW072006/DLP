# IntelliDLP — Complete System Architecture, Operational Manual & Enterprise Deployment Guide

---

## 1. Executive Summary & Project Overview

### What is IntelliDLP?
**IntelliDLP** is an enterprise-grade, endpoint-first **Data Loss Prevention (DLP)** and **Autonomous Threat Response** platform. Built on modern Java 21 Spring Boot 3.3.4 and React 18, it enables centralized security operations (SOC) teams to discover sensitive data, classify corporate assets, monitor endpoint workstation file activity in real time, evaluate multi-condition DLP policies, and orchestrate incident response with zero data leakage.

### The Problem It Solves
Traditional enterprise DLP solutions are often intrusive, fragile, and prone to breaking business workflows with indiscriminate blocking. IntelliDLP introduces:
1. **Endpoint-First Visibility**: Direct monitoring of approved file storage directories using kernel-level event hooks without requiring constant cloud inspection.
2. **Guaranteed Safe Simulation Mode**: Policies evaluate actions in an audited, safe simulation state by default. Actual blocking is only enforced when explicitly authorized.
3. **Privacy-Preserving On-Premise AI**: Triage and incident explanation powered by local, air-gapped Large Language Models (Ollama / LLaMA 3.2), with automatic PII redaction before inference.
4. **Multi-Department Centralized Management**: Hierarchical mapping of devices to departments, employees, compliance scores, and risk exposure indices.

---

## 2. System Architecture & How It Works

```
                     +----------------------------------------------------+
                     |           INTELLIDLP CENTRAL HOST SERVER           |
                     |             (Spring Boot 3.3.4 / Java 21)          |
                     +----------------------------------------------------+
                                      |                     |
                    REST APIs & SSE   |                     |  Local Inference
              (JWT Auth / Port 8080)  |                     |  (Port 11434)
                                      v                     v
+-------------------------------+  +-------------------+  +-----------------------+
|  REACT 18 ADMIN SOC DASHBOARD |  |  PERSISTENCE      |  |  ON-PREM AI COPILOT   |
|  - Navy/Slate Cybersecurity UI|  |  PostgreSQL / H2  |  |  Ollama (LLaMA 3.2)   |
|  - Interactive Recharts Trends|  |  Normalized       |  |  Zero Data Leakage    |
|  - Real-time Device Approvals |  |  15-Table Schema  |  |  Auto-PII Redaction   |
+-------------------------------+  +-------------------+  +-----------------------+
                ^
                | Heartbeat & Event Telemetry
                v
+---------------------------------------------------------------------------------+
|                         CLIENT ENDPOINTS (Workstations)                         |
|  - Endpoint Agent Service (Background daemon)                                   |
|  - Java WatchService / Kernel File System Hooks                                 |
|  - Apache Tika Safe Content & MIME Inspection                                    |
|  - Client Endpoint Agent View (`/client-agent`)                                 |
|  - Monitored Folders: `\finance-drop`, `\hr-drop`, USB drives                   |
+---------------------------------------------------------------------------------+
```

### Core Architecture Components

#### 1. Authentication & Role-Based Access Control (RBAC)
- **Stateless JWT Tokens**: HMAC-SHA256 tokens with configurable validity (24 hours access, 7 days refresh).
- **Three Distinct Role Personas**:
  - `ROLE_ADMIN`: Device approval/suspension, policy creation, department management, user administration.
  - `ROLE_ANALYST`: Incident triage, threat dossier investigation, analyst notes logging, AI consultation.
  - `ROLE_USER`: Standard endpoint employee with read-only warning access and policy explanations.

#### 2. File Discovery & Inspection Engine
- **Multi-Format Extraction**: Leverages Apache Tika 2.9.2 to safely parse `.txt`, `.pdf`, `.docx`, `.csv`, `.xlsx`, and binary streams.
- **Privacy Guarantee**: Computes SHA-256 hashes and captures file metadata without storing complete sensitive document bodies in the database.

#### 3. Sensitive Data Classification Engine
Detects configurable patterns using high-precision regex matching and mathematical validation:
- **Aadhaar Numbers**: 12-digit Indian national identity pattern with Luhn/Verhoeff checksum filters.
- **PAN Cards**: Indian Permanent Account Number validation (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
- **Payment Card Numbers (PCI-DSS)**: Visa, Mastercard, Amex with mandatory Luhn algorithm verification.
- **Secrets & Credentials**: Private keys (`-----BEGIN PRIVATE KEY-----`), AWS/Cloud API keys, database connection strings, high-entropy password strings.
- **PII Communications**: RFC-compliant email addresses and international phone numbers.

Classification levels:
`PUBLIC` $\rightarrow$ `INTERNAL` $\rightarrow$ `CONFIDENTIAL` $\rightarrow$ `RESTRICTED`

#### 4. Endpoint Monitoring & Device Lifecycle
- **WatchService File System Hooks**: Detects `ENTRY_CREATE`, `ENTRY_MODIFY`, and `ENTRY_DELETE` events in administrator-approved folders with event debouncing (500ms).
- **Zero-Trust Device Registration**:
  - Workstations request onboarding via `POST /api/endpoints/register`.
  - Device enters `PENDING` approval state.
  - Host Administrator explicitly authorizes (`APPROVED`) or denies (`REJECTED`) the device.
  - Ongoing device health tracked via periodic heartbeats.

#### 5. DLP Policy Engine & Safe Simulation
- **Policy Rules**: Evaluates target classification, detection category, user, department, and action.
- **Action Hierarchy**:
  - `ALLOW`: Permitted action, logged for baseline auditing.
  - `WARN`: User prompted with security reminder.
  - `REQUIRE_APPROVAL`: File transfer quarantined until SOC sign-off.
  - `BLOCK`: Transfer actively prevented.
- **Simulation Mode Switch**: Every policy has a `simulationMode` boolean. In simulation mode, `BLOCK` actions are safely recorded as simulated violations with zero business disruption.

#### 6. Multi-Factor Risk Scoring Algorithm (0–100)
Composite risk score is calculated as:
$$\text{Risk Score} = \min(100, S_{\text{class}} + S_{\text{count}} + S_{\text{context}} + S_{\text{history}})$$
- **Classification Sensitivity ($S_{\text{class}}$)**: `RESTRICTED` (+40), `CONFIDENTIAL` (+25), `INTERNAL` (+10).
- **Detection Density ($S_{\text{count}}$)**: Scales based on volume and confidence of sensitive tokens.
- **Context ($S_{\text{context}}$)**: Unapproved destination, external removable USB, or after-hours modification.
- **Endpoint Violation History ($S_{\text{history}}$)**: Prior unresolved incidents on that workstation.

#### 7. AI Security Copilot (On-Premise LLM)
- **Air-Gapped Integration**: Communicates with local Ollama daemon (`http://localhost:11434`) running `llama3.2:latest`.
- **Zero Data Leakage**: Sensitive findings are masked (e.g. `4532-XXXX-XXXX-8921` $\rightarrow$ `[REDACTED_CREDIT_CARD]`) prior to sending prompts to the LLM.

---

## 3. How to Start All Commands

### Quick One-Click Launch (Windows)
The repository contains standalone batch scripts in `c:\IPS\data_loss_prevention\`:

```cmd
:: Launch both Backend and Frontend in separate windows
start-all.cmd

:: Or launch individually:
start-backend.cmd
start-frontend.cmd
```

---

### Manual Terminal Commands

#### 1. Backend Server (Spring Boot 3.3.4)
```powershell
cd C:\IPS\data_loss_prevention\backend

# Compile and verify all 102+ Java classes
.\mvnw.cmd clean compile

# Run automated tests
.\mvnw.cmd test

# Launch Spring Boot server (Runs on port 8080)
.\mvnw.cmd spring-boot:run
```

#### 2. Frontend Dashboard (React 18 + Vite)
```powershell
cd C:\IPS\data_loss_prevention\frontend

# Install dependencies (if not already installed)
npm install

# Build production bundle
npm run build

# Run local development server (Runs on port 3000)
npm run dev
```

#### 3. AI Assistant Service (Optional Local Ollama)
```powershell
# In a separate terminal (if Ollama is installed on host)
ollama pull llama3.2:latest
ollama serve
```

---

### Access URLs & Credentials

| Service | Access URL | Default Credentials |
|---|---|---|
| **Host Admin SOC Dashboard** | `http://localhost:3000/` | `admin` / `Admin@IntelliDLP2026!` |
| **SOC Security Analyst Portal** | `http://localhost:3000/incidents` | `analyst` / `Analyst@IntelliDLP2026!` |
| **Client Endpoint Agent View** | `http://localhost:3000/client-agent` | Public / Autonomous Agent Screen |
| **Backend REST Health API** | `http://localhost:8080/api/health` | Public GET endpoint |

*(The login screen also provides 1-click role buttons for instant demo access).*

---

## 4. REST API Endpoint Reference

### Authentication
- `POST /api/auth/login` — Authenticate and receive JWT access + refresh tokens.
- `POST /api/auth/refresh` — Refresh expired access token.
- `GET /api/auth/me` — Retrieve current authenticated user profile and roles.

### Central Organization & Departments
- `GET /api/organization` — Fetch enterprise profile (`CyberCorp Defense Systems`).
- `PUT /api/organization` — Update organization parameters.
- `GET /api/departments` — List departments (`IT-OPS`, `FIN`, `HR`, `RND`) with device counts and risk scores.
- `POST /api/departments` — Create new department.
- `PUT /api/departments/{id}` — Modify department.
- `DELETE /api/departments/{id}` — Remove department.

### Endpoint Device Management
- `GET /api/endpoints` — List all registered workstations and live online/offline statuses.
- `GET /api/endpoints/{id}` — Retrieve detailed hardware and policy state of an endpoint.
- `POST /api/endpoints/register` — Client agent onboarding request.
- `PUT /api/endpoints/{id}/approve` — Host administrator approves device for enterprise access.
- `PUT /api/endpoints/{id}/reject` — Deny device registration.
- `PUT /api/endpoints/{id}/suspend` — Temporarily revoke protection/connection certificate.
- `PUT /api/endpoints/{id}/department` — Map device to a department.
- `POST /api/endpoints/{id}/commands` — Dispatch remote actions (`TRIGGER_SCAN`, `SYNC_POLICIES`, `HEALTH_CHECK`).

### DLP Policies & Safe Simulation
- `GET /api/policies` — Retrieve all active enterprise policies.
- `POST /api/policies` — Define new DLP rule.
- `PUT /api/policies/{id}` — Update existing policy.
- `PUT /api/policies/{id}/toggle-mode` — Flip between **SIMULATION** (safe audit) and **ENFORCED** (active blocking).
- `DELETE /api/policies/{id}` — Delete policy.

### Incidents & Investigation
- `GET /api/incidents` — Paginated incident feed with status and severity filters.
- `GET /api/incidents/{id}` — Deep-dive incident dossier with risk breakdown and evidence.
- `PATCH /api/incidents/{id}/status` — Update triage status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`).
- `POST /api/incidents/{id}/notes` — Attach analyst investigation notes.

### Analytics, Trends & Exports
- `GET /api/analytics/summary` — High-level KPI metrics (compliance %, open threats, simulated blocks).
- `GET /api/analytics/departments` — Departmental risk ranking and incident density.
- `GET /api/analytics/trends` — 30-day violation frequency time-series for chart rendering.
- `GET /api/reports/export?type=CSV` — Download verifiable security compliance CSV audit.

### On-Premise AI Copilot
- `POST /api/ai/explain-incident` — Request private LLM explanation of masked incident telemetry.
- `POST /api/ai/recommend-policies` — Natural language advisory for DLP rule optimization.

---

## 5. How to Explain & Present This Project to Others

When presenting IntelliDLP to management, clients, or evaluators, use the structured walkthrough below:

### 1. The 30-Second Elevator Pitch
> *"IntelliDLP is an intelligent, endpoint-first Data Loss Prevention platform. Unlike legacy DLP tools that break employee workflows with blind blocks, IntelliDLP uses transparent file-system monitoring, regex/checksum pattern verification, and a safe Simulation Mode. It calculates composite threat scores from 0 to 100, maps security posture across company departments, and uses a 100% private on-premise AI model to assist security analysts with zero cloud data exposure."*

### 2. Live Demo Script (Step-by-Step Walkthrough)

#### Step 1: Login & Role-Based Dashboard (`http://localhost:3000`)
- **Action**: Click the **"Administrator"** one-click login button.
- **Talking Point**: Point out the dark SOC aesthetic, the live engine telemetry from `/api/health`, and the KPI cards displaying total endpoints, compliance %, and simulated decisions. Emphasize that **no numbers are hardcoded**—they are live-calculated by the backend.

#### Step 2: Centralized Organization & Department Posture (`/organization`)
- **Action**: Navigate to **Organization**.
- **Talking Point**: Show how CyberCorp has 4 distinct departments (`IT Operations`, `Finance`, `Human Resources`, `R&D`). Each department aggregates its own device count and dynamic risk score based on employee incidents. Demonstrate adding a new department or editing one.

#### Step 3: Zero-Trust Endpoint Device Approval (`/endpoints`)
- **Action**: Navigate to **Endpoints**.
- **Talking Point**: Explain the zero-trust principle: *"A new laptop cannot simply connect and access policies. It enters a PENDING state."* Show the pending device (`HR-LAPTOP-12`), click **Approve**, and show the status turn green. Click on an endpoint to show the slide-in drawer with compliance scoring and remote commands (`TRIGGER_SCAN`, `SYNC_POLICIES`).

#### Step 4: DLP Policies & Safe Simulation Mode (`/policies`)
- **Action**: Navigate to **DLP Policies**.
- **Talking Point**: Show the policies table. Explain the **Simulation Mode** toggle: *"In enterprise security, before you block a financial transfer, you run in simulation mode for 30 days to measure business impact. Only when verified do you flip to Enforced mode."*

#### Step 5: Incident Investigation & Threat Scoring (`/incidents`)
- **Action**: Navigate to **Incidents**, select an incident code, and click **Investigate**.
- **Talking Point**: Show the 0–100 risk score breakdown, the file evidence metadata, the policy triggered, and the analyst notes timeline. Add an analyst note live in the UI.

#### Step 6: On-Premise AI Security Copilot (`/ai-assistant`)
- **Action**: Click the **"AI Incident Analysis"** button or go to `/ai-assistant`.
- **Talking Point**: Highlight the **"100% On-Premise Air-Gapped Inference"** badge. Show how an analyst can ask natural language questions about remediation or incident context without risking sensitive company data leaking to third-party public AI APIs.

#### Step 7: Compliance Reports Export (`/reports`)
- **Action**: Navigate to **Reports & Exports**, choose **Security Incidents Audit**, and click **Download CSV**.
- **Talking Point**: Demonstrate that auditors get verified, downloadable CSV records of all security incidents and endpoint compliance metrics.

#### Step 8: Client Endpoint Agent View (`/client-agent`)
- **Action**: Open `/client-agent` (or click "Open Client Agent View" in the sidebar footer).
- **Talking Point**: Explain: *"This is the lightweight view running on the employee's machine. It confirms kernel watch protection is active, shows local compliance, and displays recent audits without giving the employee access to SOC administration."*

---

## 6. How to Deploy & Use This at Organization Level

To scale IntelliDLP from a single-host environment to a full enterprise-wide deployment across hundreds or thousands of corporate workstations:

```
                  +-------------------------------------------------------------+
                  |               ENTERPRISE CLOUD / DATACENTER                 |
                  |                                                             |
                  |   +-----------------------+     +-----------------------+   |
                  |   |  Host Load Balancer   |     |  Ollama AI Cluster    |   |
                  |   |  (HTTPS / TLS 1.3)    |     |  (GPU Worker Node)    |   |
                  |   +-----------------------+     +-----------------------+   |
                  |               |                             |               |
                  |               v                             v               |
                  |   +-----------------------------------------------------+   |
                  |   |      IntelliDLP Backend Cluster (Spring Boot)       |   |
                  |   +-----------------------------------------------------+   |
                  |               |                             |               |
                  |               v                             v               |
                  |   +-----------------------+     +-----------------------+   |
                  |   |  PostgreSQL HA DB     |     |  Corporate Active Dir |   |
                  |   |  (Replicated Cluster) |     |  LDAP / Okta / SAML   |   |
                  |   +-----------------------+     +-----------------------+   |
                  +-------------------------------------------------------------+
                                                 |
                                Corporate WAN / VPN (mTLS 8443)
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
         v                                       v                                       v
+------------------+                    +------------------+                    +------------------+
| IT Workstations  |                    | Finance Laptops  |                    | HR & Legal Desks |
| (Endpoint Agent) |                    | (Endpoint Agent) |                    | (Endpoint Agent) |
+------------------+                    +------------------+                    +------------------+
```

### 1. Enterprise Database & Backend Scaling
1. **Switch to Clustered PostgreSQL**: In `backend/src/main/resources/application.yml`, activate the `postgres` profile by setting:
   ```bash
   export SPRING_PROFILES_ACTIVE=postgres
   export SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-ha.corp.local:5432/intellidlp_prod
   export SPRING_DATASOURCE_USERNAME=intellidlp_svc
   export SPRING_DATASOURCE_PASSWORD=YourStrongSecretPassword123!
   ```
2. **Stateless Load Balancing**: Run multiple Spring Boot instances behind an enterprise Reverse Proxy / Load Balancer (NGINX, HAProxy, or AWS ALB) with SSL termination on HTTPS (Port 443).

### 2. Mass Endpoint Agent Rollout (GPO / Intune)
- Package the endpoint agent daemon as a Windows Service (using WinSW or native MSI installer) or macOS LaunchDaemon.
- Distribute silently via **Microsoft Intune**, **SCCM**, or **Active Directory Group Policy Object (GPO)**:
  ```powershell
  # Example Silent Rollout Script
  msiexec.exe /i "IntelliDLP-Agent-v1.4.msi" /quiet /qn ^
    HOST_SERVER="https://dlp.cybercorp.local" ^
    DEPT_CODE="FIN" ^
    AUTO_REGISTER=TRUE
  ```
- The agent generates a cryptographically secure hardware fingerprint (UUID + MAC + CPU ID), contacts the host server, and awaits administrator approval.

### 3. Mutual TLS (mTLS) & Device Authentication
- For enterprise network isolation, configure client-certificate authentication (mTLS).
- Only laptops possessing a company PKI certificate issued by the corporate Root CA can establish connections to the host API.

### 4. Active Directory / LDAP / Single Sign-On (SSO)
- Replace local JWT credentials with SAML 2.0 / OIDC (Okta, Microsoft Entra ID / Azure AD, PingFederate).
- Map corporate Active Directory security groups directly to IntelliDLP roles:
  - `CN=SOC-Admins,OU=Groups,DC=corp` $\rightarrow$ `ROLE_ADMIN`
  - `CN=SOC-Analysts,OU=Groups,DC=corp` $\rightarrow$ `ROLE_ANALYST`
  - `CN=All-Employees,OU=Groups,DC=corp` $\rightarrow$ `ROLE_USER`

### 5. Enforced Hardware & Removable Storage (USB) Policy
- Extend the agent to hook into Windows `SetupAPI` and `RegisterDeviceNotification` to intercept USB flash drives.
- When an unauthorized USB mass storage device is inserted:
  - If policy is in `SIMULATION` mode: Record event in `/live-events` and flag workstation.
  - If policy is in `ENFORCED` mode: Agent marks the volume read-only or dismounts the USB drive immediately.

### 6. SIEM & SOC Pipeline Integration
- Stream all `monitored_events` and `incidents` directly into enterprise SIEM platforms:
  - **Splunk**: Configure HTTP Event Collector (HEC).
  - **Elastic / OpenSearch**: Direct Logstash beats forwarder.
  - **Syslog**: RFC-5424 compliant syslog output stream to ArcSight or QRadar.

---

## 7. Technology Stack Summary Table

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Backend Framework** | Java 21 LTS, Spring Boot 3.3.4 | Core REST API, business logic, asynchronous task management |
| **Security & Auth** | Spring Security 6, JJWT 0.12.6 | Stateless JWT authentication, RBAC authorization filters |
| **Data Extraction** | Apache Tika 2.9.2 | High-throughput parsing of PDFs, Office documents, text files |
| **Database & ORM** | PostgreSQL 18.4 / H2, Spring Data JPA | Relational persistence, 15 normalized tables, database migrations |
| **Endpoint Monitoring** | Java NIO `WatchService` | Real-time file system directory hooks & event debouncing |
| **Frontend Framework** | React 18.3, Vite 5.4, React Router DOM 6 | Single-Page Application (SPA), client-side routing |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React | SOC dark cyber defense design system, responsive UI |
| **Data Visualization** | Recharts 2.13 | Time-series line charts, risk meters, departmental bar charts |
| **On-Premise AI** | Ollama, LLaMA 3.2 3B/8B Model | Private, local incident analysis and policy recommendations |

---

*IntelliDLP Defense Architecture • Centralized Host-Client System Documentation*
