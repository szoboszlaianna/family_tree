from datetime import date

from sqlmodel import select, Session
from models import Person, Relationship

MINIMUM_PARENT_AGE_GAP_YEARS = 15
ONE_YEAR_DAYS = 365.25


def validate_not_self_relationship(parent_id, child_id):
    if parent_id == child_id:
        raise ValueError("A person cannot be their own parent.")


def validate_person_exists(person_id, session: Session):
    person = session.get(Person, person_id)
    if not person:
        raise ValueError(f"Person with id {person_id} does not exist.")
    return person  # needed for age check later


def validate_dob_not_in_future(date_of_birth: date) -> None:
    if date_of_birth > date.today():
        raise ValueError("Date of birth cannot be in the future.")


def validate_max_parents(child_id, session: Session):
    parents = session.exec(
        select(Relationship).where(Relationship.child_id == child_id)
    ).all()

    if len(parents) >= 2:
        raise ValueError("A child cannot have more than two parents.")


def validate_age_gap(parent: Person, child: Person) -> None:
    age_gap_days = (child.date_of_birth - parent.date_of_birth).days
    if age_gap_days < MINIMUM_PARENT_AGE_GAP_YEARS * ONE_YEAR_DAYS:
        raise ValueError(
            f"Parent must be at least {MINIMUM_PARENT_AGE_GAP_YEARS} years older than child."
        )


def validate_no_cycles(parent_id, child_id, session: Session):
    # BFS to check if child_id is an ancestor of parent_id
    to_visit = [parent_id]
    visited = set()
    while to_visit:
        current = to_visit.pop()
        if current == child_id:
            raise ValueError("Adding this relationship would create a cycle.")
        visited.add(current)

        # Get parents of current
        parents = session.exec(
            select(Relationship.parent_id).where(Relationship.child_id == current)
        ).all()
        for p in parents:
            if p not in visited:
                to_visit.append(p)


def validate_relationship(parent_id, child_id, session: Session):
    validate_not_self_relationship(parent_id, child_id)
    parent = validate_person_exists(parent_id, session)
    child = validate_person_exists(child_id, session)
    validate_age_gap(parent, child)
    validate_max_parents(child_id, session)
    validate_no_cycles(parent_id, child_id, session)
