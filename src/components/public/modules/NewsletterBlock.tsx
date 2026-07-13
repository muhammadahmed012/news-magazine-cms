// src/components/public/modules/NewsletterBlock.tsx
import { Mail, Send } from "lucide-react";

interface NewsletterBlockProps {
  title?: string;
  subtitle?: string;
}

export default function NewsletterBlock({
  title = "Subscribe to Chronicle",
  subtitle = "Stay informed with weekly analysis and deep dives delivered directly to your inbox.",
}: NewsletterBlockProps) {
  return (
    <section className="bg-brand-secondary/40 border-y border-border-subtle py-16">
      <div className="max-w-4xl mx-auto px-4 text-center flex flex-col items-center gap-6">
        <div className="p-3 bg-brand-primary text-white rounded-full">
          <Mail className="w-6 h-6" />
        </div>
        
        <div className="flex flex-col gap-2">
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-text-primary">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl leading-relaxed font-semibold">
            {subtitle}
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md mt-2">
          <input
            type="email"
            required
            placeholder="Enter your email address..."
            className="w-full text-xs font-semibold px-4 py-3.5 bg-white border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary"
          />
          <button
            type="submit"
            className="bg-brand-primary text-white hover:bg-brand-hover px-6 py-3.5 rounded-md text-xs font-bold tracking-wide flex items-center justify-center gap-2 shrink-0 transition-colors"
          >
            <Send className="w-4 h-4" /> Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
