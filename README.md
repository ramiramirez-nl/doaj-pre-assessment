<div align="center">

# DOAJ Pre-Assessment Tool

**Check whether your journal meets DOAJ indexing requirements, before you submit the formal application**

[![Node](https://img.shields.io/badge/Node-20%2B-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Languages](https://img.shields.io/badge/Languages-8-0A66C2)](#-languages)
[![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?logo=render&logoColor=black)](#-deploying-to-render)
[![License](https://img.shields.io/badge/License-MIT-blue)](#-license)

[What it does](#-what-it-does) · [Form steps](#-form-steps) · [How it works](#-how-it-works) · [Quick Start](#-quick-start) · [Configuration](#-configuration) · [Deploy](#-deploying-to-render) · [Tests](#-tests)

</div>

---

## 🎯 What it does

Applying to DOAJ means answering dozens of questions and pointing to pages that must contain
specific statements. A missing open access statement or an inconsistent licence is easy to
overlook and costs weeks in review.

This tool runs that check up front. You fill in an 8-step form with your journal's URLs and
metadata. The tool then:

1. Visits and reads the pages you provided (open access statement, licence page, editorial board, and more)
2. Asks an AI model whether each page actually contains the required content
3. Checks ISSN registration at [issn.org](https://www.issn.org)
4. Produces a report with **pass / warning / fail** for each DOAJ criterion, a suggestion for each gap, and a link to the matching DOAJ guidance

A typical run takes 30 to 90 seconds. Results stream in live, section by section.

> [!IMPORTANT]
> **Independent project.** This tool is not affiliated with, endorsed by, or operated by DOAJ. A
> positive outcome does not guarantee acceptance. The DOAJ editorial team makes the final decision
> under the guidelines at [doaj.org/apply/guide](https://doaj.org/apply/guide/).

> [!NOTE]
> **Stateless by design.** There is no database, no account, and no stored report. Every session
> is independent.

---

## 📋 Form steps

| Step | What it checks |
| ---- | -------------- |
| 1. Open Access | OA definition compliance, embargo, OA statement URL |
| 2. About | Journal title, homepage, ISSN registration |
| 3. Copyright | Licence type, author rights retention, consistency across pages and PDFs |
| 4. Editorial | Peer review policy, plagiarism screening, editorial board, endogeny |
| 5. Ethics | Publication ethics statement, retractions policy, conflicts of interest, misleading metrics |
| 6. Business Model | APC fees and waivers |
| 7. Best Practice | Long-term archiving, persistent identifiers (DOIs) |
| 8. Review & Submit | Summary before running the assessment |

Status mapping: `fail` is a hard DOAJ requirement that is not met, `warning` is a best practice
or an unverifiable item, `pass` is a requirement met. An inaccessible URL is always a `warning`,
never a `fail`, because journal sites often block automated requests by region.

---

## ⚙️ How it works

```text
React form  ->  POST /api/assess  ->  7 validators in parallel  ->  streamed report
 (8 steps)      (Zod-validated)       scrape + AI + ISSN lookup     (SSE or plain JSON)
```

- **Scraping:** Axios and Cheerio, with a browser User-Agent and SSRF protection on every redirect hop
- **AI analysis:** any OpenAI-compatible chat completions endpoint, with a structured JSON verdict (`found`, `confidence`, `evidence`, `issues`)
- **Resilience:** one retry on transient failures, 24-hour in-memory caching for scrapes, AI results, and ISSN lookups
- **Live progress:** the server streams each section as soon as its validator finishes, with a plain JSON fallback

---

## 🧰 Tech stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, React Hook Form |
| Backend | Express.js, TypeScript, Zod, Helmet |
| AI analysis | OpenAI-compatible REST API (configurable endpoint and model) |
| Web scraping | Axios, Cheerio |
| i18n | react-i18next |
| Testing | Vitest, Supertest |
| Deploy | Render.com (free tier, Frankfurt) |

---

## 🌍 Languages

English, Turkish, German, Spanish, French, Arabic, Indonesian, and Chinese. Arabic renders
right-to-left, including the downloadable HTML report.

---

## 🚀 Quick Start

Requires Node.js 20 or newer and an API key for an OpenAI-compatible endpoint.

```bash
# Terminal 1: backend (port 3001)
cd backend
npm install
cp .env.example .env   # add your API key
npm run dev
```

```bash
# Terminal 2: frontend (port 5173, proxies /api/* to :3001)
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🔧 Configuration

Create `backend/.env` (never commit this file):

```env
OPENAI_API_KEY=your-api-key       # required for AI content checks
OPENAI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-flash
PORT=3001
NODE_ENV=development
```

| Variable | Default | Purpose |
| -------- | ------- | ------- |
| `OPENAI_API_KEY` | none | API key for the AI provider |
| `OPENAI_BASE_URL` | `https://api.freemodel.dev/v1` | Any OpenAI-compatible endpoint |
| `AI_MODEL` | `gpt-4o-mini` | Model name at that endpoint |
| `PORT` | `3001` | Backend port |

Without `OPENAI_API_KEY` the tool still runs. AI content analysis is skipped and reported as a
warning, while URL accessibility and ISSN checks keep working.

---

## 🏗 Building for production

```bash
npm run build   # frontend/dist + backend/dist
npm start       # backend serves the frontend as static files
```

Health check: `GET /health` returns `{ "status": "ok" }`.

---

## ☁️ Deploying to Render

1. Fork this repository
2. Create a **Web Service** on [render.com](https://render.com) and connect your fork
3. Render reads `render.yaml`, which pre-configures region, Node version, build and start commands, and the non-secret variables
4. Add `OPENAI_API_KEY` in the Render dashboard (it is marked `sync: false` and must stay out of `render.yaml`)

`OPENAI_BASE_URL` and `AI_MODEL` live in `render.yaml`. Change them there to switch provider.

---

## 🧪 Tests

```bash
cd backend && npm run typecheck && npm test
cd frontend && npm run typecheck && npm test
```

Coverage includes the validators (with the AI client and scraper mocked), retry and cache utilities,
the SSRF allow and block list, both response paths of `/api/assess`, and a guard that keeps all
eight locales on the same translation keys. CI runs both suites on every push and pull request.

---

## 📄 License

MIT
