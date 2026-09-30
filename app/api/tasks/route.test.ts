import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@/lib/types";

const { readTasks, writeTasks } = vi.hoisted(() => ({
  readTasks: vi.fn(),
  writeTasks: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({ readTasks, writeTasks }));

const { GET, POST } = await import("./route");

const existingTask: Task = {
  id: "existing-1",
  title: "Existing task",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/tasks", () => {
  it("returns all stored tasks", async () => {
    readTasks.mockResolvedValue([existingTask]);

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([existingTask]);
  });

  it("returns a 500 when reading storage fails", async () => {
    readTasks.mockRejectedValue(new Error("disk error"));

    const res = await GET();

    expect(res.status).toBe(500);
  });
});

describe("POST /api/tasks", () => {
  it("creates a task with a generated id and createdAt", async () => {
    readTasks.mockResolvedValue([existingTask]);

    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "New task" }),
    });

    const res = await POST(request);
    const created = await res.json();

    expect(res.status).toBe(201);
    expect(created).toMatchObject({ title: "New task", completed: false });
    expect(typeof created.id).toBe("string");
    expect(created.id).not.toBe(existingTask.id);
    expect(() => new Date(created.createdAt).toISOString()).not.toThrow();

    expect(writeTasks).toHaveBeenCalledWith([
      existingTask,
      expect.objectContaining({ title: "New task" }),
    ]);
  });

  it("rejects a missing title with 400 and does not write", async () => {
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(request);

    expect(res.status).toBe(400);
    expect(writeTasks).not.toHaveBeenCalled();
  });

  it("rejects a blank/whitespace-only title with 400", async () => {
    const request = new Request("http://localhost/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: "   " }),
    });

    const res = await POST(request);

    expect(res.status).toBe(400);
    expect(writeTasks).not.toHaveBeenCalled();
  });
});
