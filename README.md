## Family Tree Mini-Builder

This application is a family tree builder.

## Stack

- Backend: FastAPI, Pydantic, SQLModel
- Frontend: React
- Database: SQLite

## Core Features

- Create a person with name, date of birth, and optional place of birth
- Create and delete parent-child relationships
- Prevent invalid relationships with backend validation
- Delete a person and related relationships safely
- View the full family tree payload via one endpoint

## Validation Rules

- Date of birth is required and cannot be in the future
- A person can have at most 2 parents
- Parent must be at least 15 years older than child
- Self-parent relationships are blocked
- Cycles are blocked (a person cannot become their own ancestor)
- Duplicate parent-child relationships are blocked with a clear 400 error

## API Endpoints

- `GET /` health check
- `POST /people` create person
- `GET /people/` list people
- `GET /people/{person_id}` get person by ID
- `DELETE /people/{person_id}` delete person and related relationships
- `POST /relationships` create relationship
- `DELETE /relationships/{parent_id}/{child_id}` delete relationship
- `GET /tree` get people, relationships, and root IDs for tree rendering

## Run Locally

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1) Create environment files

Backend (optional with current default SQLite setup):

1. `cp backend/.env.example backend/.env`

Frontend:

1. `cp frontend/.env.example frontend/.env`

### 2) Run backend API

1. `cd backend`
2. `python3 -m pip install -r requirements.txt`
3. `python3 app.py`

Backend URLs:

- API base: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`

### 3) Run frontend

Open a new terminal:

1. `cd frontend`
2. `npm ci`
3. `npm run dev`

Frontend URL:

- `http://127.0.0.1:5173`

## Design Decisions

- **Primary key as `UUID` with `default_factory`** — allows creating a model instance in Python without an ID before persisting, keeping object construction clean and letting the database assign the ID on save.
- **BFS for cycle detection** — family trees tend to be wide rather than deep, so BFS explores the most likely nodes first and avoids unnecessary recursion depth.
- **Manual relationship deletion before person deletion** — SQLite does not enforce foreign key cascades by default. Deleting relationships explicitly before the person record keeps the database clean without requiring a pragma change.
- **Backend as source of truth** — all validation rules are enforced server-side. The frontend performs optional prechecks for UX only, so the API is safe to call directly.
- **Calendar-year age gap calculation** — using year arithmetic with a birthday check rather than approximate day counts avoids incorrect results on boundary dates and leap years.

## Where I Used AI

- Generating the initial test suite structure for validation rules
- Generating the BFS cycle detection logic as a starting point, which I then reviewed and adapted
- Adding Swagger/OpenAPI documentation to endpoints
- Frontend layout assistance and finding the right Tailwind CSS classes
- Documentation

## What I Would Do With More Time

- Split routes into separate router files as the API grows
- Dragging functionality for tree
- Bicep code for deployment
- API integration tests covering key endpoint behaviours (e.g. future DOB → 400, duplicate relationship → 400, tree shape after inserts)
- End-to-end tests with Playwright covering the full form → tree flow (create person, add relationship, verify tree renders)
- Structured logging (e.g. `structlog`) so request traces and validation errors are queryable in production
- Docker Compose so the full stack (backend + frontend) starts with a single `docker compose up`



