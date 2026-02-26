# Agnos Realtime Patient Intake

Realtime patient intake form with a synchronized staff monitoring dashboard.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Realtime Communication:** Socket.IO (WebSocket transport via custom Node server)

## Core Features

### 1) Patient Form (`/patient`)

- Collects all required intake fields:
  - First name, middle name (optional), last name
  - Date of birth, gender
  - Phone, email, address
  - Preferred language, nationality
  - Emergency contact (optional: name + relationship)
  - Religion (optional)
- Realtime validation using **Zod**
- Inline field-level errors
- Live form state indicator:
  - `Idle`
  - `Filling form`
  - `Submitted`
- Fully responsive for mobile and desktop

### 2) Staff Dashboard (`/staff`)

- Receives and renders each patient field in realtime
- Displays live status badge:
  - `Idle`
  - `Filling form`
  - `Submitted`
- Shows last updated timestamp and derived age from date of birth
- Responsive layout for smaller and larger screens

### 3) Realtime Synchronization

Socket events used:

- `patient:update` → broadcast latest partial/full form payload
- `patient:status` → broadcast patient state (`idle`, `typing`, `submitted`)
- `patient:submit` → broadcast submitted payload snapshot

## Run Locally

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000` (landing)
- `http://localhost:3000/patient`
- `http://localhost:3000/staff`

## Quality Checks

```bash
npm run lint
```

## Deployment

This project uses a custom `server.js` for Next.js + Socket.IO.

### Recommended platforms

1. **Render / Railway / Heroku** (recommended for persistent Node server)
2. **Vercel** (requires separate realtime backend strategy; raw Socket.IO server in same process is not ideal on serverless)

### Example production command

```bash
npm run build
npm run start
```

## Deliverables Checklist

- [ ] Repository URL: `PASTE_YOUR_REPO_URL`
- [ ] Live URL: `PASTE_YOUR_DEPLOYED_URL`
- [x] README with setup + feature details
- [x] Development planning document at `docs/development-plan.md`
