# GrantMatch NZ

A prototype that matches New Zealand students to scholarships they
actually qualify for, drafts tailored essays, and answers questions
grounded in the student's own uploaded profile.

Built per the original build spec: React + Vite + Tailwind frontend,
Node + Express backend, Groq API for extraction / essay drafting /
grounded Q&A.

## Project structure

```
grantmatch-nz/
├── backend/
│   ├── data/
│   │   ├── scholarships.js   # NZ scholarship demo database
│   │   └── students.js       # seeded demo student: Amara Okafor
│   ├── routes/
│   │   ├── profile.js        # upload/extract/confirm profile fields
│   │   ├── match.js           # eligibility-grounded matching
│   │   ├── essay.js           # tailored essay drafting (Groq)
│   │   ├── chat.js            # grounded Q&A chatbot (Groq)
│   │   └── progress.js        # application status tracking
│   ├── utils/
│   │   ├── matcher.js         # deterministic eligibility engine
│   │   └── groq.js            # Groq API client (with offline fallback)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/        # one component per feature tab
    │   ├── App.jsx
    │   ├── api.js              # fetch wrapper for backend routes
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Running it — 2 commands

```bash
npm install       # installs root + backend + frontend (npm workspaces)
npm run dev        # starts backend (:4000) and frontend (:5173) together
```

Then open `http://localhost:5173`. That's it.

Optional: `cp backend/.env.example backend/.env` and add a real
`GROQ_API_KEY` for live model calls. Without one, everything runs in
"offline demo mode" with deterministic seeded responses, so the app is
fully testable either way.

If you prefer running the two halves separately (e.g. for separate
logs), you still can:

```bash
npm run dev -w backend    # http://localhost:4000
npm run dev -w frontend   # http://localhost:5173
```

## Vision-corrected OCR on upload

On the **Profile intake** tab you can upload a real file — a photo of a
transcript, a PDF, or a plain text file — and the backend routes it
through the right pipeline before extracting structured fields:

| File type | Pipeline |
|---|---|
| Image (`image/*`) | Sent directly to a Groq **vision** model (`GROQ_VISION_MODEL`, default `meta-llama/llama-4-scout-17b-16e-instruct`) which OCRs the photo/scan into clean text. |
| PDF (`application/pdf`) | The embedded text layer is pulled with `pdf-parse` first, then that draft is passed to the model to correct OCR artifacts, broken line breaks, or misread characters. |
| Plain text (`text/*`) | Read directly — no OCR needed. |
| No file uploaded | Falls back to the seeded demo transcript so the flow is still testable. |

The corrected OCR text is shown in a collapsible "View corrected OCR
text" panel in the UI before the structured fields (GPA, major, etc.)
are extracted from it — and none of it is saved to the profile until
the student confirms each field, per the spec's non-negotiable rule.

## Demo data

Seeded student: **Amara Okafor**, Year 13, Wellington.

| Field | Value |
|---|---|
| GPA | 3.7 |
| Major | Computer Science |
| Extracurriculars | Robotics Club (Lead), Volunteer Tutoring |
| Volunteer hours | 62 |
| Financial need | High |
| First-in-family | *unconfirmed* |
| Gender | *unconfirmed* |

Seeded NZ scholarships:

| ID | Name | Requirement | Deadline |
|---|---|---|---|
| SCH-01 | STEM Merit Scholarship — NZ | GPA ≥ 3.5, STEM major | 15 Oct 2026 |
| SCH-02 | First-in-Family Leaders Grant | First-generation student | 1 Nov 2026 |
| SCH-03 | Community Impact Award | 50+ volunteer hours + partner institution | 30 Sep 2026 |
| SCH-04 | Women in Tech Aotearoa Fund | Female, CS/Engineering major | 20 Oct 2026 |

## Scholarship Query Studio (Query Service demo)

The project now includes a "Scholarship Query Studio" — a Snowflake-style
Query Service demo panel that surfaces the repo's seeded scholarship and
student data in a SQL-shaped results view. It is designed for panel demos
and does not require any external credentials to run.

Key points:

- The demo runs entirely from the repo's seeded data by default, so you can
  demo analytics and query-style outputs without a Snowflake account.
- The UI includes a student-id input (default `amara-okafor`) and a
  "Run Query" button; change the student id to see the result set update
  dynamically during the presentation.
- If you later want to point the same UI at a real warehouse, the backend
  exposes the same response shape and can be extended to run a live SQL
  query when `SNOWFLAKE_*` variables are present.

### Using the Scholarship Query Studio

The UI includes a `student-id` input (default `amara-okafor`) and a
`questions` field — a comma-separated list that controls which tables the
demo returns. Valid `questions` values are:

- `eligibility` — the eligibility result set (fit score, status, reason)
- `requirements` — a compact summary of each scholarship's requirements
- `student` — detailed student profile fields
- `analysis` — human-friendly insights per scholarship
- `all` — return every available table

Examples:

