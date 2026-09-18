# NUMI — Digital Business OS

**Websites built to launch.**

Premium marketplace that sells finished website systems and delivers **real, isolated customer instances**.

**Version:** 4.1.0 — Ready-to-Run Edition

---

## The only manual step: `.env`

```bash
cp .env.example .env
# Fill DATABASE_URL, PUBLIC_APP_URL, JWT_SECRET, OAuth, and payment/GitHub/Vercel keys as needed.
```

You must **never** edit `.ts` / `.tsx` / SQL / routes / config source files to run NUMI.

---

## Setup & run

```bash
npm install
npm run setup       # migrations + idempotent seed + preflight report
npm run build
npm run start
```

Development:

```bash
npm run dev
```

Health: `GET /api/health`  
Admin → **System Truth** for live integration status.

---

## What each env group does

| Group | Purpose |
|-------|---------|
| Core | Database, public URL, JWT, OAuth |
| Payments | Stripe / Chargily / PayPal (at least one to sell) |
| GitHub + Vercel | Automatic private repo + deploy per purchase |
| Customer DB | Optional Neon/Supabase/PlanetScale isolation |
| Email | Optional Resend/Postmark/SMTP |
| AI | Optional FAQ assistant |
| Secrets | Optional AES encryption for stored customer secrets |

Missing optional providers → **NOT_CONFIGURED** (no crash, no fake success).

---

## Purchase → delivery (when fully configured)

1. Customer pays → webhook verifies amount server-side  
2. Order = PAID (never from frontend alone)  
3. Product version locked  
4. Customer instance row created  
5. GitHub private repo (exact version)  
6. Optional customer database  
7. Secrets generated  
8. Vercel project + env + deploy  
9. HTTP health check  
10. License + delivery access granted  

READY only if health + source + license evidence exist.

---

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run setup` | migrate + seed + preflight |
| `npm run preflight` | print READY / NOT_CONFIGURED / ERROR |
| `npm run db:migrate` | apply Drizzle migrations |
| `npm run db:seed` | seed categories/products (idempotent) |
| `npm test` | unit tests |
| `npm run check` | TypeScript check |
| `npm run build` / `npm run start` | production |

---

## Docs

- `docs/PRODUCTION-CHECKLIST.md`
- `docs/ARCHITECTURE.md`
- `docs/PROVISIONING.md`
- `docs/OPERATIONS.md`
- `docs/RECOVERY.md`
- `UPLOAD_STATUS.md` (if present)

---

## Stack

React · Vite · tRPC · Express · Drizzle · PostgreSQL / Supabase · Stripe / Chargily / PayPal · GitHub · Vercel
