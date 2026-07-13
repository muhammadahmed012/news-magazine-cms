// src/components/public/NewsTicker.tsx
import { AlertCircle } from "lucide-react";

interface TickerProps {
  text: string;
  enabled: boolean;
}

export default function NewsTicker({ text, enabled }: TickerProps) {
  if (!enabled || !text) return null;

  // Split items by bullet separator or make it an array
  const items = text.split("•").map(item => item.trim());

  return (
    <div className="border-b border-border-subtle bg-bg-light overflow-hidden flex items-center h-10 select-none">
      <div className="bg-brand-primary text-white text-[10px] font-bold tracking-widest uppercase px-4 h-full flex items-center gap-1.5 shrink-0 z-10 shadow-md">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Breaking</span>
      </div>
      
      <div className="relative w-full flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center py-2 text-xs font-medium text-text-primary">
          {/* Double items to enable continuous scrolling */}
          {[...items, ...items].map((item, idx) => (
            <span key={idx} className="mx-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
