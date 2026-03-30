from fastapi import Depends, FastAPI, HTTPException
import uvicorn
from database import create_db_and_tables, get_session
from models import Person, PersonCreate
from sqlmodel import Session
from uuid import UUID

DATABASE_URL = "sqlite:///./family_tree.db"

app = FastAPI(
    title="Family Tree API",
    description="API for managing people and parent-child relationships in a simple family tree.",
    version="0.1.0",
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get(
    "/",
    tags=["System"],
    summary="Health check",
    description="Returns API health status.",
    response_description="Service status payload.",
)
def health() -> dict[str, str]:
    """Simple liveness endpoint used to verify the API is running."""
    return {"status": "ok", "message": "Family Tree API is running"}


@app.post(
    "/people",
    response_model=Person,
    status_code=201,
    tags=["People"],
    summary="Create a person",
    description="Creates a new person record in the family tree.",
    response_description="The created person.",
)
def create_person(person_data: PersonCreate, session: Session = Depends(get_session)):
    """Create and persist a person from request payload data."""
    person = Person(**person_data.model_dump())
    session.add(person)
    session.commit()
    session.refresh(person)
    return person


@app.get(
    "/people/{person_id}",
    response_model=Person,
    tags=["People"],
    summary="Get a person by ID",
    description="Fetches one person by UUID.",
    response_description="The matching person.",
)
def get_person(person_id: UUID, session: Session = Depends(get_session)):
    """Return one person, or 404 if the person does not exist."""
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person


@app.get(
    "/people/",
    response_model=list[Person],
    tags=["People"],
    summary="List people",
    description="Returns all people currently stored in the family tree database.",
    response_description="List of people.",
)
def list_people(session: Session = Depends(get_session)):
    """List all person records."""
    people = session.query(Person).all()
    return people


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
