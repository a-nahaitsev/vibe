# Agent guide: Vibe project

This document helps AI agents work effectively with the codebase.

## Project overview

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4
- **Dev server:** Turbopack (`npm run dev`)
- **Validation:** Zod v4, Yup, Joi (each has a dedicated example page)
- **Forms:** react-hook-form (with zodResolver) on its own example page
- **Server state:** TanStack Query — tanstack-query-example; **tables:** TanStack Table — tanstack-table-example; **AI chat:** TanStack AI — tanstack-ai-example (streaming via `/api/chat`, requires `OPENAI_API_KEY` in `.env.local`)
- **Football Quiz:** Full quiz app at `/football-quiz` — daily, time attack, who-am-I, photo, career path, match history, leaderboards, leagues, 1v1 duel, prediction, profile, settings; mock data in `_lib`, reusable components in `@/components/quiz`; API routes `/api/quiz/daily`, `/api/quiz/random`
- **Toasts:** react-toastify
- **Testing:** Vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- **Utilities:** `clsx` + `tailwind-merge` via `cn()` in `src/lib/utils.ts`

## Directory structure

```
src/
├── app/                         # App Router routes
│   ├── layout.tsx               # Root layout (ToastProvider, metadata)
│   ├── page.tsx                 # Home / welcome page (links to all examples)
│   ├── globals.css              # Tailwind import + base styles
│   ├── zod-example/
│   │   └── page.tsx             # Manual form + Zod validation
│   ├── yup-example/
│   │   └── page.tsx             # Manual form + Yup validation
│   ├── joi-example/
│   │   └── page.tsx             # Manual form + Joi validation
│   ├── react-hook-form-example/
│   │   └── page.tsx             # react-hook-form + Controller + zodResolver
│   ├── tanstack-query-example/
│   │   └── page.tsx             # useQuery + useMutation (JSONPlaceholder)
│   ├── tanstack-table-example/
│   │   └── page.tsx             # useReactTable + sorting (JSONPlaceholder posts)
│   ├── tanstack-ai-example/
│   │   └── page.tsx             # useChat + streaming (OpenAI via TanStack AI)
│   ├── football-quiz/           # Football Quiz & Trivia app
│   │   ├── layout.tsx            # ThemeProvider, QuizNav
│   │   ├── page.tsx              # Dashboard / mode links
│   │   ├── _lib/                 # types, mock-data
│   │   ├── _components/           # ThemeProvider, QuizNav
│   │   ├── daily/ time-attack/ who-am-i/ photo-quiz/ career-path/ match-history/
│   │   ├── leaderboards/ leagues/ duel/ prediction/ profile/ settings/
│   │   └── ...
│   └── api/
│       ├── chat/
│       │   └── route.ts          # POST: chat() + toServerSentEventsResponse
│       └── quiz/
│           ├── daily/route.ts   # GET: daily questions by date
│           └── random/route.ts   # GET: random N questions
├── components/
│   ├── quiz/                     # Reusable quiz UI
│   │   ├── QuestionCard.tsx, AnswerOptions.tsx, Timer.tsx
│   │   ├── Leaderboard.tsx, StreakBadge.tsx, index.ts
│   │   └── ...
│   ├── QueryProvider.tsx       # QueryClientProvider (client)
│   ├── ToastProvider.tsx        # react-toastify container (client)
│   ├── ToastProvider.test.tsx
│   └── form/                    # One component per input type
│       ├── index.ts             # Barrel exports
│       ├── TextInput.tsx + .test.tsx
│       ├── EmailInput.tsx + .test.tsx
│       ├── NumberInput.tsx + .test.tsx
│       ├── UrlInput.tsx + .test.tsx
│       ├── TextareaInput.tsx + .test.tsx
│       ├── SelectInput.tsx + .test.tsx
│       └── CheckboxInput.tsx + .test.tsx
├── lib/
│   └── utils.ts                 # cn() helper
└── test/
    ├── setup.ts                 # jest-dom for Vitest
    └── utils.tsx                # Re-exports from Testing Library
```

## Path alias

- Use `@/*` for `./src/*` (e.g. `@/components/form`, `@/lib/utils`).

## Conventions

### Class names and `cn()`

