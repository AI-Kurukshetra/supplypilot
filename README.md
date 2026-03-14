# SupplyPilot

SupplyPilot is a production-minded SaaS scaffold for supply chain visibility and exception management. It includes a Next.js App Router frontend, Supabase-ready schema and RLS, a customer-safe portal, seeded demo data, and Vercel-oriented deployment defaults.

## Included

- Auth pages for sign in, sign up, sign out, and organization onboarding
- Multi-tenant internal operations workspace with:
  - dashboard
  - shipments list
  - shipment detail
  - exceptions
  - customers
  - carriers
  - reports
  - documents
  - settings
- Customer-facing tracking portal
- Demo data and demo-mode fallback for local product iteration
- Supabase schema, RLS policies, Storage bucket setup, and SQL seed file
- Resend notification plumbing

## Architecture notes

- `src/lib/domain`: typed domain models, demo data, and query functions that keep page code thin
- `src/lib/crud`: reusable entity configuration and data-access helpers for the admin workspace
- `src/components/app`: app-shell primitives such as header, navigation, flash messaging, notifications, and operational UI
- `src/lib/search-params.ts`: shared search-param parsing for route-level status/message handling

The codebase is organized so that pages focus on composition, while domain logic and reusable UI stay in dedicated layers.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create local env:

```bash
cp .env.example .env.local
```

3. For the quickest runnable setup, keep `SUPPLYPILOT_DEMO_MODE=true`.

4. Start the app:

```bash
npm run dev
```

## Linking a hosted Supabase project

1. Put your real hosted values into `.env.local`.
2. Authenticate the CLI:

```bash
npm run supabase:login
```

3. Link this repo to your hosted project:

```bash
npm run supabase:link -- --project-ref your-project-ref
```

4. Push the migration:

```bash
npm run supabase:db:push
```

5. If you want to replay the seed against the linked database:

```bash
npm run supabase:db:seed
```

6. Bootstrap the seeded demo users into Supabase Auth:

```bash
npm run supabase:bootstrap-demo-auth
```

This links the seeded profiles to real `auth.users` accounts. The shared demo password is `SupplyPilotDemo123!`.

## Supabase setup

1. Create a Supabase project.
2. Apply the schema in [20260314153000_initial_schema.sql](/Users/apple/suuplypilot/supabase/migrations/20260314153000_initial_schema.sql).
3. Run the seed script in [seed.sql](/Users/apple/suuplypilot/supabase/seed.sql).
4. Set these env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Resend setup

Set:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

The current notification plumbing lives in [resend.ts](/Users/apple/suuplypilot/src/lib/notifications/resend.ts).

## Deploying to Vercel

1. Push this project to a Git repository.
2. Import it into Vercel.
3. Set the same environment variables from `.env.local` in the Vercel project.
4. Keep `SUPPLYPILOT_DEMO_MODE=false` in real connected environments.
5. Deploy.

## Notes

- Demo mode is intentional: it keeps the app coherent and screenshot-ready while the real Supabase environment is still being provisioned.
- Prompt logging utilities created during setup are documented in [LOGGING_SETUP.md](/Users/apple/suuplypilot/LOGGING_SETUP.md).
