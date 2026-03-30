import pytest
from datetime import date, timedelta
from uuid import uuid4
from models import Person, Relationship
from validation import (
    validate_age_gap,
    validate_dob_not_in_future,
    validate_not_self_relationship,
    validate_max_parents,
    validate_person_exists,
    validate_no_cycles,
)


def make_person(session, name: str, dob: date) -> Person:
    """Helper to create and persist a person in the test DB."""
    person = Person(name=name, date_of_birth=dob)
    session.add(person)
    session.commit()
    session.refresh(person)
    return person


def make_relationship(session, parent: Person, child: Person) -> Relationship:
    """Helper to create and persist a relationship in the test DB."""
    rel = Relationship(parent_id=parent.id, child_id=child.id)
    session.add(rel)
    session.commit()
    return rel


# ─── validate_not_self_relationship ─────────────────────────────────────────


def test_self_relationship_raises():
    same_id = uuid4()
    with pytest.raises(ValueError):
        validate_not_self_relationship(same_id, same_id)


def test_different_ids_passes():
    validate_not_self_relationship(uuid4(), uuid4())  # should not raise


# ─── validate_age_gap ───────────────────────────────────────────────────────
def test_age_gap_exactly_15_passes():
    parent = Person(name="A", date_of_birth=date(1980, 1, 1))
    child = Person(name="B", date_of_birth=date(1995, 1, 1))
    validate_age_gap(parent, child)  # should not raise


def test_age_gap_under_15_raises():
    parent = Person(name="A", date_of_birth=date(1980, 1, 1))
    child = Person(name="B", date_of_birth=date(1990, 1, 1))
    with pytest.raises(ValueError):
        validate_age_gap(parent, child)


def test_age_gap_leap_year_parent():
    parent = Person(name="A", date_of_birth=date(1980, 2, 29))
    child = Person(name="B", date_of_birth=date(1995, 3, 1))
    validate_age_gap(parent, child)  # should not raise


def test_age_gap_boundary_not_yet_passed():
    parent = Person(name="A", date_of_birth=date(1980, 12, 31))
    child = Person(name="B", date_of_birth=date(1995, 1, 1))
    with pytest.raises(ValueError):  # only 14 years and 1 day
        validate_age_gap(parent, child)


def test_dob_today_passes():
    validate_dob_not_in_future(date.today())


def test_dob_future_raises():
    with pytest.raises(ValueError):
        validate_dob_not_in_future(date.today() + timedelta(days=1))


# ─── test max parents ─────────────────────────────────────────


def test_max_parents_exceeded(session):
    child = make_person(session, "Child", date(2000, 1, 1))
    parent1 = make_person(session, "Parent1", date(1970, 1, 1))
    parent2 = make_person(session, "Parent2", date(1975, 1, 1))

    make_relationship(session, parent1, child)
    make_relationship(session, parent2, child)

    with pytest.raises(ValueError):
        validate_max_parents(child.id, session)


def test_max_parents_not_exceeded(session):
    child = make_person(session, "Child", date(2000, 1, 1))
    parent1 = make_person(session, "Parent1", date(1970, 1, 1))

    make_relationship(session, parent1, child)

    validate_max_parents(child.id, session)  # should not raise


# ─── validate person exist ─────────────────────────────────────────


def test_validate_person_exists(session):
    person = make_person(session, "Test Person", date(1990, 1, 1))
    retrieved = validate_person_exists(person.id, session)
    assert retrieved.id == person.id


def test_validate_person_not_exists(session):
    non_existent_id = uuid4()
    with pytest.raises(ValueError):
        validate_person_exists(non_existent_id, session)


# ─── validate_no_cycle ──────────────────────────────────────────────────────


def test_no_cycle_simple_valid(session):
    """A → B exists, adding C → B should pass"""
    a = make_person(session, "A", date(1960, 1, 1))
    b = make_person(session, "B", date(1980, 1, 1))
    c = make_person(session, "C", date(1961, 1, 1))
    make_relationship(session, a, b)
    # Should not raise
    validate_no_cycles(c.id, b.id, session)


def test_direct_cycle(session):
    """A → B exists, adding B → A should fail"""
    a = make_person(session, "A", date(1960, 1, 1))
    b = make_person(session, "B", date(1980, 1, 1))
    make_relationship(session, a, b)
    with pytest.raises(ValueError):
        validate_no_cycles(b.id, a.id, session)


def test_longer_chain_cycle(session):
    """A → B → C exists, adding C → A should fail"""
    a = make_person(session, "A", date(1950, 1, 1))
    b = make_person(session, "B", date(1970, 1, 1))
    c = make_person(session, "C", date(1990, 1, 1))
    make_relationship(session, a, b)
    make_relationship(session, b, c)
    with pytest.raises(ValueError):
        validate_no_cycles(c.id, a.id, session)


def test_deeper_chain_cycle(session):
    """A → B → C → D exists, adding D → A should fail"""
    a = make_person(session, "A", date(1940, 1, 1))
    b = make_person(session, "B", date(1960, 1, 1))
    c = make_person(session, "C", date(1980, 1, 1))
    d = make_person(session, "D", date(2000, 1, 1))
    make_relationship(session, a, b)
    make_relationship(session, b, c)
    make_relationship(session, c, d)
    with pytest.raises(ValueError):
        validate_no_cycles(d.id, a.id, session)


def test_deeper_chain_no_cycle(session):
    """A → B → C → D exists, adding E → D should pass"""
    a = make_person(session, "A", date(1940, 1, 1))
    b = make_person(session, "B", date(1960, 1, 1))
    c = make_person(session, "C", date(1980, 1, 1))
    d = make_person(session, "D", date(2000, 1, 1))
    e = make_person(session, "E", date(1979, 1, 1))
    make_relationship(session, a, b)
    make_relationship(session, b, c)
    make_relationship(session, c, d)
    # Should not raise
    validate_no_cycles(e.id, d.id, session)
