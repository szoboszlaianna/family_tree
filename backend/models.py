from datetime import date
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel


class PersonCreate(SQLModel):
    name: str
    date_of_birth: date
    place_of_birth: Optional[str] = None


class Person(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(nullable=False)
    date_of_birth: date = Field(nullable=False)
    place_of_birth: Optional[str] = Field(default=None)
    created_at: date = Field(default_factory=date.today, nullable=False)


class Relationship(SQLModel, table=True):
    parent_id: UUID = Field(foreign_key="person.id", primary_key=True, nullable=False)
    child_id: UUID = Field(foreign_key="person.id", primary_key=True, nullable=False)
    created_at: date = Field(default_factory=date.today, nullable=False)
