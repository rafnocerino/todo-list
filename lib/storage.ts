import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { Task } from "@/lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "tasks.db");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_FILE);
db.pragma("busy_timeout = 5000");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )
`);

interface TaskRow {
  id: string;
  title: string;
  completed: number;
  created_at: string;
}

// needed to convert format of data received from DB to Task data type
function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.created_at,
  };
}

export function getAllTasks(): Task[] {
  const rows = db.prepare("SELECT * FROM tasks ORDER BY created_at ASC").all() as TaskRow[];
  return rows.map(rowToTask);
}

export function insertTask(task: Task): void {
  db.prepare(
    "INSERT INTO tasks (id, title, completed, created_at) VALUES (@id, @title, @completed, @createdAt)",
  ).run({ ...task, completed: task.completed ? 1 : 0 }); // we can only store numbers not booleans
}

export function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "completed">>,
): Task | null {
  const fields: string[] = [];
  const params: Record<string, string | number> = { id };

  if (patch.title !== undefined) {
    fields.push("title = @title");
    params.title = patch.title;
  }
  if (patch.completed !== undefined) {
    fields.push("completed = @completed");
    params.completed = patch.completed ? 1 : 0;
  }

  const { changes } = db
    .prepare(`UPDATE tasks SET ${fields.join(", ")} WHERE id = @id`)
    .run(params);
  if (changes === 0) {
    return null;
  }

  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as TaskRow;
  return rowToTask(row);
}

export function deleteTask(id: string): boolean {
  const { changes } = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return changes > 0;
}
