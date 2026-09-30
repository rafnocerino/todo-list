import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@/lib/types";

const { readTasks, writeTasks } = vi.hoisted(() => ({
  readTasks: vi.fn(),
  writeTasks: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({ readTasks, writeTasks }));

const { PATCH, DELETE } = await import("./route");

function context(id: string) {
  return { params: Promise.resolve({ id }) };
}

const taskA: Task = {
  id: "a",
  title: "Task A",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};
const taskB: Task = {
  id: "b",
  title: "Task B",
  completed: true,
  createdAt: "2026-01-02T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/tasks/:id", () => {
  it("updates completed and returns the updated task", async () => {
    readTasks.mockResolvedValue([taskA, taskB]);

    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const res = await PATCH(request, context("a"));
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated).toMatchObject({ id: "a", completed: true, title: "Task A" });
    expect(writeTasks).toHaveBeenCalledWith([{ ...taskA, completed: true }, taskB]);
  });

  it("updates the title, trimming whitespace, without touching other tasks", async () => {
    readTasks.mockResolvedValue([taskA, taskB]);

    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({ title: "  Renamed  " }),
    });

    const res = await PATCH(request, context("a"));
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated.title).toBe("Renamed");
    expect(writeTasks).toHaveBeenCalledWith([{ ...taskA, title: "Renamed" }, taskB]);
  });

  it("rejects a request with neither completed nor title", async () => {
    readTasks.mockResolvedValue([taskA]);

    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const res = await PATCH(request, context("a"));

    expect(res.status).toBe(400);
    expect(writeTasks).not.toHaveBeenCalled();
  });

  it("rejects a blank title", async () => {
    readTasks.mockResolvedValue([taskA]);

    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({ title: "   " }),
    });

    const res = await PATCH(request, context("a"));

    expect(res.status).toBe(400);
    expect(writeTasks).not.toHaveBeenCalled();
  });

  it("returns an error for an id that does not exist", async () => {
    readTasks.mockResolvedValue([taskA]);

    const request = new Request("http://localhost/api/tasks/missing", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const res = await PATCH(request, context("missing"));

    expect(res.status).toBe(404);
    expect(writeTasks).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("removes the matching task and keeps the rest", async () => {
    readTasks.mockResolvedValue([taskA, taskB]);

    const res = await DELETE(new Request("http://localhost/api/tasks/a"), context("a"));

    expect(res.status).toBe(200);
    expect(writeTasks).toHaveBeenCalledWith([taskB]);
  });

  it("does not write and reports an error for an id that does not exist", async () => {
    readTasks.mockResolvedValue([taskA, taskB]);

    const res = await DELETE(new Request("http://localhost/api/tasks/missing"), context("missing"));

    expect(res.status).toBe(404);
    expect(writeTasks).not.toHaveBeenCalled();
  });
});
