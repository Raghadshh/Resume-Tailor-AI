# Resume Tailor AI

A full-stack tool that tailors your resume to a specific job description using AI. Store your profile data once, then generate targeted resume drafts for each application.

## How It Works

1. Store your resume/profile data in `data/profile_bank.json`
2. Paste a job description into the web UI
3. The backend sends your profile + the job description to OpenAI
4. A tailored resume is generated, highlighting the most relevant experience

## Project Structure

```
resume-tailor-ai/
├── backend/
│   ├── main.py              # FastAPI server with AI integration
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Your OpenAI API key (not committed)
│   └── .env.example         # Template for .env
├── frontend/
│   ├── index.html           # Web UI
│   ├── script.js            # Frontend logic
│   └── style.css            # Styling
├── data/
│   ├── profile_bank.json    # Your resume/profile data
│   ├── resume_template.txt  # Optional output format template
│   └── sample_job_description.txt
└── README.md
```

## Setup

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Add your OpenAI API key

Copy the env template and add your key:

```bash
cp .env.example .env
```

Then edit `.env` and set your key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 3. Populate your profile

Edit `data/profile_bank.json` with your real education, skills, experience, and projects.

### 4. Run the backend

```bash
cd backend
uvicorn main:app --reload
```

The API starts at `http://127.0.0.1:8000`.

### 5. Open the app

Visit **http://127.0.0.1:8000** in your browser. Paste a job description and click **Tailor Resume**.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api` | Health check |
| GET | `/api/profile` | Returns stored profile data |
| POST | `/api/analyze-job` | Accepts `{"job_description": "..."}`, returns tailored resume |
| GET | `/docs` | Interactive API documentation (Swagger UI) |
