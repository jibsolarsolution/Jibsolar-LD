# JIBSOLAR — LEADS Dashboard

Local lead monitoring and CSV export dashboard for JIB Solar rooftop enquiries.

## Technology Stack

- **Framework**: Next.js 16.3.3 (App Router)
- **UI Engine**: React 19.2.8
- **Language**: TypeScript 5.8.2
- **Database**: MongoDB (Mongoose 9.9.4)
- **Validation**: Zod 4.5.4
- **Date Handling**: `date-fns` 4.4.0 & `date-fns-tz` 3.2.0 (Asia/Kolkata wall-clock boundaries converted to UTC)

## Functional Features

- **Time Period Panel**: Always-visible date period filter (`Today (IST)`, `Last 7 Days`, `Custom Range` with exact calendar validation).
- **Summary Metrics**: 4 real-time metrics (Total Leads, With Attribution, Cities, Top Campaign).
- **Attribution Timeline**: Bounded aggregation pipelines for tracking campaign touchpoints (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`).
- **Inline Lead Details**: Accessible expandable row component with zero drawers.
- **CSV Export**: Capped at 1,000 rows with UTF-8 BOM (`\uFEFF`) and CSV formula injection protection.
- **Data Protection**: Private `no-store` headers, sanitized errors, zero PII logging, and no client IP / User-Agent exposure.

## Local Development Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Configure `MONGODB_URI` in `.env.local`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Quality & Build Commands

```bash
# Run ESLint (flat config)
npm run lint

# Type check
npx tsc --noEmit

# Production build
npm run build
```