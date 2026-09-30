export function TaskListSkeleton() {
  return (
    <ul className="flex flex-col gap-2.5" aria-label="Loading tasks">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-teal-900/10 bg-white px-3 py-2 shadow-sm dark:border-teal-50/10 dark:bg-stone-800"
        >
          <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-teal-900/10 dark:bg-teal-50/10" />
          <div
            className="h-4 flex-1 animate-pulse rounded bg-teal-900/10 dark:bg-teal-50/10"
            style={{ maxWidth: `${60 - i * 10}%` }}
          />
          <div className="h-4 w-4 shrink-0 animate-pulse rounded bg-teal-900/10 dark:bg-teal-50/10" />
        </li>
      ))}
    </ul>
  );
}
