# Livo — AI Pronunciation Scoring

A full-stack web app that scores spoken English pronunciation from a short audio clip, highlights the specific words that were unclear or mispronounced, and generates human-readable coaching feedback.

Built as a technical assessment for Livo AI (deadline: Sun, 12 July 2026).

**Live app:** https://livo-assestment.vercel.app
**API:** https://livo-server-production.up.railway.app
**Architecture doc:** [`docs/architecture.md`](./docs/architecture.md)

---

## How it works

1. Upload a 30–45 second English audio clip in the browser.
2. The clip is validated (format + duration) and queued for processing — the API returns immediately, it never blocks on transcription.
3. A background worker transcribes the audio (Deepgram), scores it against word-level confidence, and generates readable feedback (Groq/Llama 3.3).
4. The frontend polls for the result and displays an overall score, the transcript with mispronounced words highlighted, and coaching feedback.

Audio is never persisted — it's processed in memory and discarded once the job completes. See the architecture doc for the full DPDP compliance rationale.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + Tailwind v4 + shadcn/ui, deployed on Vercel |
| Backend API | Node.js + TypeScript + Express, deployed on Railway |
| Worker | Node.js + TypeScript + BullMQ, deployed on Railway (separate service) |
| Queue / Cache | BullMQ + Upstash Redis |
| Speech-to-text | Deepgram (Nova-3) |
| Feedback generation | Groq (Llama 3.3 70B) |
| Metrics | prom-client, exposed at `/metrics` |

---

## Repo structure

```
livo-pronunciation-app/
├── backend/          # API + worker (see backend/README or architecture.md)
├── frontend/         # Next.js app
└── docs/
    └── architecture.md
```

---

## Running locally

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in REDIS_URL, DEEPGRAM_API_KEY, GROQ_API_KEY
npm run dev:server     # terminal 1 — API on :3000
npm run dev:worker     # terminal 2 — worker process
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your backend URL
npm run dev                  # :3000 (or next available port)
```

---

## Known scope cuts

See the "Trade-offs & what I'd build next" section of [`docs/architecture.md`](./docs/architecture.md) for the full list and reasoning. Briefly:

- No self-hosted forced-alignment model — confidence-based flagging is the V1 scoring method
- No full Prometheus/Grafana deployment — `/metrics` endpoint only
- Browser-recorded Ogg/Opus audio isn't reliably duration-validated by the current library
- No resume-after-refresh on the frontend during processing