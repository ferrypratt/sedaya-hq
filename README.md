# Sedaya HQ — Marketing Operations Web App

Internal operations platform for the Branding, Marketing & Research division of **PT Sedaya Property**, a subsidized-housing developer based in Medan and Deli Serdang, North Sumatra, Indonesia.

Built with a mobile-first philosophy for field officers and supervisors managing housing stock funnels, marketing activities, digital channel insights, editorial calendars, offline roadshows, and instant A4 PDF reporting.

---

## 🛠️ Stack & Architecture

- **Framework**: Next.js 16 (App Router), React 19, TypeScript (strict mode)
- **Styling & Design System**: Tailwind CSS v4 with custom `Clay` style reference design tokens (Warm Cream `#f9f8f6`, Paper White `#ffffff`, Sand hairline border `#dad4c8`, Ink Black `#000000`, Violet Pulse `#3859f9`, and Pill-shaped CTAs)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security + Supabase Auth)
- **Data Validation & Parsing**: Zod, Papaparse (CSV), read-excel-file (XLSX)
- **Data Visualization**: Recharts (Funnel metrics, historical channel trends)
- **Reporting**: `@react-pdf/renderer` (pure client-side on-demand generation, A4 portrait)
- **Timezone & Locale**: `Asia/Jakarta` (WIB), Indonesian formatting (`id-ID`), Monday week start

---

## 📦 Database Setup & Supabase Migrations

Migrations are stored as clean SQL files in `/supabase/migrations`. Apply them in sequence within your Supabase project's SQL Editor:

1. `supabase/migrations/20261012000001_initial_schema.sql`:
   - Creates all 14 database tables (`profiles`, `projects`, `unit_snapshots`, `kos_snapshots`, `daily_activities`, `marketing_plans`, `plan_items`, `evaluations`, `evaluation_items`, `content_items`, `channels`, `channel_insights`, `events`, `sales_support_requests`, `sosialisasi_assists`, `marketing_props`, `report_runs`).
   - Creates composite unique constraints and performance indexes on `date`, `pic_id`, `project_id`, and `channel_id`.
2. `supabase/migrations/20261012000002_rls_policies.sql`:
   - Enforces authenticated read-all access across the team.
   - Enforces write restrictions: Officers can only insert/modify their own rows (`pic_id = auth.uid()`), while Leaders hold full access.
3. `supabase/migrations/20261012000003_auth_triggers.sql`:
   - Configures automatic profile creation upon new user registration.
4. `supabase/seed.sql`:
   - Populates initial master projects (5 active housing projects, CozyKOS, 2 upcoming projects), 19 digital channels, and base snapshots as of 12 Oktober 2026.
   - Includes a snippet to promote Ferry Pratama's profile to `'leader'`.

---

## 👥 Users & Roles

Invite-only access with Supabase Auth:
- **Ferry Pratama** (`f1111111-1111-1111-1111-111111111111`): Leader / Supervisor (Full access to all data, master settings, and leader evaluations).
- **Ziyad** (`z2222222-2222-2222-2222-222222222222`): Senior Branding Officer.

To promote an account to Leader in Supabase SQL editor:
```sql
UPDATE public.profiles
SET role = 'leader', position = 'Supervisor / Leader'
WHERE id = '<auth-user-uuid>';
```

---

## 🏗️ Core Operational Rules

1. **Strict Inventory Integrity**:
   - Total unallocated inventory is computed as: `total_units - sum(status_counts)`.
   - **Samudera Residence** has 58 units accounted for out of 61 total units, producing an **Unallocated = 3** badge. Under no circumstance should the system automatically correct or hide this discrepancy.
2. **Channel Performance Monitoring**:
   - Digital channels span 5 platforms: Instagram (7), Website (2), Google Business Profile (7), YouTube (1), TikTok (1).
   - Insights support both 7-day and 30-day comparative period metrics with automated delta tracking.
3. **Strict Import Rejection**:
   - The `/import` module validates CSV and XLSX data via Zod. Invalid rows are strictly flagged with line-level error notes and rejected to ensure database consistency.

---

## 🚀 Running Locally

1. Clone repository and install dependencies:
   ```bash
   git clone https://github.com/ferrypratt/sedaya-hq.git
   cd sedaya-hq
   npm install
   ```

2. Copy environment template:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase project credentials.

3. Run development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. Run production build & lint checks:
   ```bash
   npm run lint
   npm run build
   ```

---

## 🌐 Deploy to Vercel

This repository is connected directly to GitHub (`ferrypratt/sedaya-hq`).
Pushing to the `main` branch automatically triggers Vercel deployments.

Configure the following Environment Variables in the Vercel Project Settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
