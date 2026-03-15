# AGENTS.md - Timeslip

This document guides AI coding agents working in this repository.

## Project Summary
- Timeslip is a multi-platform app for recording work time entries and generating invoices.
- Frontend targets Expo for web, iOS, and Android from one React Native codebase.
- Backend uses Convex for data/functions and Better Auth for authentication.
- Styling should use Uniwind utility classes for new UI work.

## Primary Tech Stack
- Expo SDK 54 with Expo Router (`expo-router/entry`).
- React 19 + React Native 0.81.
- Convex (`convex` package) with generated API/types in `convex/_generated`.
- Better Auth + Convex integration via `@convex-dev/better-auth`.
- Uniwind + Tailwind CSS for RN-friendly utility-class styling.
- TypeScript with `strict: true`.

## Important Context
- Some current UI/routes are template or starter code.
- Do not overfit architecture decisions to temporary example screens.
- Prefer stable patterns that support Timeslip product requirements.

## Repository Layout
- `src/app/`: Expo Router routes and layouts (currently partly template).
- `src/components/`: Shared UI primitives and reusable components.
- `src/components/ui/`: Reusable design-system-style primitives intended for use across auth, landing, and authenticated app surfaces.
- `src/components/public/`: Components specific to the unauthenticated public shell (background, layout, status presentation, etc).
- `src/components/nav/`: Navigation components when navigation deserves its own namespace.
- `src/hooks/`: Shared hooks (`use-color-scheme`, `use-theme-color`, etc).
- `src/lib/`: Client integrations such as auth client setup.
- `src/constants/`: Shared constants/theme values.
- `convex/`: Backend schema, auth, HTTP routing, and Convex config.
- `assets/`: App icons/images.
- `global.css`: Uniwind/Tailwind CSS entrypoint.
- `metro.config.js`: Uniwind Metro integration.

## Commands
- Install: `pnpm install`
- Start dev server: `pnpm start`
- iOS: `pnpm ios`
- Android: `pnpm android`
- Web: `pnpm web`
- Lint: `pnpm lint`

## Environment Variables
- Local env file: `.env.local`
- Required values currently used by app/backend:
- `CONVEX_DEPLOYMENT`
- `EXPO_PUBLIC_CONVEX_URL`
- `EXPO_PUBLIC_CONVEX_SITE_URL`
- Never commit secrets or production credentials.

## Expo + Routing Conventions
- Use Expo Router file-based routing inside `src/app`.
- Keep route components focused; extract reusable UI into `src/components`.
- Keep provider setup in root layout (`src/app/_layout.tsx`) unless necessary.
- Respect existing deep link scheme (`app.timeslip://`) unless explicitly changing auth/linking behavior.

## Styling and UI Rules
- Use Uniwind class names for new styling work where feasible.
- Build reusable visual primitives in `src/components` (or `src/components/ui`).
- Put generic buttons, cards, inputs, notices, and similar building blocks in `src/components/ui` with reusable, non-feature-specific names.
- Reserve `public`-scoped components/files for unauthenticated-shell concerns only; do not prefix generic UI primitives with `public` if they may be reused in the app.
- Avoid one-off duplicated UI in route files; compose from shared components.
- Ensure mobile and web compatibility for all UI changes.
- Preserve light/dark mode behavior and theme-aware defaults.

## Forms
- Use `@tanstack/react-form` for new forms and when refactoring existing form state.
- Prefer form-managed field state over multiple per-field `useState()` hooks.

## Component Architecture
- Prefer small, composable, typed components.
- Keep business logic out of purely presentational components.
- Keep page-specific copy, composition, and form submission logic in route files unless it is clearly reusable.
- Move shared palette/theme hooks into `src/hooks` rather than colocating them inside component bundles.
- Use absolute imports via configured aliases (`@/*`, `@assets/*`).
- Follow existing TypeScript style and strict typing.

## Data and Backend Rules
- Source of truth for data model: `convex/schema.ts`.
- Current core tables: `clients`, `projects`, `tasks`, `invoices`, `paymentInstructions`.
- Prefer adding indexes/queries/mutations/actions deliberately, matching product flows.
- Do not edit generated files under `convex/_generated`.
- Keep Convex auth wiring intact unless a task explicitly requires auth changes.

## Schema Overview (`convex/schema.ts`)
- `clients`: customer identity and billing contact info, with `user` owner and `archived` flag.
- `projects`: project records with `name`, `client` reference, and `archived` flag.
- `tasks`: time-entry-like records with `title`, optional `description`, `project` reference, optional `invoice` reference, `startAt`, optional `endAt`.
- `invoices`: billing documents with `amount`, optional `paidAt`, and `paymentInstruction` reference.
- `paymentInstructions`: sender/payment details used on invoices, tied to `user`.
- Key relationships:
- `projects.client -> clients._id`
- `tasks.project -> projects._id`
- `tasks.invoice -> invoices._id` (optional until billed)
- `invoices.paymentInstruction -> paymentInstructions._id`
- Ownership currently appears on `clients` and `paymentInstructions`; maintain consistent ownership checks in queries/mutations.

## Auth Rules
- Better Auth + Convex integration is configured in:
- `convex/auth.ts`
- `convex/auth.config.ts`
- `convex/http.ts`
- Client auth integration lives in `src/lib/auth-client.ts`.
- If changing auth flows, verify trusted origins and mobile scheme compatibility.

## Code Quality Expectations
- Write clear, minimal, maintainable code.
- Avoid large speculative refactors unless requested.
- Keep diffs scoped to the task.
- Add or update types as part of feature work.
- Lint should pass before finishing when possible.

## Safety and Change Discipline
- Do not delete unrelated files or rewrite broad areas without request.
- Treat template/example code as replaceable, but confirm before destructive resets.
- Do not modify app credentials, bundle IDs, or project IDs unless requested.

## Working Agreement for Agents
- Start by reading relevant files before editing.
- State assumptions when requirements are ambiguous.
- If a decision has long-term architecture impact, surface options and tradeoffs.
- When introducing new structure, keep names domain-focused (`time-entry`, `invoice`, `client`).

## Feature Direction (Timeslip Domain)
- Core user journey: authenticate -> track time -> manage clients/projects -> generate invoices.
- Model time tracking with clear start/end semantics and invoice linkage.
- Prioritize correctness for duration, totals, currency-ready invoice amounts, and ownership boundaries.
- Design with offline-tolerant/mobile-friendly UX in mind (Expo target platforms).

## Definition of Done (Per Task)
- Code compiles and lint is clean (or issues are explicitly documented).
- New UI uses reusable components and Uniwind-oriented styling.
- Data/auth changes align with Convex + Better Auth patterns in repo.
- Changes are scoped, typed, and understandable for future contributors.
