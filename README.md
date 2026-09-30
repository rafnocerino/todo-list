# To-Do List

A simple to-do list app built with Next.js (App Router), React and TypeScript. Tasks can be
created, viewed, marked as completed, edited, and deleted; data is persisted to a JSON file on
disk, so no external database or service is required to run it.

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
  storage.ts                # Reads/writes data/tasks.json
data/tasks.json             # Created automatically on first write; gitignored
```

## How data is stored

Tasks are persisted as a JSON array in `data/tasks.json`, read and rewritten in full on every
write (see `lib/storage.ts`). This is intentional: for the size of data a personal to-do list
produces, the simplicity of a JSON file outweighs the cost of rewriting it on each change. The
storage module is the only place that would need to change to swap in SQLite or another backend —
the API routes and the React components are unaware of how/where tasks are persisted.

## Running tests

```bash
npm test          # run once
npm run test:watch
```

Tests cover:

- **API route handlers** (`app/api/tasks/**/*.test.ts`) and the **storage module**
  (`lib/storage.test.ts`): validation, not-found and storage-error edge cases. The filesystem is
  mocked, so tests don't touch `data/tasks.json`.
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

- **Storage**: JSON file instead of SQLite, per the exercise's constraints on self-contained
  storage — kept the setup to zero configuration.
- **Icons**: [`react-icons`](https://react-icons.github.io/react-icons/) (Material icon set),
  bundled at build time — no external font/CDN requests at runtime.
- **Styling**: Tailwind CSS v4, with light/dark themes following the OS preference
  (`prefers-color-scheme`).
