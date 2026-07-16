// src/components/public/CategoryCardStyles.tsx
import Link from "next/link";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import OptimizedImage from "@/components/public/OptimizedImage";

interface Post {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  readingTime: number;
  author: { name: string | null; image: string | null };
  category: { name: string; slug: string; color: string | null };
}

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SectionHeader({ title, categorySlug }: { title: string; categorySlug?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black mb-6">
      <h3 className="font-sans font-black text-[22px] uppercase tracking-tight text-black pb-2">
        {title}
      </h3>
      {categorySlug && (
        <Link href={`/${categorySlug}`} className="text-xs font-bold uppercase text-brand-primary flex items-center gap-1 hover:underline">
          More <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

// ─── Style 1: Classic Card (default) ────────────────────────────
function StyleClassic({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {posts.map((post) => (
          <article key={post.id} className="group flex flex-col border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <Link href={`/${post.category.slug}/${post.slug}`} className="block overflow-hidden relative">
              {post.featuredImage ? (
                <div className="relative overflow-hidden aspect-[16/10]">
                  <OptimizedImage src={post.featuredImage} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-full aspect-[16/10] bg-gray-100" />
              )}
            </Link>
            <div className="p-4 flex flex-col flex-1 gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/${post.category.slug}`}>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white" style={{ backgroundColor: "var(--brand-primary)" }}>
                    {post.category.name}
                  </span>
                </Link>
                <span className="text-[9px] font-bold text-gray-400">{formatDate(post.publishedAt)}</span>
              </div>
              <Link href={`/${post.category.slug}/${post.slug}`} className="group mt-1">
                <h3 className="font-serif font-bold text-[19px] leading-[1.2] text-gray-900 group-hover:text-brand-primary transition-colors">{post.title}</h3>
              </Link>
              <p className="text-[13px] text-gray-600 leading-relaxed line-clamp-2 mt-auto">{post.excerpt || post.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── Style 2: Overlay (image with gradient text overlay) ─────────
function StyleOverlay({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/${post.category.slug}/${post.slug}`} className="group relative overflow-hidden rounded-lg aspect-[3/4]">
            {post.featuredImage ? (
              <OptimizedImage src={post.featuredImage} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white bg-brand-primary/80 self-start rounded-sm mb-3">
                {post.category.name}
              </span>
              <h3 className="font-serif font-bold text-lg leading-tight text-white mb-2 group-hover:text-brand-primary transition-colors drop-shadow-lg">
                {post.title}
              </h3>
              <p className="text-[11px] text-white/70 leading-relaxed line-clamp-2 mb-2">{post.excerpt || post.subtitle}</p>
              <span className="text-[9px] font-bold text-white/50 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(post.publishedAt)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Style 3: Magazine (one large + 3 small stacked) ────────────
function StyleMagazine({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  const [first, ...rest] = posts;
  if (!first) return null;
  const small = rest.slice(0, 3);

  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link href={`/${first.category.slug}/${first.slug}`} className="group relative overflow-hidden rounded-lg aspect-[4/3]">
          {first.featuredImage ? (
            <OptimizedImage src={first.featuredImage} alt={first.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white bg-brand-primary/80 self-start rounded-sm mb-3">{first.category.name}</span>
            <h3 className="font-serif font-black text-2xl sm:text-3xl leading-tight text-white mb-2 drop-shadow-lg">{first.title}</h3>
            <p className="text-[13px] text-white/70 leading-relaxed line-clamp-2">{first.excerpt || first.subtitle}</p>
          </div>
        </Link>
        <div className="flex flex-col gap-4">
          {small.map((post) => (
            <Link key={post.id} href={`/${post.category.slug}/${post.slug}`} className="group flex gap-4 items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {post.featuredImage && (
                <div className="w-28 h-20 rounded-md overflow-hidden shrink-0">
                  <OptimizedImage src={post.featuredImage} alt={post.title} fill sizes="112px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{post.category.name}</span>
                <h3 className="font-serif font-bold text-[15px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h3>
                <span className="text-[10px] font-bold text-gray-400">{formatDate(post.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Style 4: placeholder ───────────────────────────────────────

// ─── Style 5: Bento (asymmetric bento box grid) ──────────────────
function StyleBento({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  const [first, second, third, fourth] = posts;
  if (!first) return null;

  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[200px] lg:auto-rows-[240px]">
        {/* Large hero card */}
        {first && (
          <Link href={`/${first.category.slug}/${first.slug}`} className="group col-span-2 row-span-2 relative overflow-hidden rounded-lg">
            {first.featuredImage ? (
              <OptimizedImage src={first.featuredImage} alt={first.title} fill sizes="(max-width: 1024px) 100vw, 67vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white bg-brand-primary/80 rounded-sm">{first.category.name}</span>
              <h3 className="font-serif font-black text-xl sm:text-2xl leading-tight text-white mt-2 drop-shadow-lg">{first.title}</h3>
              <p className="text-[12px] text-white/70 line-clamp-2 mt-1 hidden sm:block">{first.excerpt || first.subtitle}</p>
            </div>
          </Link>
        )}
        {/* Medium card */}
        {second && (
          <Link href={`/${second.category.slug}/${second.slug}`} className="group relative overflow-hidden rounded-lg">
            {second.featuredImage ? (
              <OptimizedImage src={second.featuredImage} alt={second.title} fill sizes="(max-width: 1024px) 50vw, 33vw" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-white/90 px-2 py-0.5 rounded-sm">{second.category.name}</span>
              <h3 className="font-serif font-bold text-sm leading-snug text-white mt-1.5 line-clamp-2 drop-shadow-lg">{second.title}</h3>
            </div>
          </Link>
        )}
        {/* Small card */}
        {third && (
          <Link href={`/${third.category.slug}/${third.slug}`} className="group relative overflow-hidden rounded-lg">
            {third.featuredImage ? (
              <OptimizedImage src={third.featuredImage} alt={third.title} fill sizes="(max-width: 1024px) 50vw, 33vw" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-white/90 px-2 py-0.5 rounded-sm">{third.category.name}</span>
              <h3 className="font-serif font-bold text-sm leading-snug text-white mt-1.5 line-clamp-2 drop-shadow-lg">{third.title}</h3>
            </div>
          </Link>
        )}
        {/* Small card */}
        {fourth && (
          <Link href={`/${fourth.category.slug}/${fourth.slug}`} className="group relative overflow-hidden rounded-lg">
            {fourth.featuredImage ? (
              <OptimizedImage src={fourth.featuredImage} alt={fourth.title} fill sizes="(max-width: 1024px) 50vw, 33vw" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-white/90 px-2 py-0.5 rounded-sm">{fourth.category.name}</span>
              <h3 className="font-serif font-bold text-sm leading-snug text-white mt-1.5 line-clamp-2 drop-shadow-lg">{fourth.title}</h3>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}

// ─── Style 6: Timeline (vertical timeline with dots & lines) ─────
function StyleTimeline({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="flex flex-col gap-8">
          {posts.map((post, idx) => (
            <article key={post.id} className="group relative">
              <div className="absolute -left-8 top-3 w-6 h-6 rounded-full border-[3px] border-white bg-brand-primary shadow-md z-10 flex items-center justify-center">
                <span className="text-[7px] font-black text-white">{idx + 1}</span>
              </div>
              <div className="flex gap-5 items-start">
                {post.featuredImage && (
                  <Link href={`/${post.category.slug}/${post.slug}`} className="w-32 h-24 sm:w-40 sm:h-28 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
                    <OptimizedImage src={post.featuredImage} alt={post.title} fill sizes="(max-width: 640px) 128px, 160px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                )}
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">{post.category.name}</span>
                    <span className="text-[10px] font-bold text-gray-400">{formatDate(post.publishedAt)}</span>
                  </div>
                  <Link href={`/${post.category.slug}/${post.slug}`}>
                    <h3 className="font-serif font-bold text-[17px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h3>
                  </Link>
                  <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{post.excerpt || post.subtitle}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Style 7: Compact Overlay (tight grid, full-bleed images) ───
function StyleCompactOverlay({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {posts.map((post, idx) => (
          <Link key={post.id} href={`/${post.category.slug}/${post.slug}`} className={`group relative overflow-hidden rounded-lg ${idx === 0 ? "row-span-2 col-span-2 aspect-[4/3] lg:aspect-auto" : "aspect-square"}`}>
            {post.featuredImage ? (
              <OptimizedImage src={post.featuredImage} alt={post.title} fill sizes="(max-width: 1024px) 50vw, 25vw" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4">
              <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-brand-primary-light">{post.category.name}</span>
              <h3 className={`font-serif font-bold leading-snug text-white mt-1 line-clamp-2 ${idx === 0 ? "text-[16px] lg:text-[20px]" : "text-[13px] lg:text-[14px]"}`}>{post.title}</h3>
              {idx === 0 && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/50 mt-2">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="w-1 h-1 bg-white/30 rounded-full" />
                  <span>{post.readingTime}m</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Style 8: Big Rank (horizontal cards with large numbers) ─────
function StyleBigRank({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {posts.map((post, idx) => (
          <Link key={post.id} href={`/${post.category.slug}/${post.slug}`} className="group flex gap-5 items-center bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300">
            <span className="text-5xl sm:text-6xl font-black leading-none select-none text-brand-primary/30 group-hover:text-brand-primary/60 transition-colors shrink-0 w-12 text-center">
              {String(idx + 1).padStart(2, "0")}
            </span>
            {post.featuredImage ? (
              <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-lg overflow-hidden shrink-0">
                <OptimizedImage src={post.featuredImage} alt={post.title} fill sizes="(max-width: 640px) 112px, 144px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ) : (
              <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-lg bg-gray-100 shrink-0" />
            )}
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">{post.category.name}</span>
              </div>
              <h3 className="font-serif font-bold text-[16px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h3>
              <p className="text-[12px] text-gray-500 line-clamp-2 hidden sm:block">{post.excerpt || post.subtitle}</p>
              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mt-auto">
                <Clock className="w-3 h-3" /> {post.readingTime}m
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                {formatDate(post.publishedAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── placeholder 2 ──────────────────────────────────────────────

// ─── Style 9: Feature Grid (Z-pattern: 2 big top + 2 small bottom) ──
function StyleFeatureGrid({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  const [first, second, third, fourth] = posts;
  if (!first) return null;

  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="flex flex-col gap-5">
        {/* Top row: two large cards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[first, second].filter(Boolean).map((post) => (
            <Link key={post!.id} href={`/${post!.category.slug}/${post!.slug}`} className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="aspect-[16/9] overflow-hidden">
                {post!.featuredImage ? (
                  <OptimizedImage src={post!.featuredImage} alt={post!.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
                )}
              </div>
              <div className="p-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 text-white rounded-sm" style={{ backgroundColor: "var(--brand-primary)" }}>{post!.category.name}</span>
                  <span className="text-[10px] font-bold text-gray-400">{formatDate(post!.publishedAt)}</span>
                </div>
                <h3 className="font-serif font-bold text-xl leading-snug text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">{post!.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">{post!.excerpt || post!.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
        {/* Bottom row: two smaller horizontal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[third, fourth].filter(Boolean).map((post) => (
            <Link key={post!.id} href={`/${post!.category.slug}/${post!.slug}`} className="group flex gap-4 items-center bg-white border border-gray-200 rounded-xl p-3 hover:shadow-lg transition-all duration-300">
              {post!.featuredImage ? (
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                  <OptimizedImage src={post!.featuredImage} alt={post!.title} fill sizes="96px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 shrink-0" />
              )}
              <div className="flex flex-col gap-1.5 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-primary">{post!.category.name}</span>
                <h3 className="font-serif font-bold text-[15px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">{post!.title}</h3>
                <p className="text-[11px] text-gray-500 line-clamp-2 hidden sm:block">{post!.excerpt || post!.subtitle}</p>
                <span className="text-[10px] font-bold text-gray-400 mt-auto">{post!.readingTime} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Style 10: Hero + Pill Row (enhanced hero card + rich pill rows) ──
function StyleHeroPill({ posts, title, categorySlug }: { posts: Post[]; title: string; categorySlug?: string }) {
  const [first, ...rest] = posts;
  if (!first) return null;

  return (
    <section className="mb-10">
      <SectionHeader title={title} categorySlug={categorySlug} />
      <div className="flex flex-col gap-5">
        {/* Big hero card */}
        <Link href={`/${first.category.slug}/${first.slug}`} className="group relative overflow-hidden rounded-2xl aspect-[21/9] sm:aspect-[2.8/1]">
          {first.featuredImage ? (
            <OptimizedImage src={first.featuredImage} alt={first.title} fill sizes="100vw" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20" />
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-bl-[80px]" />
          <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 text-white bg-brand-primary rounded-sm">{first.category.name}</span>
              <span className="text-[10px] font-bold text-white/50 flex items-center gap-1"><Clock className="w-3 h-3" /> {first.readingTime} min read</span>
            </div>
            <h3 className="font-serif font-black text-2xl sm:text-4xl lg:text-[42px] leading-[1.1] text-white drop-shadow-lg">{first.title}</h3>
            <p className="text-[13px] sm:text-[14px] text-white/60 leading-relaxed line-clamp-2 mt-3 hidden sm:block max-w-lg">{first.excerpt || first.subtitle}</p>
            <div className="flex items-center gap-3 mt-4">
              {first.author?.name && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">{first.author.name[0]}</div>
                  <span className="text-[11px] font-semibold text-white/70">{first.author.name}</span>
                </div>
              )}
              <span className="text-[10px] font-bold text-white/40">{formatDate(first.publishedAt)}</span>
            </div>
          </div>
        </Link>

        {/* Pill rows below */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rest.slice(0, 3).map((post) => (
              <Link key={post.id} href={`/${post.category.slug}/${post.slug}`} className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-3 pl-1 hover:shadow-lg hover:border-brand-primary/20 transition-all duration-300">
                {post.featuredImage ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 ring-2 ring-brand-primary/20 group-hover:ring-brand-primary/40 transition-all">
                    <OptimizedImage src={post.featuredImage} alt="" fill sizes="64px" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0" />
                )}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-primary">{post.category.name}</span>
                  <h4 className="font-serif font-bold text-[14px] leading-snug text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">{post.title}</h4>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                    <span>{formatDate(post.publishedAt)}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{post.readingTime}m</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Export all styles ───────────────────────────────────────────
export const CARD_STYLES = [
  { id: "classic", label: "Classic Card", description: "Traditional bordered cards with image on top" },
  { id: "overlay", label: "Image Overlay", description: "Full images with gradient text overlay" },
  { id: "magazine", label: "Magazine Split", description: "One large hero + 3 small stacked cards" },
  { id: "bento", label: "Bento Grid", description: "Asymmetric bento box layout" },
  { id: "timeline", label: "Timeline", description: "Vertical timeline with numbered dots" },
  { id: "compact-overlay", label: "Compact Overlay", description: "Tight grid with full-bleed images, first card spans 2x2" },
  { id: "big-rank", label: "Big Rank", description: "Horizontal cards with large ranking numbers" },
  { id: "feature-grid", label: "Feature Grid", description: "2 large + 2 small Z-pattern layout" },
  { id: "hero-pill", label: "Hero + Pill Row", description: "Wide hero banner with rich pill rows below" },
] as const;

export type CardStyleId = (typeof CARD_STYLES)[number]["id"];

export default function CategoryCardRenderer({
  posts,
  title,
  categorySlug,
  style = "classic",
}: {
  posts: Post[];
  title: string;
  categorySlug?: string;
  style?: string;
}) {
  switch (style) {
    case "overlay":
      return <StyleOverlay posts={posts} title={title} categorySlug={categorySlug} />;
    case "magazine":
      return <StyleMagazine posts={posts} title={title} categorySlug={categorySlug} />;
    case "bento":
      return <StyleBento posts={posts} title={title} categorySlug={categorySlug} />;
    case "timeline":
      return <StyleTimeline posts={posts} title={title} categorySlug={categorySlug} />;
    case "compact-overlay":
      return <StyleCompactOverlay posts={posts} title={title} categorySlug={categorySlug} />;
    case "big-rank":
      return <StyleBigRank posts={posts} title={title} categorySlug={categorySlug} />;
    case "feature-grid":
      return <StyleFeatureGrid posts={posts} title={title} categorySlug={categorySlug} />;
    case "hero-pill":
      return <StyleHeroPill posts={posts} title={title} categorySlug={categorySlug} />;
    default:
      return <StyleClassic posts={posts} title={title} categorySlug={categorySlug} />;
  }
}
