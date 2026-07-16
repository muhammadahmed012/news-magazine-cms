// src/components/public/AnnouncementBar.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AnnouncementProps {
  text: string;
  link?: string;
  enabled: boolean;
}

export default function AnnouncementBar({ text, link, enabled }: AnnouncementProps) {
  if (!enabled || !text) return null;

  return (
    <div className="relative bg-brand-primary text-brand-secondary px-4 py-2.5 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all">
      <span>{text}</span>
      {link && (
        <Link href={link} className="inline-flex items-center gap-1 underline hover:text-white transition-colors">
          Learn more <ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}
