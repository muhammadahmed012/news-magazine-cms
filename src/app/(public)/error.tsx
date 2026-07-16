// src/app/(public)/error.tsx
"use client";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h2 className="font-serif font-black text-2xl text-text-primary mb-4">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-brand-primary text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-brand-hover transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
