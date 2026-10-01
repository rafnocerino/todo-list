"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled render error", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-stone-200 px-4 py-10 text-center dark:bg-stone-950">
      <h1 className="text-xl font-semibold text-teal-950 dark:text-teal-50">
        Something went wrong
      </h1>
      <p className="max-w-sm text-sm text-teal-900/60 dark:text-teal-50/50">
        An unexpected error occurred while rendering this page.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800 dark:bg-teal-500 dark:text-teal-950 dark:hover:bg-teal-400"
      >
        Try again
      </button>
    </div>
  );
}
