# Workflow Tracker

A full-stack app for tracking multi-stage workflows with a **Gantt-style timeline view**. Built with Spring Boot (backend) and React + Vite + Tailwind CSS (frontend).

---

## Features

- Create and manage workflows with multiple steps
- Step types: Requirement, Architecture, Design, Development, Implementation
- Track progress (0–100%) and assignees per step
- Set target and actual start/end dates per step
- **List view** — step-by-step progress overview
- **Timeline view** — Gantt chart plotting target vs actual dates on a shared date axis, color-coded by step type
- Comments on individual steps
- In-memory data store (no database required)

---

## Project Structure

```
workflow-tracker/
├── backend/   # Spring Boot REST API
└── frontend/  # React + Vite + Tailwind CSS
```

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+

---

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API will start on **http://localhost:8080**.

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will start on **http://localhost:5173**.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/workflows` | List all workflows |
| `POST` | `/api/workflows` | Create a workflow |
| `GET` | `/api/workflows/{id}` | Get a workflow |
| `PUT` | `/api/workflows/{id}` | Update a workflow |
| `DELETE` | `/api/workflows/{id}` | Delete a workflow |
| `PUT` | `/api/workflows/{id}/steps/{stepId}` | Update a step |
| `POST` | `/api/workflows/{id}/steps/{stepId}/comments` | Add a comment |
| `DELETE` | `/api/workflows/{id}/steps/{stepId}/comments/{commentId}` | Delete a comment |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Spring Boot 3.2, Java 17 |
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Data | In-memory (no database) |
