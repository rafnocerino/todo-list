import { Task } from "@/lib/types";

export function TaskItem({task, onToggle, onDelete}: {task: Task, onToggle: (id: string) => void, onDelete: (id: string) => void}) {
    return (
        <li className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
            <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
                className="h-4 w-4 shrink-0 accent-zinc-900 dark:accent-zinc-100"
            />
            <span
                className={`flex-1 text-sm break-words ${
                    task.completed
                        ? "text-zinc-400 line-through dark:text-zinc-500"
                        : "text-zinc-900 dark:text-zinc-50"
                }`}
            >
                {task.title}
            </span>
            <button
                onClick={() => onDelete(task.id)}
                aria-label={`Delete "${task.title}"`}
                className="text-sm text-zinc-400 transition-colors hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
            >
                Delete
            </button>
        </li>
    );
}
