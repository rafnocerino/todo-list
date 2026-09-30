import { Task } from "@/lib/types";
import { MdDeleteOutline } from "react-icons/md";

export function TaskItem({task, onToggle, onDelete}: {task: Task, onToggle: (id: string) => void, onDelete: (id: string) => void}) {
    return (
        <li className="flex items-center gap-3 rounded-lg border border-teal-900/10 bg-white px-3 py-2 shadow-sm dark:border-teal-50/10 dark:bg-stone-800">
            <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task.id)}
                className="h-4 w-4 shrink-0 accent-teal-700 dark:accent-teal-400"
            />
            <span
                className={`flex-1 text-sm break-words ${
                    task.completed
                        ? "text-teal-900/35 line-through dark:text-teal-50/30"
                        : "text-teal-950 dark:text-teal-50"
                }`}
            >
                {task.title}
            </span>
            <button
                onClick={() => onDelete(task.id)}
                aria-label={`Delete "${task.title}"`}
                className="shrink-0 rounded-lg p-1.5 text-teal-900/40 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-teal-50/40 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
                <MdDeleteOutline className="h-5 w-5" />
            </button>
        </li>
    );
}
