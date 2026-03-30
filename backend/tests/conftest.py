# backend/tests/conftest.py

import sys
import os

# Add the backend directory to Python's path
# so tests can import models, validation etc.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from sqlmodel import SQLModel, create_engine, Session

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(name="session")
def session_fixture():
    """Fixture that provides a clean test database session for each test."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
