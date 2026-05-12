from fastapi import FastAPI
import json
from pathlib import Path

app = FastAPI()

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "profile_bank.json"

@app.get("/")
def home():
    return {"message": "Resume Tailor AI backend is running"}

@app.get("/profile")
def get_profile():
    with open(DATA_PATH, "r", encoding="utf-8") as file:
        profile = json.load(file)

    return profile