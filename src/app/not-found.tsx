// src/app/not-found.tsx
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";

export default function GlobalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-bg-light">
      <div className="p-4 bg-white border border-border-subtle rounded-full mb-6 shadow-sm">
        <FileQuestion className="w-12 h-12 text-brand-primary" />
      </div>
      <h1 className="font-serif font-black text-5xl text-text-primary tracking-tight mb-3">404</h1>
      <h2 className="font-serif font-bold text-xl text-text-primary mb-3">Page Not Found</h2>
      <p className="text-sm text-gray-500 font-medium max-w-md mb-8 leading-relaxed">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
      >
        <Home className="w-4 h-4" /> Back to Homepage
      </Link>
    </div>
  );
}
