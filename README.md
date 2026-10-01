# To-Do List

A simple to-do list app built with Next.js (App Router), React and TypeScript. Tasks can be
created, viewed, marked as completed, edited, and deleted; data is persisted to a local SQLite
file on disk, so no external database or service is required to run it.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no environment variables, no
external services, no database setup.

## Project structure

```
app/
  page.tsx                 # Client Component: UI + client-side state, talks to the API via fetch
  api/tasks/route.ts       # GET (list) / POST (create)
  api/tasks/[id]/route.ts  # PATCH (update completed/title) / DELETE
components/                # Presentational React components (TaskList, TaskItem, ...)
lib/
  types.ts                 # Shared Task type
  storage.ts                # SQLite access (better-sqlite3): data/tasks.db
data/tasks.db                # Created automatically on first run; gitignored
```

## How data is stored

Tasks are persisted in a local SQLite database file at `data/tasks.db` (via
[`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)), with WAL journaling enabled for
better concurrent read/write behavior. Each API route calls a focused function from
`lib/storage.ts` (`getAllTasks`, `insertTask`, `updateTask`, `deleteTask`) that runs a single SQL
statement — the API routes and the React components are unaware of how/where tasks are persisted,
so the storage module is the only place that would need to change to swap backends.

## Running tests

```bash
npm test          # run once
npm run test:watch
```

Tests cover:

- **API route handlers** (`app/api/tasks/**/*.test.ts`): validation and not-found/storage-error
  edge cases, with the storage module mocked.
- **Storage module** (`lib/storage.test.ts`): runs against a real in-memory SQLite database
  (`:memory:`), so it doesn't touch `data/tasks.db`.
- **`TaskItem`** (`components/TaskItem.test.tsx`, React Testing Library): toggling, deleting, and
  the inline title editor (save on blur/Enter, discard on Escape, blank/unchanged title guards).
- **`Home` page** (`app/page.test.tsx`): loading state, empty state, adding a task through the
  form, and an error banner surfacing when a request fails — with `fetch` mocked, so no real
  network/API calls happen.

## Code formatting

The project uses Prettier. `npm run format` formats the whole codebase; `npm run format:check`
verifies formatting without writing (useful in CI). VS Code is configured to format on save if you
have the Prettier extension installed (see `.vscode/extensions.json`).

## Notes on tech choices

- **Storage**: SQLite (`better-sqlite3`) instead of an external database, per the exercise's
  constraints on self-contained storage — kept the setup to zero configuration while still
  getting atomic writes and real query/indexing capabilities.
- **Icons**: [`react-icons`](https://react-icons.github.io/react-icons/) (Material icon set),
  bundled at build time — no external font/CDN requests at runtime.
- **Styling**: Tailwind CSS v4, with light/dark themes following the OS preference
  (`prefers-color-scheme`).
