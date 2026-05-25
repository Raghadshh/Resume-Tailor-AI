# Resume Tailor AI

Paste a job description and get a tailored resume in seconds using AI.

- Stores your profile data in `profile_bank.json`
- Sends your profile + job description to OpenAI
- Generates a resume matching the role

Built with FastAPI + OpenAI + vanilla JS frontend.

## Structure

```
├── backend/          # FastAPI server
├── frontend/         # Web UI (HTML/CSS/JS)
├── data/             # Profile, templates, samples
└── README.md
```

## Run

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Visit `http://127.0.0.1:8000`.
