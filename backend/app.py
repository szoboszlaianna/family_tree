from fastapi import FastAPI
import uvicorn
from database import create_db_and_tables

DATABASE_URL = "sqlite:///./family_tree.db"

app = FastAPI(title="Family Tree API")


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.get("/")
def health() -> dict[str, str]:
    return {"status": "ok", "message": "Family Tree API is running"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