- Use the `cn()` helper **only when** a `className` has conditionals or variables (e.g. different classes based on props/state). Do **not** use `cn()` for static strings.
  - **Use `cn()`:** `className={cn("flex items-center gap-2", showErrorBelow && "items-start")}` — has a condition.
  - **Do not use `cn()`:** `className="text-sm text-red-600"` or `className="min-h-screen p-8"` — static only.
  - When you need it: `import { cn } from "@/lib/utils";`

### Form inputs

- One component per input type; use them from `@/components/form`.
- Each form component accepts: `id`, `name`, `label`, `value`/`checked`, `onChange`, optional `error`, plus type-specific props (`placeholder`, `min`/`max`, `options`, `rows`, etc.). `CheckboxInput` also supports `showErrorBelow` for terms-style layout.
- Use plain `className={inputClass}` for static input/select/textarea classes. Use `cn()` only when adding conditional classes (e.g. error state).

### Zod (v4)

- Use Zod v4 API:
  - Error options: `{ error: "Message" }` or `message` (not `errorMap`, not `invalid_type_error`).
  - Regex: `.regex(/pattern/, { error: "Message" })`.
  - Validation failures: read `result.error?.issues` (not `.errors`); each issue has `path` and `message`.
- For literal/checkbox that must be `true`, use `z.literal(true, { error: "..." })`. Form state can still use `terms: boolean`; use a `FormState` type that allows `false` for initial state.

### Yup

- Example: `src/app/yup-example/page.tsx`. Use `yup.object()` and `schema.validate(payload, { abortEarly: false })` (async). On error, use `yup.ValidationError.isError(err)` and `err.inner` (each has `path` and `message`) to build field errors.

### Joi

- Example: `src/app/joi-example/page.tsx`. Use `Joi.object()` and `schema.validate(payload, { abortEarly: false })`. On error, use `result.error.details` (each has `path` array and `message`). Use `.messages({ "code": "Message" })` for custom messages; **do not** use `.message()` after `.valid()` (causes “Cannot apply rules to empty ruleset”). For `.valid()`, use `"any.only"` in `.messages()`.

### TanStack Query

- App is wrapped with `QueryProvider` in the root layout. Example: `src/app/tanstack-query-example/page.tsx`.
- **useQuery:** `queryKey` (e.g. `["posts", id]`), `queryFn` (async fetch), and options like `staleTime`. Use `data`, `isLoading`, `isError`, `error`, `refetch`, `isFetching`.
- **useMutation:** `mutationFn`, then `mutate(args)`. Use `isPending`, `isError`, `isSuccess`, `data`, `reset`. In `onSuccess`, call `queryClient.invalidateQueries({ queryKey })` to refetch related queries.
- Centralize query keys (e.g. `postKeys.detail(id)`) for cache and invalidation.

### TanStack Table

- Example: `src/app/tanstack-table-example/page.tsx`. Headless table: you render the `<table>`; the library manages state.
- **createColumnHelper&lt;T&gt;()** — build typed columns with `.accessor("field", { header, cell, enableSorting })`.
- **useReactTable({ data, columns, state: { sorting }, onSortingChange, getCoreRowModel(), getSortedRowModel() })** — then use `table.getHeaderGroups()`, `table.getRowModel().rows`, and **flexRender(cell.column.columnDef.cell, cell.getContext())** for each header/cell.
- Optional: getFilteredRowModel, getPaginationRowModel, etc., from `@tanstack/react-table`.

### TanStack AI

- Example: `src/app/tanstack-ai-example/page.tsx`. **Client:** `useChat({ connection: fetchServerSentEvents("/api/chat") })` — returns `messages`, `sendMessage`, `isLoading`, `error`, `clear`. Messages have `role` and `parts` (e.g. `part.type === "text"` or `"thinking"`, `part.content`). **Server:** `src/app/api/chat/route.ts` — POST body has `messages` (and optional `data`); use `convertMessagesToModelMessages(messages)` then `chat({ adapter: openaiText("gpt-4o-mini"), messages })`; return `toServerSentEventsResponse(stream)`. Requires `OPENAI_API_KEY` in `.env.local`; restart dev server after adding it.

### Football Quiz

