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

The full interactive docs are available at `http://127.0.0.1:8000/docs` when the server is running.

---

### `GET /`
Health check.

**Response `200`**
```json
{ "status": "ok", "message": "Family Tree API is running" }
```

---

### `POST /people`
Create a person. `place_of_birth` is optional.

**Request body**
```json
{
  "name": "Alice Smith",
  "date_of_birth": "1970-03-15",
  "place_of_birth": "London"
}
```

**Response `201`**
```json
{
  "id": "a1b2c3d4-0001-0001-0001-000000000001",
  "name": "Alice Smith",
  "date_of_birth": "1970-03-15",
  "place_of_birth": "London",
  "created_at": "2026-04-11"
}
```

**Response `400`** — date of birth in the future
```json
{ "detail": "Date of birth cannot be in the future." }
```

---

### `GET /people/`
List all people.

**Response `200`**
```json
[
  {
    "id": "a1b2c3d4-0001-0001-0001-000000000001",
    "name": "Alice Smith",
    "date_of_birth": "1970-03-15",
    "place_of_birth": "London",
    "created_at": "2026-04-11"
  }
]
```

---

### `GET /people/{person_id}`
Get one person by UUID.

**Response `200`** — same shape as a single person object above

**Response `404`**
```json
{ "detail": "Person not found" }
```

---

### `DELETE /people/{person_id}`
Delete a person and all their relationships.

**Response `200`**
```json
{
  "ok": true,
  "deleted_person_id": "a1b2c3d4-0001-0001-0001-000000000001",
  "deleted_relationships": 2
}
```

---

### `POST /relationships?parent_id={uuid}&child_id={uuid}`
Create a parent-child relationship. Both IDs are passed as query parameters.

**Example**
```
POST /relationships?parent_id=a1b2c3d4-0001-0001-0001-000000000001&child_id=a1b2c3d4-0002-0002-0002-000000000002
```

**Response `201`**
```json
{
  "parent_id": "a1b2c3d4-0001-0001-0001-000000000001",
  "child_id": "a1b2c3d4-0002-0002-0002-000000000002",
  "created_at": "2026-04-11"
}
```

**Response `400`** — validation failure (same shape for all rule violations)
```json
{ "detail": "Parent must be at least 15 years older than the child." }
```
```json
{ "detail": "Adding this relationship would create a cycle." }
```
```json
{ "detail": "Child already has 2 parents." }
```

---

### `DELETE /relationships/{parent_id}/{child_id}`
Remove a parent-child relationship.

**Response `200`**
```json
{ "ok": true }
```

**Response `404`**
```json
{ "detail": "Relationship not found" }
```

---

### `GET /tree`
Returns the full tree payload for frontend rendering — all people, all relationships, and root IDs (people with no parents).

**Response `200`**
```json
{
  "people": [
    {
      "id": "a1b2c3d4-0001-0001-0001-000000000001",
      "name": "Alice Smith",
      "date_of_birth": "1970-03-15",
      "place_of_birth": "London",
      "created_at": "2026-04-11"
    },
    {
      "id": "a1b2c3d4-0002-0002-0002-000000000002",
      "name": "Bob Smith",
      "date_of_birth": "2000-06-01",
      "place_of_birth": null,
      "created_at": "2026-04-11"
    }
  ],
  "relationships": [
    {
      "parent_id": "a1b2c3d4-0001-0001-0001-000000000001",
      "child_id": "a1b2c3d4-0002-0002-0002-000000000002",
      "created_at": "2026-04-11"
    }
  ],
  "root_ids": ["a1b2c3d4-0001-0001-0001-000000000001"]
}
```

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

## Data Model

Two tables are persisted in SQLite via SQLModel.

**`person`**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary key, generated on creation |
| `name` | string | Required |
| `date_of_birth` | date | Required; must not be in the future |
| `place_of_birth` | string | Optional |
| `created_at` | date | Set to today on insert |

**`relationship`**

| Column | Type | Notes |
|---|---|---|
| `parent_id` | UUID (FK → person.id) | Composite primary key |
| `child_id` | UUID (FK → person.id) | Composite primary key |
| `created_at` | date | Set to today on insert |

