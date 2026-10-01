import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Task } from "@/lib/types";

const { updateTask, deleteTask } = vi.hoisted(() => ({
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("@/lib/storage", () => ({ updateTask, deleteTask }));

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

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PATCH /api/tasks/:id", () => {
  it("updates completed and returns the updated task", async () => {
    updateTask.mockReturnValue({ ...taskA, completed: true });

    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const res = await PATCH(request, context("a"));
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated).toMatchObject({ id: "a", completed: true, title: "Task A" });
    expect(updateTask).toHaveBeenCalledWith("a", { completed: true });
  });

  it("updates the title, trimming whitespace, without touching other tasks", async () => {
    updateTask.mockReturnValue({ ...taskA, title: "Renamed" });

    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({ title: "  Renamed  " }),
    });

    const res = await PATCH(request, context("a"));
    const updated = await res.json();

    expect(res.status).toBe(200);
    expect(updated.title).toBe("Renamed");
    expect(updateTask).toHaveBeenCalledWith("a", { title: "Renamed" });
  });

  it("rejects a request with neither completed nor title", async () => {
    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({}),
    });

    const res = await PATCH(request, context("a"));

    expect(res.status).toBe(400);
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("rejects a blank title", async () => {
    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({ title: "   " }),
    });

    const res = await PATCH(request, context("a"));

    expect(res.status).toBe(400);
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("rejects a title longer than the max length", async () => {
    const request = new Request("http://localhost/api/tasks/a", {
      method: "PATCH",
      body: JSON.stringify({ title: "a".repeat(201) }),
    });

    const res = await PATCH(request, context("a"));

    expect(res.status).toBe(400);
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("returns an error for an id that does not exist", async () => {
    updateTask.mockReturnValue(null);

    const request = new Request("http://localhost/api/tasks/missing", {
      method: "PATCH",
      body: JSON.stringify({ completed: true }),
    });

    const res = await PATCH(request, context("missing"));

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("removes the matching task", async () => {
    deleteTask.mockReturnValue(true);

    const res = await DELETE(new Request("http://localhost/api/tasks/a"), context("a"));

    expect(res.status).toBe(200);
    expect(deleteTask).toHaveBeenCalledWith("a");
  });

  it("reports an error for an id that does not exist", async () => {
    deleteTask.mockReturnValue(false);

    const res = await DELETE(new Request("http://localhost/api/tasks/missing"), context("missing"));

    expect(res.status).toBe(404);
  });
});
