import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";
import { Task } from "@/lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "tasks.json");

export async function readTasks(): Promise<Task[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Task[];
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function writeTasks(tasks: Task[]): Promise<void> {
  // create the folder to avoid failure the first time  
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}
