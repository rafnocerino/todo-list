// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskItem } from "./TaskItem";
import type { Task } from "@/lib/types";

const task: Task = {
  id: "1",
  title: "Buy milk",
  completed: false,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function setup(overrides: Partial<Task> = {}) {
  const onToggle = vi.fn();
  const onDelete = vi.fn();
  const onEdit = vi.fn();
  render(
    <TaskItem
      task={{ ...task, ...overrides }}
      onToggle={onToggle}
      onDelete={onDelete}
      onEdit={onEdit}
    />,
  );
  return { onToggle, onDelete, onEdit };
}

describe("TaskItem", () => {
  it("renders the task title and an unchecked checkbox", () => {
    setup();

    expect(screen.getByText("Buy milk")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("shows completed tasks as checked and struck through", () => {
    setup({ completed: true });

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("Buy milk")).toHaveClass("line-through");
  });

  it("calls onToggle with the task id when the checkbox is clicked", async () => {
    const user = userEvent.setup();
    const { onToggle } = setup();

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledWith("1");
  });

  it("calls onDelete with the task id when the delete is confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    const { onDelete } = setup();

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledWith("1");
  });

  it("does not call onDelete when the confirmation is dismissed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    const { onDelete } = setup();

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(onDelete).not.toHaveBeenCalled();
  });

  describe("editing the title", () => {
    it("enters edit mode with the current title pre-filled", async () => {
      const user = userEvent.setup();
      setup();

      await user.click(screen.getByRole("button", { name: /edit/i }));

      expect(screen.getByRole("textbox")).toHaveValue("Buy milk");
    });

    it("commits the new title on blur", async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();

      await user.click(screen.getByRole("button", { name: /edit/i }));
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "Buy oat milk");
      await user.tab();

      expect(onEdit).toHaveBeenCalledWith("1", "Buy oat milk");
    });

    it("commits the new title on Enter", async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();

      await user.click(screen.getByRole("button", { name: /edit/i }));
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "Buy oat milk{Enter}");

      expect(onEdit).toHaveBeenCalledWith("1", "Buy oat milk");
    });

    it("discards changes on Escape without calling onEdit", async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();

      await user.click(screen.getByRole("button", { name: /edit/i }));
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, "Something else{Escape}");

      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByText("Buy milk")).toBeInTheDocument();
    });

    it("does not call onEdit when the title is left blank", async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();

      await user.click(screen.getByRole("button", { name: /edit/i }));
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.tab();

      expect(onEdit).not.toHaveBeenCalled();
    });

    it("does not call onEdit when the title is unchanged", async () => {
      const user = userEvent.setup();
      const { onEdit } = setup();

      await user.click(screen.getByRole("button", { name: /edit/i }));
      await user.tab();

      expect(onEdit).not.toHaveBeenCalled();
    });
  });
});
