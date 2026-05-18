# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DOAJ Pre-Assessment Tool** is a web application that validates whether academic journals meet DOAJ (Directory of Open Access Journals) indexing requirements. It's a 7-step form that collects journal information and performs automated validation checks using web scraping and AI analysis.

### Key Goals
- Streamline DOAJ submissions by identifying compliance gaps early
- Provide actionable feedback on what needs to be fixed
- Support both Turkish and English users
- Stateless architecture (no persistence, single-session workflows)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for bundling and dev server
- **React Hook Form** for 7-step form state management
- **TailwindCSS** + `@tailwindcss/forms` for styling
- **i18next + react-i18next** for internationalization (TR/EN)
- **Axios** for API communication

### Backend
- **Express.js** with TypeScript
- **Gemini API** (Google's generative AI) for content analysis and verification
- **Cheerio** for HTML parsing
- **Axios** for HTTP requests (replaced Puppeteer—Render free tier can't run headless Chrome)
- **Helmet** for security headers
- **Vitest** for unit testing
- **Supertest** for HTTP endpoint testing

### Deployment
- **Render.com** (free tier, frankfurt region)
- Build: `npm run build` runs frontend, then backend TypeScript compilation
- Start: `node backend/dist/index.js`
- Health check: `GET /health`

## Architecture

### Form Structure (7 Steps)
1. **Open Access** - DOAJ OA definition compliance, license start date
2. **About** - Journal metadata (title, ISSN, languages, publisher)
3. **Copyright** - License type, embedding, author copyright retention
4. **Editorial** - Peer review types, plagiarism screening, submission time
5. **Business Model** - APCs, fees, waivers
6. **Best Practice** - Archiving, repository policy, persistent identifiers
7. **Review** - Summary before submission

### Data Flow
1. **Frontend** collects form data across 7 steps, validates locally with React Hook Form
2. **User submits** → `POST /api/assess` with complete FormData
3. **Backend** validates each section in parallel:
   - Runs all 6 validators concurrently: `Promise.all([validateOpenAccess(...), validateAbout(...), ...])`
   - Each validator checks links, scrapes content, calls Gemini API for AI analysis
   - Returns array of `ReportItem[]` with status (pass/fail/warning)
4. **Report aggregation** combines results, calculates overall status, identifies issues
5. **Frontend displays** ReportDashboard with passed/failed checks and suggestions

### Validator Pattern
Each validator module (`backend/src/validators/*.ts`) follows this pattern:
- Takes typed data (e.g., `OpenAccessData`)
- Returns `Promise<ReportItem[]>` with immediate results
- Performs parallel checks: URL accessibility, AI content analysis, metadata validation
- Status mapping: `fail` (hard requirement not met), `warning` (best practice), `pass` (requirement met)
- **Key detail**: URL inaccessibility is a `warning`, not `fail` (geo-blocking is common)

### Component Structure (Frontend)
- **App.tsx** - Root component, form orchestration, state via React Hook Form + `useMultiStepForm` hook
- **steps/** - 7 step components (StepOpenAccess, StepAbout, etc.), each manages its form section
- **Report/** - ReportDashboard (main view), SummaryBanner (pass/fail/warning counts), IssueCard (individual checks)
- **components/** - Reusable: Stepper, LinkField, LanguageSelector, FormStepper

## Common Development Tasks

### Running Locally

```bash
# Terminal 1 - Frontend dev server (port 5173)
cd frontend && npm install && npm run dev

# Terminal 2 - Backend dev server (watches src/, compiles to dist/)
cd backend && npm install && npm run dev

# Browser: http://localhost:5173
```

**Note:** Backend runs on port 3001 (production) or via tsx watch (dev). Frontend dev server proxies to `http://localhost:3001/api/*`.

### Building for Production

```bash
# Root directory
npm run build

# Outputs:
# - frontend/dist/ (Vite build)
# - backend/dist/ (TypeScript compiled)
# Backend serves frontend dist as static files
```

### Testing

```bash
# Backend tests (Vitest)
cd backend && npm test                # Single run
cd backend && npm run test:watch      # Watch mode

# Example: Test a validator
npx vitest backend/src/validators/openAccess.test.ts
```

### Environment Setup

Backend requires:
```bash
# backend/.env (not in git)
GEMINI_API_KEY=sk-...
GEMINI_MODEL=gemini-2.0-flash  (or latest)
PORT=3001
NODE_ENV=development
```

Frontend has no secrets (all API calls go through backend CORS proxy).

## Key Implementation Details

### 1. Form Data Shape
All form sections map to TypeScript interfaces in `backend/src/types/formData.ts`:
- `FormData` is the root interface, contains 6 section-specific interfaces
- Frontend `types/form.types.ts` mirrors backend types for RPC safety
- React Hook Form uses `FormData` as generic parameter

### 2. Validator Orchestration
- `backend/src/validators/index.ts` imports 6 validators
- `runAllValidations()` executes all in parallel, combines results
- Overall status: `fail` if any fail, `warning` if any warning, otherwise `pass`
- Issues list filters to non-pass items for ReportDashboard

### 3. URL Validation & Scraping
- **pageScraper.ts** fetches URL, returns `{ accessible, content, statusCode }`
- Runs with real Chrome User-Agent (journal sites often geo-block or reject bots)
- Axios (not Puppeteer) because Render free tier can't run headless browsers
- Timeouts: 10s fetch timeout, 5s parse timeout

### 4. AI Content Analysis
- **geminiClient.ts** prompts Gemini with page content + validation question
- Example: "Does this page contain a CC license statement? Return only YES or NO"
- Gemini responses are parsed strictly; failures return `{ error: string }`
- Cost: ~1-2 API calls per validation run (reuses scraped content)

### 5. ISSN Verification
- **issnClient.ts** calls issn.org REST API
- Returns metadata: publisher, status, online/print classification
- Used in "About" validator to verify ISSN is registered and valid

### 6. Internationalization (i18n)
- i18next manages TR/EN translations
- Translation files: `frontend/src/i18n/locales/tr.json`, `en.json` (not in repo—use i18n.ts)
- Keys follow path-based naming: `app.title`, `steps.openAccess`, `nav.next`
- Language selector in header switches app-wide

### 7. Report Dashboard
- **ReportDashboard.tsx** displays final report
- **SummaryBanner** shows totals: X passed, Y failed, Z warnings, overall status color
- **IssueCard** renders each failed/warning check with message + suggestion
- Passed checks collapsed/toggled with "Show passed checks" button
- "Back to Review" button allows user to return to step 7 to edit answers

## Database & State Management

**No database.** Application is stateless:
- Form state lives in React Hook Form (memory only)
- Report generated on demand, not persisted
- Each submission is independent
- No user accounts, authentication, or session storage

For future features: consider adding localStorage for draft saving (opt-in) or server-side sessions if persistence is added.

## File Size & Code Style

Keep files under 400 lines. Current structure:
- Validators: 50-150 lines each (single responsibility)
- Components: 100-300 lines (one step or feature per file)
- Backend index: 52 lines (minimal, delegates to validators)
- AI/scraper modules: 50-100 lines (focused utilities)

## Adding New Features

### New Form Section
1. Create `StepNewSection.tsx` in `frontend/src/components/steps/`
2. Add to `STEP_KEYS` array in App.tsx
3. Create interface `NewSectionData` in `backend/src/types/formData.ts`
4. Add to `FormData` interface
5. Create `validateNewSection.ts` in `backend/src/validators/`
6. Import and add to `runAllValidations` Promise.all
7. Add translations to i18n locales

### New Validator Check
1. Add check logic to appropriate `backend/src/validators/*.ts` file
2. Return `ReportItem` with clear `message` and `suggestion`
3. Use `status: 'fail'` for hard DOAJ requirements, `'warning'` for best practices, `'pass'` for met requirements
4. Leverage existing utilities: `scrapeUrl()`, `analyzePageContent()`, `verifyIssn()`

## Security & Secrets

- **GEMINI_API_KEY** must be in backend/.env (never committed)
- Backend receives form input → must validate before scraping (prevent URL-based attacks)
- Helmet enabled for security headers
- CORS configured to allow frontend origin
- AI analysis uses page content, not user input directly (safer)

## Deployment (Render.com)

- Git push triggers Render build (watch main branch)
- Build command: `npm run build` (root)
- Start command: `node backend/dist/index.js` (serves frontend static + API)
- Health check: `GET /health` returns `{ status: 'ok' }`
- Environment: Set `GEMINI_API_KEY` in Render dashboard (not in render.yaml, marked `sync: false`)

## Testing Strategy

- Unit tests for validators (mock Gemini responses)
- Integration tests for `/api/assess` endpoint (supertest)
- E2E tests could use Playwright (not yet implemented)
- Currently: `npm test` in backend runs Vitest suite

## Performance Notes

- Form validation happens client-side (React Hook Form) before submit
- Backend validation is parallel (all 6 validators run concurrently)
- URL scraping bottleneck: ~2-5s per journal depending on site speed + Gemini latency
- Total assessment time: 10-20 seconds typical (mostly Gemini API + scraping)

## Known Limitations & Future Work

- No draft saving (each session starts fresh)
- No user feedback collection (one-way assessment)
- Report not exportable (HTML/PDF export not implemented)
- Gemini API costs scale with usage (consider caching for repeat submissions)
- No admin panel (form and criteria are hardcoded)
- AI content analysis is best-effort (may miss non-English statements or malformed pages)

## Related Files & References

- **notes.md** - Detailed DOAJ form structure, criteria, and validation rules
- **task_plan.md** - Historical project planning and phases
- **render.yaml** - Production deployment configuration
- **backend/.env.example** - Required environment variables template
- **frontend/src/i18n/index.ts** - i18n setup and language handling

---

*Last updated: 2026-04-28. Reflects commit 22bc608.*