The composite primary key on `(parent_id, child_id)` enforces uniqueness at the database level — the same pair cannot be inserted twice.

**Relationships between tables:**

```
person 1 ──< relationship >── 1 person
(as parent)                   (as child)
```

A person can appear as `parent_id` in many rows and as `child_id` in at most 2 rows (enforced by application-level validation, not a DB constraint).

## Architecture Overview

```
┌─────────────────────────────────────────┐
│               Browser                   │
│                                         │
│  React + TypeScript (Vite)              │
│  ┌──────────────────────────────────┐   │
│  │ App.tsx                          │   │
│  │  ├── CreatePersonForm.tsx        │   │
│  │  ├── RelationshipCreateForm.tsx  │   │
│  │  └── FamilyTreeGraph.tsx         │   │
│  └──────────────────────────────────┘   │
│          │  Axios (api/client.ts)        │
└──────────┼──────────────────────────────┘
           │ HTTP/JSON  (port 5173 → 8000)
┌──────────┼──────────────────────────────┐
│          ▼                              │
│  FastAPI  (uvicorn, port 8000)          │
│  ┌──────────────────────────────────┐   │
│  │ app.py  — route handlers         │   │
│  │ validation.py — business rules   │   │
│  │ models.py — SQLModel schemas     │   │
│  │ database.py — session factory    │   │
│  └──────────────────────────────────┘   │
│          │  SQLModel / SQLAlchemy        │
│          ▼                              │
│  SQLite  (familytree.db)                │
└─────────────────────────────────────────┘
```

**Request flow:**
1. User submits a form in the browser.
2. `api/client.ts` sends an HTTP request to the FastAPI backend.
3. The route handler in `app.py` calls `validation.py` before any write.
4. On success, SQLModel persists the record to `familytree.db` and returns JSON.
5. On failure, a `400` with a `detail` message is returned and displayed inline on the form.

## Design Decisions

- **Primary key as `UUID` with `default_factory`** — allows creating a model instance in Python without an ID before persisting, keeping object construction clean and letting the database assign the ID on save.
- **BFS for cycle detection** — family trees tend to be wide rather than deep, so BFS explores the most likely nodes first and avoids unnecessary recursion depth.
- **Manual relationship deletion before person deletion** — SQLite does not enforce foreign key cascades by default. Deleting relationships explicitly before the person record keeps the database clean without requiring a pragma change.
- **Backend as source of truth** — all validation rules are enforced server-side. The frontend performs optional prechecks for UX only, so the API is safe to call directly.
- **Calendar-year age gap calculation** — using year arithmetic with a birthday check rather than approximate day counts avoids incorrect results on boundary dates and leap years.

## Where I Used AI

**Tool:** GitHub Copilot in VS Code, using OpenAI o4-mini (Codex) for planning and either o4-mini or Claude Haiku for implementation tasks.

**Why:** Copilot is integrated directly into the editor, which keeps the feedback loop tight — I can accept, reject, or edit suggestions inline without switching context. I used the planning-oriented model for reasoning through design decisions (e.g. cycle detection strategy, validation ordering) and the faster model for routine implementation (e.g. boilerplate, test cases, Swagger annotations).

**What I used it for:**
- Planning the overall architecture and validation rule ordering
- Generating the initial test suite structure for validation rules
- Generating the BFS cycle detection logic as a starting point, which I then reviewed and adapted
- Adding Swagger/OpenAPI documentation to endpoints
- Frontend layout assistance and finding the right Tailwind CSS classes
- Writing this README

## What I Would Do With More Time

- Split routes into separate router files as the API grows
- Dragging functionality for tree
- Bicep code for deployment
- API integration tests covering key endpoint behaviours (e.g. future DOB → 400, duplicate relationship → 400, tree shape after inserts)
- End-to-end tests with Playwright covering the full form → tree flow (create person, add relationship, verify tree renders)
- Structured logging (e.g. `structlog`) so request traces and validation errors are queryable in production
- Docker Compose so the full stack (backend + frontend) starts with a single `docker compose up`



