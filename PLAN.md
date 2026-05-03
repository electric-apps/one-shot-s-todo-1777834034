# Plan: Real-Time Todo App

A minimal todo app that persists items to Postgres and syncs changes across browser tabs in real-time via Electric SQL shapes.

---

## User Flows

1. User opens the app and sees a list of existing todos (or an empty state message).
2. User types text into an input field and presses Enter (or clicks Add) to create a new todo.
3. Each todo row shows a checkbox and the todo text. Checking/unchecking the checkbox toggles `completed`.
4. A delete button (trash icon) on each row removes the todo.
5. Any change (add, toggle, delete) made in one tab is instantly reflected in other open tabs via Electric sync.

---

## Data Model

```ts
// src/db/schema.ts
import { pgTable, uuid, text, boolean, timestamptz } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id:          uuid("id").primaryKey().defaultRandom(),
  text:        text("text").notNull(),
  completed:   boolean("completed").notNull().default(false),
  created_at:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

---

## Key Technical Decisions

- **Schema + Migrations**: Drizzle pgTable definition → `drizzle-kit generate` + `drizzle-kit migrate`.
- **Electric Shape Proxy**: `src/routes/api/todos.ts` proxies GET requests to Electric Cloud (shape sync) and handles POST / PUT / DELETE mutations against Postgres.
- **TanStack DB Collection**: `src/db/collections/todos.ts` subscribes to the Electric shape via the proxy, provides the client-side reactive store.
- **useLiveQuery**: Home route (`src/routes/index.tsx`) uses `useLiveQuery` against the todos collection; route sets `ssr: false`.
- **Optimistic Mutations**: `collection.insert`, `collection.update`, `collection.delete` for instant UI feedback; server confirms via API routes.
- **No auth, no filtering**: single shared list, all todos visible to everyone — keeps scope minimal.
- **Styling**: Tailwind 4 + existing shadcn/ui primitives (`Button`, `Input`, `Checkbox` if available, otherwise plain elements).

---

## Implementation Phases

### Phase 1 — Schema & Migrations
- [ ] Add `todos` table to `src/db/schema.ts` using the exact columns above.
- [ ] Derive Zod schemas in `src/db/zod-schemas.ts` via `drizzle-zod` (`createInsertSchema`, `createSelectSchema`).
- [ ] Run `drizzle-kit generate` then `drizzle-kit migrate` to apply to the database.

### Phase 2 — API Routes & Electric Proxy
- [ ] Create `src/routes/api/todos.ts`:
  - `GET` — proxy Electric shape requests (reuse `electric-proxy.ts` helper).
  - `POST` — validate body with Zod insert schema, insert via Drizzle, return 201.
  - `PUT /:id` — validate partial body, update `completed` (and optionally `text`) by id.
  - `DELETE /:id` — delete by id, return 204.

### Phase 3 — TanStack DB Collection
- [ ] Create `src/db/collections/todos.ts`:
  - Define collection with `shape` pointing at `/api/todos`.
  - Set `primaryKey: ["id"]`.
  - Export typed `todosCollection`.

### Phase 4 — UI
- [ ] Update `src/routes/index.tsx` (set `ssr: false`):
  - `useLiveQuery` over `todosCollection`, ordered by `created_at` ascending.
  - `<AddTodoForm>` — controlled input, on submit calls `collection.insert` then `POST /api/todos`, clears input.
  - `<TodoList>` — maps over todos, renders `<TodoItem>` per entry.
  - `<TodoItem>` — `<div>` row containing:
    - Checkbox (native `<input type="checkbox">` or shadcn Checkbox) bound to `completed`; `onChange` calls `collection.update` then `PUT /api/todos/:id`.
    - `<span>` with todo text; apply `line-through` style when `completed`.
    - Delete `<button>` (trash icon or "×"); `onClick` calls `collection.delete` then `DELETE /api/todos/:id`.
  - Empty state: "No todos yet — add one above!" when list is empty.

### Phase 5 — Build & Verify
- [ ] Run `pnpm build` and confirm zero errors.
- [ ] Run `node scripts/preflight.mjs` (SSR safety checks).
- [ ] Smoke-test in dev: add todo, toggle, delete; open second tab and verify real-time sync.

### Phase 6 — Tests
- [ ] `tests/todos.test.ts`: unit tests using `generateValidRow` / `generateRowWithout` from `schema-test-utils.ts`.
  - Valid row passes Zod select schema.
  - Row missing `text` fails insert schema.
  - Row with `completed: false` default is accepted.

### Phase 7 — README
- [ ] Update `README.md` with setup steps: clone, `pnpm install`, copy `.env.example` → `.env`, fill vars, `pnpm db:migrate`, `pnpm dev`.

### Phase 8 — Deploy (optional / environment-dependent)
- [ ] Ensure `DATABASE_URL`, `ELECTRIC_SOURCE_ID`, `ELECTRIC_SECRET` are set in production env.
- [ ] `pnpm build && pnpm start` (or deploy via platform of choice).