- App lives under `src/app/football-quiz/`. **Layout:** `ThemeProvider` (dark/light via class on `document.documentElement`) and `QuizNav`. **Types and mock data:** `_lib/types.ts`, `_lib/mock-data.ts` (leagues, clubs, players, questions). **Reusable components:** `@/components/quiz` — `QuestionCard`, `AnswerOptions`, `Timer`, `Leaderboard`, `StreakBadge`. **Modes:** daily (5/day, date-seeded), time-attack (60s, combo), who-am-I (clues), photo-quiz (blurred image), career-path (timeline), match-history; leaderboards, leagues, duel (1v1 placeholder), prediction, profile, settings. **API:** `GET /api/quiz/daily?date=`, `GET /api/quiz/random?n=`. To go production: add Supabase/Firebase for auth, leaderboards, leagues, real-time duel; replace mock data with DB; optional AI-generated daily quizzes via OpenAI.

### React Hook Form

- Example: `src/app/react-hook-form-example/page.tsx`. Use `useForm` with `resolver: zodResolver(schema)`. For controlled shared components use `Controller` and pass `field.value`, `field.onChange`, and `fieldState.error?.message`. Use a `FormValues` type for initial state (e.g. `terms: boolean`, `age?: number`) and `FormData` (schema output) for submit handler; cast resolver if needed: `zodResolver(schema) as Resolver<FormValues, unknown, FormData>`.

### Client vs server

- Pages or components that use `useState`, `onChange`, or browser APIs need `"use client"` at the top (e.g. form pages, ToastProvider).
- Root `layout.tsx` can stay a server component; it only renders children and `<ToastProvider />`.

### Testing

- **When you add a new component, add a test file for it.** Place `ComponentName.test.tsx` next to `ComponentName.tsx` (e.g. `src/components/form/MyInput.tsx` → `src/components/form/MyInput.test.tsx`).
- Use Vitest (`describe`, `it`, `expect`, `vi`) and React Testing Library (`render`, `screen`, `userEvent`). Setup is in `src/test/setup.ts` (jest-dom); path alias `@/*` works in tests.
- Test at least: render with required props, user interactions (onChange/onClick), and optional props (e.g. `error`, `placeholder`). See existing `*.test.tsx` files in `src/components/` for patterns.
- Run: `npm run test` (watch) or `npm run test:run` (single run).

## Adding or changing features

- **New page:** Add a folder under `src/app/<route>/` with `page.tsx`. Add a `Link` on the welcome page (`src/app/page.tsx`). Use `Link` from `next/link` for internal links.
- **New form field:** Add the field to the validation schema, to form state/default values, and to the JSX using the appropriate component from `@/components/form`. In `handleChange`, handle `number` and `checkbox` as in the existing zod-example (or yup/joi/rhf examples).
- **New input type (or any new component):** Add the component in the right place (e.g. `src/components/form/`), export it from the barrel if applicable, **and add a corresponding test file** (e.g. `MyInput.test.tsx`) next to it. Same props pattern as other form inputs: id, name, label, value, onChange, error, etc.
- **Toasts:** Use `toast.success()` / `toast.error()` from `react-toastify`; the root layout already mounts `<ToastProvider />`.

## Scripts

- `npm run dev` — start dev server with Turbopack
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — ESLint
- `npm run test` — Vitest (watch)
- `npm run test:run` — Vitest single run

## Gotchas

- **Zod v4:** `result.error.errors` is undefined; use `result.error?.issues ?? []` and iterate by `path`/`message`.
- **Optional form fields:** Coerce empty string to `undefined` before validation if the schema uses `.optional()` (e.g. `website: formData.website || undefined`).
- **Checkbox “must be true”:** In Zod use `z.literal(true, { error: "..." })`; form state type can use `terms: boolean` and only accept on submit when `true`. In Yup use `.oneOf([true], "..."`. In Joi use `.valid(true).messages({ "any.only": "..." })`.
- **Joi:** Do not chain `.message()` after `.valid()`; use `.messages({ "any.only": "Your message" })` (or other codes like `"string.email"` for email).
- **Joi optional URL or empty:** Use `Joi.alternatives().try(Joi.string().uri(), Joi.string().allow("")).optional()` so empty string is valid.
