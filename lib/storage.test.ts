import { describe, it, expect, beforeEach, vi } from "vitest";
import type RealDatabase from "better-sqlite3";
import type { Task } from "@/lib/types";

vi.mock("better-sqlite3", async () => {
  const actual = await vi.importActual<{ default: typeof RealDatabase }>("better-sqlite3");
  return {
    default: vi.fn().mockImplementation(function () {
      return new actual.default(":memory:");
    }),
  };
});

const { getAllTasks, insertTask, updateTask, deleteTask } = await import("@/lib/storage");

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: "1",
    title: "Buy milk",
    completed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  for (const t of getAllTasks()) {
    deleteTask(t.id);
  }
});

describe("getAllTasks", () => {
  it("returns an empty array when there are no tasks", () => {
    expect(getAllTasks()).toEqual([]);
  });

  it("returns inserted tasks ordered by creation date", () => {
    insertTask(task({ id: "2", createdAt: "2026-01-02T00:00:00.000Z" }));
    insertTask(task({ id: "1", createdAt: "2026-01-01T00:00:00.000Z" }));

    expect(getAllTasks().map((t) => t.id)).toEqual(["1", "2"]);
  });
});

describe("insertTask", () => {
  it("persists a task with all its fields", () => {
    insertTask(task());

    expect(getAllTasks()).toEqual([task()]);
  });
});

describe("updateTask", () => {
  it("updates only the completed flag", () => {
    insertTask(task());

    const updated = updateTask("1", { completed: true });

    expect(updated).toEqual(task({ completed: true }));
  });

  it("updates only the title", () => {
    insertTask(task());

    const updated = updateTask("1", { title: "Buy oat milk" });

    expect(updated).toEqual(task({ title: "Buy oat milk" }));
  });

  it("returns null when the task does not exist", () => {
    expect(updateTask("missing", { completed: true })).toBeNull();
  });
});

describe("deleteTask", () => {
  it("removes an existing task and returns true", () => {
    insertTask(task());

    expect(deleteTask("1")).toBe(true);
    expect(getAllTasks()).toEqual([]);
  });

  it("returns false when the task does not exist", () => {
    expect(deleteTask("missing")).toBe(false);
  });
});
