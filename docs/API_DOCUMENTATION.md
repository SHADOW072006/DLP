# IntelliDLP — REST & WebSocket API Documentation

## 1. Authentication & System Identity

### GET `/api/health`
- **Description**: Real-time heartbeat, active profiles, and JVM runtime metrics.
- **Access**: Public
- **Response**:
```json
{
  "success": true,
  "message": "IntelliDLP Backend is fully operational",
  "data": {
    "service": "intellidlp-backend",
    "status": "UP",
    "timestamp": "2026-10-30T13:30:00Z",
    "javaVersion": "25.0.2",
    "activeProfiles": ["dev"],
    "maxMemoryMb": 4096,
    "freeMemoryMb": 3812,
    "totalMemoryMb": 512
  }
}
```

### POST `/api/auth/login`
- **Description**: Authenticate user and issue signed JWT access token.
- **Access**: Public
- **Request Body**:
```json
{
  "username": "admin",
  "password": "SuperSecretPassword123!"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "username": "admin",
    "fullName": "SOC Administrator",
    "roles": ["ROLE_ADMIN"]
  }
}
```

---

## 2. File Discovery & Inspection

### POST `/api/files/upload`
- **Description**: Safe multipart upload, Apache Tika text & metadata extraction, SHA-256 calculation, and immediate pattern classification.
- **Access**: `ROLE_ANALYST`, `ROLE_ADMIN`
- **Request**: Multipart `file` (Supported: TXT, PDF, DOCX, CSV, XLSX, max 50MB)

### GET `/api/files`
- **Description**: List scanned documents with classification tier, hash, and detection summaries.
- **Access**: `ROLE_ANALYST`, `ROLE_ADMIN`

---

## 3. Sensitive Data Findings

### GET `/api/findings`
- **Description**: Query detected sensitive data tokens (Aadhaar, PAN, Credit Cards, Secrets) with redacted values and confidence scores.
- **Access**: `ROLE_ANALYST`, `ROLE_ADMIN`

---

## 4. DLP Policies & Simulation Mode

### GET `/api/policies`
- **Description**: Fetch all configured DLP policies and their current simulation state.
- **Access**: `ROLE_ANALYST`, `ROLE_ADMIN`

### POST `/api/policies`
- **Description**: Create or modify a DLP policy rule.
- **Access**: `ROLE_ADMIN`

### PUT `/api/policies/{id}/toggle-mode`
- **Description**: Toggle policy between safe simulation mode (`SIMULATION`) and authorized active enforcement (`ENFORCED`).
- **Access**: `ROLE_ADMIN`

---

## 5. Risk Scoring & Incident Management

### GET `/api/incidents`
- **Description**: Paginated incident feed with severity, risk score (0-100), and lifecycle status.
- **Access**: `ROLE_ANALYST`, `ROLE_ADMIN`

### PATCH `/api/incidents/{id}/status`
- **Description**: Transition incident status (`OPEN`, `INVESTIGATING`, `RESOLVED`, `FALSE_POSITIVE`).
- **Access**: `ROLE_ANALYST`, `ROLE_ADMIN`

### POST `/api/incidents/{id}/notes`
- **Description**: Add timestamped analyst investigation note.
- **Access**: `ROLE_ANALYST`, `ROLE_ADMIN`

---

## 6. Real-Time WebSocket Channel
- **Endpoint**: `/ws`
- **Protocols**: STOMP over SockJS
- **Topics**:
  - `/topic/events`: File system creation, modification, and rename events from Java WatchService.
  - `/topic/incidents`: Real-time alerts when high-risk policy matches are triggered.
  - `/topic/endpoints`: Live heartbeat pulses and health state changes.