1) In the UI: change the student id and set `questions` (e.g. `eligibility,student`), then click **Run Query** to update results live.

2) From the command line (backend running on `localhost:4000`):

```bash
curl "http://localhost:4000/api/query-service?studentId=amara-okafor&questions=eligibility,student"
```

The backend returns a JSON payload with `sampleQuery`, `sampleQuestions`,
`sampleRows`, and an `extraTables` array — the UI renders each table in
`extraTables` so you can demonstrate different views on the same data.

### Optional Snowflake environment variables

If you want to connect a real Snowflake account later, set these in
the backend environment and extend the backend query path accordingly:

```bash
SNOWFLAKE_ACCOUNT=
SNOWFLAKE_USER=
SNOWFLAKE_PASSWORD=
SNOWFLAKE_WAREHOUSE=
SNOWFLAKE_DATABASE=
SNOWFLAKE_SCHEMA=
```

The default demo does not require the Snowflake CLI or Coco CLI; those
tools are only useful if you manage demo objects directly in a Snowflake
workspace outside this app.

## Demo walkthrough (matches the build spec's demo scenarios)

1. **Profile intake tab** — click "Run extraction" to simulate OCR + Groq
   pulling structured fields from the transcript. Unconfirmed fields
   (first-in-family, gender) show a "confirm now" prompt rather than
   being auto-trusted.
2. **Eligible matches tab** — SCH-01 and SCH-04 show as real matches
   with field-by-field cited reasoning. SCH-03 shows as "close" (hours
   met, institution unconfirmed). SCH-02 shows as "not eligible"
   because first-in-family is unconfirmed — never guessed.
3. **Essay drafts tab** — draft essays for SCH-01 / SCH-04, grounded
   only in confirmed profile fields, labelled "draft — needs your
   voice/edit."
4. **Grounded Q&A tab** — ask "am I eligible for the Community Impact
   Award?" and get an answer computed from the same deterministic
   matcher, with the exact field comparison cited.
5. **Deadline timeline tab** — shows SCH-03 as most urgent (30 Sep).
6. **Application progress tab** — update status per scholarship
   (not started / drafting / submitted).
7. **Scholarship Query Studio tab** — run interactive query-style demos that
  surface scholarship fit data for a student (change the student id and
  click "Run Query" to update results live). The view uses seeded demo
  data by default and can be pointed to a real warehouse later.

## Deploying to Vercel

The frontend (static Vite build) and backend (Express API) deploy as
**two separate Vercel projects** — that's the standard pattern for a
split frontend/backend repo like this one. Both are already configured
for it (`backend/vercel.json`, `backend/api/index.js`).

### 1. Deploy the backend

```bash
cd backend
vercel            # first deploy — follow the prompts
vercel --prod      # promote to production
```

Or via the Vercel dashboard: **New Project → Import** this repo, set
**Root Directory** to `backend`. Vercel will detect `vercel.json` and
build `api/index.js` as a serverless function that serves the whole
Express app (all `/api/*` routes).

Then set environment variables on the backend project
(**Project → Settings → Environment Variables**):

| Key | Value |
|---|---|
| `GROQ_API_KEY` | your real Groq key (optional — omit to run in offline demo mode) |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |
| `GROQ_VISION_MODEL` | `meta-llama/llama-4-scout-17b-16e-instruct` |

Copy the deployed URL, e.g. `https://grantmatch-nz-backend.vercel.app`.

### 2. Deploy the frontend

```bash
cd frontend
vercel
vercel --prod
```

Or via the dashboard: **New Project → Import**, **Root Directory**
set to `frontend`. Vercel auto-detects the Vite preset (build command
`npm run build`, output dir `dist`) — no config file needed.

Set one environment variable on the frontend project:

| Key | Value |
|---|---|
| `VITE_API_BASE_URL` | the backend URL from step 1, e.g. `https://grantmatch-nz-backend.vercel.app` |

Redeploy after adding it so the build picks it up
(`vercel --prod` again, or just push a commit if the project is
Git-linked).

### Notes

- Locally, none of this matters — `npm run dev` at the repo root still
  works exactly as before, with Vite's proxy forwarding `/api` to
  `localhost:4000`.
- The backend's CORS is wide open (`cors()` with no origin restriction),
  which is fine for this demo; tighten it to your frontend's exact
  origin before using this pattern for anything real.
- File uploads (Profile intake tab) work the same on Vercel — the
  serverless function receives the multipart upload in-memory via
  multer, same as local dev. Very large PDFs may hit Vercel's function
  payload/duration limits on the free tier.

## Non-negotiables enforced in code

- The eligibility engine (`backend/utils/matcher.js`) is fully
  deterministic — it is never given to the LLM to decide. The chatbot
  route computes eligibility first and only asks Groq to phrase the
  already-computed, cited result — so it structurally cannot fabricate
  a qualification.
- Unconfirmed profile fields are always treated as "cannot verify," never
  guessed or defaulted.
- Essay drafts and the extraction step always return a confirm/edit step
  before anything is treated as final.
