# Real-Time Todo App

A minimal todo app that persists items to Postgres and syncs changes across browser tabs in real-time via Electric SQL shapes.

## Stack

- **Framework**: TanStack Start (React, file-based routing, SSR)
- **Sync**: Electric SQL shapes → TanStack DB collections → `useLiveQuery`
- **Database**: Postgres (Drizzle ORM for schema + migrations)
- **Styling**: Tailwind CSS + Radix Themes

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd <repo>
pnpm install --ignore-workspace
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the required variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
ELECTRIC_URL=http://localhost:3000        # or your Electric Cloud URL
ELECTRIC_SOURCE_ID=<your-source-id>      # Electric Cloud only
ELECTRIC_SECRET=<your-secret>            # Electric Cloud only
```

### 3. Run migrations

```bash
pnpm migrate
```

### 4. Start development server

```bash
pnpm dev
```

Open [http://localhost:5174](http://localhost:5174).

## Features

- Add todos with the input field and Enter or the Add button
- Check/uncheck the checkbox to toggle completion (strikethrough style)
- Delete todos with the trash icon
- Real-time sync across browser tabs via Electric SQL shapes

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite dev server on port 5174 |
| `pnpm build` | Production build |
| `pnpm test` | Run Vitest tests |
| `pnpm generate` | Generate Drizzle migration files |
| `pnpm migrate` | Apply pending migrations |
