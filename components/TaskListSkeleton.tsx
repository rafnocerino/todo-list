export function TaskListSkeleton() {
    return (
        <ul className="flex flex-col gap-2" aria-label="Loading tasks">
            {[0, 1, 2].map((i) => (
                <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900"
                >
                    <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    <div
                        className="h-4 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700"
                        style={{ maxWidth: `${60 - i * 10}%` }}
                    />
                    <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                </li>
            ))}
        </ul>
    );
}
