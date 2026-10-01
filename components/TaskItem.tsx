import { useState } from "react";
import { Task } from "@/lib/types";
import { MdDeleteOutline, MdOutlineEdit, MdCheck } from "react-icons/md";

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);

  function startEditing() {
    setDraftTitle(task.title);
    setIsEditing(true);
  }

  function commitEdit() {
    if (!isEditing) return;
    setIsEditing(false);

    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === task.title) return;

    onEdit(task.id, trimmed);
  }

  function cancelEdit() {
    setDraftTitle(task.title);
    setIsEditing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      cancelEdit();
    }
  }

  function handleDelete() {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      onDelete(task.id);
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-teal-900/10 bg-white px-3 py-2 shadow-sm dark:border-teal-50/10 dark:bg-stone-800">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="h-4 w-4 shrink-0 accent-teal-700 dark:accent-teal-400"
      />

      {isEditing ? (
        <input
          type="text"
          autoFocus
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          placeholder="Task title"
          className="flex-1 rounded border border-teal-600 bg-white px-1.5 py-0.5 text-sm text-teal-950 focus:outline-none dark:bg-stone-900 dark:text-teal-50"
        />
      ) : (
        <span
          className={`flex-1 text-sm break-words ${
            task.completed
              ? "text-teal-900/35 line-through dark:text-teal-50/30"
              : "text-teal-950 dark:text-teal-50"
          }`}
        >
          {task.title}
        </span>
      )}

      {isEditing ? (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={commitEdit}
          aria-label="Save title"
          className="shrink-0 rounded-lg p-1.5 text-teal-700 transition-colors hover:bg-teal-700/10 dark:text-teal-400 dark:hover:bg-teal-400/10"
        >
          <MdCheck className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={startEditing}
          aria-label={`Edit "${task.title}"`}
          className="shrink-0 rounded-lg p-1.5 text-teal-900/40 transition-colors hover:bg-teal-700/10 hover:text-teal-700 dark:text-teal-50/40 dark:hover:bg-teal-400/10 dark:hover:text-teal-400"
        >
          <MdOutlineEdit className="h-5 w-5" />
        </button>
      )}

      <button
        onClick={handleDelete}
        aria-label={`Delete "${task.title}"`}
        className="shrink-0 rounded-lg p-1.5 text-teal-900/40 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-teal-50/40 dark:hover:bg-red-950 dark:hover:text-red-400"
      >
        <MdDeleteOutline className="h-5 w-5" />
      </button>
    </li>
  );
}
