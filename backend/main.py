from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pathlib import Path
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Resume Tailor AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "profile_bank.json"
TEMPLATE_PATH = Path(__file__).resolve().parent.parent / "data" / "resume_template.txt"


class JobRequest(BaseModel):
    job_description: str


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/")
def home():
    return {"message": "Resume Tailor AI backend is running"}


@app.get("/profile")
def get_profile():
    try:
        return load_json(DATA_PATH)
    except FileNotFoundError:
        return {"error": "Profile data not found"}
    except json.JSONDecodeError:
        return {"error": "Profile data is corrupted"}


@app.post("/analyze-job")
def analyze_job(request: JobRequest):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"error": "OPENAI_API_KEY not set. Create a .env file with your key."}

    try:
        profile = load_json(DATA_PATH)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"error": "Profile data unavailable"}

    try:
        with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
            template = f.read()
    except FileNotFoundError:
        template = ""

    sections = []
    if profile.get("education"):
        sections.append(f"EDUCATION:\n" + "\n".join(
            f"- {e.get('degree', '')} at {e.get('school', '')} ({e.get('year', '')})"
            for e in profile["education"]
        ))
    if profile.get("skills"):
        sections.append("SKILLS:\n" + ", ".join(profile["skills"]))
    if profile.get("experience"):
        sections.append("EXPERIENCE:\n" + "\n".join(
            f"- {e.get('role', '')} at {e.get('company', '')} ({e.get('years', '')})\n"
            f"  {e.get('description', '')}"
            for e in profile["experience"]
        ))
    if profile.get("projects"):
        sections.append("PROJECTS:\n" + "\n".join(
            f"- {p.get('name', '')}: {p.get('description', '')}"
            for p in profile["projects"]
        ))

    profile_text = "\n\n".join(sections)
    personal = profile.get("personal", {})
    header = f"{personal.get('name', '')}"
    if personal.get("email"):
        header += f" | {personal['email']}"
    if personal.get("linkedin"):
        header += f" | {personal['linkedin']}"
    if personal.get("github"):
        header += f" | {personal['github']}"

    prompt = f"""You are a professional resume writer. Tailor the candidate's profile to the given job description.

CANDIDATE:
{header}

{profile_text}

{"TEMPLATE FORMAT:\n" + template if template else ""}

JOB DESCRIPTION:
{request.job_description}

Generate a complete, well-formatted resume tailored to this job. Highlight the most relevant experience, skills, and projects. Use strong action verbs and quantify achievements where possible. Only use information from the candidate's profile — do not fabricate anything."""

    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        generated = response.choices[0].message.content
        return {"resume": generated}
    except Exception as e:
        return {"error": f"AI generation failed: {str(e)}"}
