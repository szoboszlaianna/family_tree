from typing import Annotated
from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./familytree.db"

# Required for SQLite in FastAPI: allows multi-threaded access.
connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
