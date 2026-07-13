// src/app/(public)/not-found.tsx
import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="p-4 bg-brand-secondary/40 border border-border-subtle rounded-full mb-6">
        <FileQuestion className="w-12 h-12 text-brand-primary" />
      </div>
      <h1 className="font-serif font-black text-4xl sm:text-6xl text-text-primary tracking-tight mb-3">
        404
      </h1>
      <h2 className="font-serif font-bold text-xl text-text-primary mb-3">Page Not Found</h2>
      <p className="text-sm text-gray-500 font-medium max-w-md mb-8 leading-relaxed">
        The article or page you are looking for may have been moved, deleted, or does not exist. Please check the URL or navigate back to our homepage.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
        >
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
      </div>
    </div>
  );
}
