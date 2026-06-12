# DOAJ Pre-Assessment Tool

A self-service web application that checks whether an academic journal meets [DOAJ (Directory of Open Access Journals)](https://doaj.org) indexing requirements — before you submit a formal application.

> **Disclaimer:** This tool is not affiliated with DOAJ. A positive outcome does not guarantee acceptance. The DOAJ editorial team makes the final decision following the guidelines at [doaj.org/apply/guide](https://doaj.org/apply/guide/).

---

## What it does

Fill in a 8-step form with your journal's URLs and metadata. The tool then:

1. Visits and reads the pages you provided (open access statement, license page, editorial board, etc.)
2. Calls an AI model to verify whether each page actually contains the required content
3. Checks ISSN registration at [issn.org](https://www.issn.org)
4. Produces a report: **pass / warning / fail** for each DOAJ criterion, with suggestions

Typical run time: 30–90 seconds.

---

## Form steps

| Step | What it checks |
|------|---------------|
| 1. Open Access | OA definition compliance, embargo, OA statement URL |
| 2. About | Journal title, homepage, ISSN registration |
| 3. Copyright | License type, author rights retention, consistency across pages/PDFs |
| 4. Editorial | Peer review policy, plagiarism screening, editorial board, endogeny |
| 5. Ethics | Publication ethics statement, retractions policy, conflicts of interest, misleading metrics |
| 6. Business Model | APC fees and waivers |
| 7. Best Practice | Long-term archiving, persistent identifiers (DOIs) |
| 8. Review & Submit | Summary before running the assessment |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, react-hook-form |
| Backend | Express.js + TypeScript |
| AI analysis | OpenAI-compatible REST API (configurable endpoint) |
| Web scraping | Axios + Cheerio |
| i18n | react-i18next — English, Turkish, French, Spanish, German, Arabic, Indonesian, Chinese |
| Deploy | Render.com (free tier, Frankfurt) |

No database. The application is stateless — each session is independent.

---

## Running locally

### Prerequisites

- Node.js 20+
- An API key for an OpenAI-compatible LLM endpoint (e.g. OpenAI, or a compatible provider)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your API key
npm run dev            # watches src/, compiles to dist/, serves on :3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Vite dev server on :5173, proxies /api/* to :3001
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment variables

Create `backend/.env` (never commit this file):

```env
OPENAI_API_KEY=sk-...          # required — any OpenAI-compatible key
OPENAI_BASE_URL=https://api.openai.com/v1   # optional — defaults to freemodel.dev
AI_MODEL=gpt-4o-mini           # optional — model name for the endpoint above
PORT=3001                      # optional — defaults to 3001
NODE_ENV=development
```

If `OPENAI_API_KEY` is not set, the tool still runs but AI content analysis is skipped (URL accessibility checks still work).

---

## Building for production

```bash
# from the project root
npm run build
# outputs: frontend/dist/ + backend/dist/
# backend serves the frontend as static files
npm start
```

Health check endpoint: `GET /health` → `{ "status": "ok" }`

---

## Deploying to Render

1. Fork this repo
2. Create a new **Web Service** on [render.com](https://render.com), connect your fork
3. Build command: `npm run build`
4. Start command: `npm start`
5. Add environment variable `OPENAI_API_KEY` in the Render dashboard (do **not** put it in `render.yaml`)

The `render.yaml` in this repo pre-configures region, Node version, and non-secret env vars.

---

## Running tests

```bash
cd backend
npm test          # Vitest — unit tests for validators
npm run test:watch
```

---

## License

MIT
