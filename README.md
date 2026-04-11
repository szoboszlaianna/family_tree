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

## What I Would Do With More Time

- Split routes into separate router files as the API grows
- Dragging functionality for tree
- Bicep code for deployment.



