import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@/lib/types";

const { readFile, writeFile, mkdir } = vi.hoisted(() => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
  default: { readFile, writeFile, mkdir },
}));

const { readTasks, writeTasks } = await import("@/lib/storage");

function enoent() {
  const error = new Error("not found") as NodeJS.ErrnoException;
  error.code = "ENOENT";
  return error;
}

describe("readTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the parsed tasks when the file exists", async () => {
    const tasks: Task[] = [
      { id: "1", title: "Buy milk", completed: false, createdAt: "2026-01-01T00:00:00.000Z" },
    ];
    readFile.mockResolvedValue(JSON.stringify(tasks));

    const result = await readTasks();

    expect(result).toEqual(tasks);
  });

  it("returns an empty array when the file does not exist yet", async () => {
    readFile.mockRejectedValue(enoent());

    const result = await readTasks();

    expect(result).toEqual([]);
  });

  it("rethrows unexpected errors instead of swallowing them", async () => {
    readFile.mockRejectedValue(new Error("disk exploded"));

    await expect(readTasks()).rejects.toThrow("disk exploded");
  });
});

describe("writeTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates the data folder and writes the serialized tasks", async () => {
    const tasks: Task[] = [
      { id: "1", title: "Buy milk", completed: false, createdAt: "2026-01-01T00:00:00.000Z" },
    ];

    await writeTasks(tasks);

    expect(mkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify(tasks, null, 2),
      "utf-8",
    );
  });
});
