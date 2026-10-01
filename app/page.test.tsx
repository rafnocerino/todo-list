// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./page";
import type { Task } from "@/lib/types";

const existingTask: Task = {
  id: "1",
  title: "Buy milk",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Home page", () => {
  it("shows the loaded tasks once fetching finishes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([existingTask])));

    render(<Home />);

    expect(await screen.findByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByText("1 open")).toBeInTheDocument();
  });

  it("shows an empty state when there are no tasks", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse([])));

    render(<Home />);

    expect(await screen.findByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it("shows an error banner when the initial load fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "boom" }, { status: 500 })),
    );

    render(<Home />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't load/i);
  });

  it("adds a task through the form and shows it in the list", async () => {
    const user = userEvent.setup();
    const createdTask: Task = {
      id: "2",
      title: "Walk the dog",
      completed: false,
      createdAt: "2026-01-02T00:00:00.000Z",
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse(createdTask, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<Home />);
    await screen.findByText(/no tasks yet/i);

    await user.type(screen.getByPlaceholderText(/what needs to be done/i), "Walk the dog");
    await user.click(screen.getByRole("button", { name: /^add$/i }));

    expect(await screen.findByText("Walk the dog")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/tasks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ title: "Walk the dog" }),
      }),
    );
  });

  it("shows an error banner and keeps the task when deleting fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([existingTask]))
      .mockResolvedValueOnce(jsonResponse({ error: "boom" }, { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    render(<Home />);
    await screen.findByText("Buy milk");

    const item = screen.getByText("Buy milk").closest("li")!;
    await user.click(within(item).getByRole("button", { name: /delete/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/couldn't delete/i);
    expect(screen.getByText("Buy milk")).toBeInTheDocument();
  });
});
