// src/components/public/modules/HeroSlider.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  author: { name: string | null; image: string | null };
  category: { name: string; slug: string; color: string | null };
}

interface HeroSliderProps {
  posts: Post[];
}

export default function HeroSlider({ posts }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (posts.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % posts.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [posts.length]);

  if (!posts || posts.length === 0) return null;

  const activePost = posts[activeIndex];
  const dateStr = activePost.publishedAt
    ? new Date(activePost.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative w-full aspect-[21/9] min-h-[400px] md:min-h-[500px] bg-black text-white overflow-hidden group border-b border-border-subtle">
      {/* Background Slides */}
      {posts.map((post, idx) => (
        <div
          key={post.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === activeIndex ? "opacity-60 z-10 scale-100" : "opacity-0 z-0 scale-105"
          }`}
          style={{ transitionProperty: "opacity, transform" }}
        >
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover select-none"
            />
          )}
        </div>
      ))}


      {/* Shadow Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-20 pointer-events-none" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 md:pb-16">
        <div className="max-w-3xl flex flex-col gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Link
            href={`/${activePost.category.slug}`}
            className="self-start text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-primary text-brand-secondary rounded-sm hover:brightness-110 transition-all"
            style={{ backgroundColor: activePost.category.color || "var(--brand-primary)" }}
          >
            {activePost.category.name}
          </Link>
          
          <h1 className="font-serif font-black text-2xl sm:text-4xl md:text-5xl tracking-tight leading-tight select-text">
            <Link href={`/${activePost.category.slug}/${activePost.slug}`} className="hover:underline">
              {activePost.title}
            </Link>
          </h1>

          <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed max-w-2xl font-medium select-text">
            {activePost.excerpt || activePost.subtitle}
          </p>

          <div className="flex items-center gap-4 text-[10px] sm:text-xs text-gray-300 font-semibold select-none mt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {dateStr}
            </span>
            <Link
              href={`/${activePost.category.slug}/${activePost.slug}`}
              className="ml-auto inline-flex items-center gap-1 text-brand-secondary hover:underline"
            >
              Read Article <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Navigation Indicators */}
      {posts.length > 1 && (
        <div className="absolute bottom-6 right-4 sm:right-6 lg:right-8 z-30 flex gap-2">
          {posts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                idx === activeIndex ? "w-6 bg-brand-secondary" : "w-1.5 bg-white/40 hover:bg-white"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
