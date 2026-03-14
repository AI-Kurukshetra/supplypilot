"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-8">
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-rose-700 dark:text-rose-300">
        Workspace error
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-rose-700/80 dark:text-rose-200">
        {error.message || "Something unexpected happened while loading the workspace."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="btn btn-danger mt-5"
      >
        Retry
      </button>
    </div>
  );
}
