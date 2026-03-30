from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException
import uvicorn
from sqlalchemy.exc import IntegrityError
from database import create_db_and_tables, get_session
from models import Person, PersonCreate, Relationship, TreeView
from sqlmodel import Session, select
from uuid import UUID
from validation import validate_dob_not_in_future, validate_relationship

DATABASE_URL = "sqlite:///./family_tree.db"


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="Family Tree API",
    description="API for managing people and parent-child relationships in a simple family tree.",
    version="0.1.0",
    lifespan=lifespan,
)


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
    try:
        validate_dob_not_in_future(person_data.date_of_birth)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
    people = session.exec(select(Person)).all()
    return people


@app.delete(
    "/people/{person_id}",
    tags=["People"],
    summary="Delete a person",
    description=(
        "Deletes a person by UUID. Any parent-child relationships where this person is "
        "a parent or child are deleted first."
    ),
    response_description="Deletion outcome including deleted relationship count.",
)
def delete_person(person_id: UUID, session: Session = Depends(get_session)):
    """Delete a person and any related relationships."""
    person = session.get(Person, person_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    # Delete their relationships first to avoid orphaned records
    relationships = session.exec(
        select(Relationship).where(
            (Relationship.parent_id == person_id) | (Relationship.child_id == person_id)
        )
    ).all()
    for rel in relationships:
        session.delete(rel)

    session.delete(person)
    session.commit()
    return {
        "ok": True,
        "deleted_person_id": str(person_id),
        "deleted_relationships": len(relationships),
    }


@app.post("/relationships", response_model=Relationship)
def create_relationship(
    parent_id: UUID, child_id: UUID, session: Session = Depends(get_session)
):
    existing_relationship = session.get(Relationship, (parent_id, child_id))
    if existing_relationship:
        raise HTTPException(
            status_code=400,
            detail="Relationship already exists between this parent and child.",
        )

    try:
        validate_relationship(parent_id, child_id, session)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    relationship = Relationship(parent_id=parent_id, child_id=child_id)
    session.add(relationship)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Relationship already exists between this parent and child.",
        )
    session.refresh(relationship)
    return relationship


@app.delete("/relationships/{parent_id}/{child_id}")
def delete_relationship(
    parent_id: UUID, child_id: UUID, session: Session = Depends(get_session)
):
    relationship = session.get(Relationship, (parent_id, child_id))
    if not relationship:
        raise HTTPException(status_code=404, detail="Relationship not found")
    session.delete(relationship)
    session.commit()
    return {"ok": True}


@app.get(
    "/tree",
    response_model=TreeView,
    tags=["Tree"],
    summary="Get family tree view",
    description=(
        "Returns all people and parent-child edges in one payload for frontend rendering. "
        "Includes root person IDs (people with no recorded parents)."
    ),
    response_description="Graph-friendly family tree payload.",
)
def get_tree(session: Session = Depends(get_session)):
    people = session.exec(select(Person)).all()
    relationships = session.exec(select(Relationship)).all()

    child_ids = {relationship.child_id for relationship in relationships}
    root_ids = [person.id for person in people if person.id not in child_ids]

    return TreeView(
        people=people,
        relationships=relationships,
        root_ids=root_ids,
    )


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
