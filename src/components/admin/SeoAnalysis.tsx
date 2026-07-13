"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface SeoAnalysisProps {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  focusKeywords: string;
  slug: string;
}

interface CheckResult {
  label: string;
  pass: boolean;
  detail: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getFirstParagraph(html: string): string {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return match ? stripHtml(match[1]) : "";
}

function getSubheadings(html: string): string {
  const matches = html.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi);
  if (!matches) return "";
  return matches.map((m) => stripHtml(m)).join(" ");
}

function hasHeadings(html: string): boolean {
  return /<h[23][^>]*>/.test(html);
}

function hasImages(html: string): boolean {
  return /<img\s/.test(html);
}

function countWords(text: string): number {
  const cleaned = stripHtml(text);
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter((w) => w.length > 0).length;
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");
  const matches = haystack.match(regex);
  return matches ? matches.length : 0;
}

function getScoreColor(score: number): string {
  if (score <= 40) return "text-red-500";
  if (score <= 70) return "text-orange-500";
  return "text-emerald-500";
}

function getScoreRingColor(score: number): string {
  if (score <= 40) return "#ef4444";
  if (score <= 70) return "#f97316";
  return "#10b981";
}

function getScoreLabel(score: number): string {
  if (score <= 40) return "Needs Work";
  if (score <= 70) return "Good";
  return "Excellent";
}

export default function SeoAnalysis({
  title,
  content,
  seoTitle,
  seoDescription,
  focusKeywords,
  slug,
}: SeoAnalysisProps) {
  const primaryKeyword = focusKeywords.split(",")[0]?.trim().toLowerCase() || "";

  const analysis = useMemo(() => {
    const keyword = primaryKeyword;
    const plainContent = stripHtml(content);
    const firstParagraph = getFirstParagraph(content);
    const subheadings = getSubheadings(content);
    const effectiveTitle = seoTitle || title;
    const wordCount = countWords(content);
    const hasExtLinks = /<a\s[^>]*href=["']https?:\/\//i.test(content);
    const hasIntLinks = /<a\s[^>]*href=["']\//i.test(content);

    const seoTitleLength = effectiveTitle.length;
    const descLength = seoDescription.length;
    const urlLength = slug.length;

    const keywordDensity =
      keyword && wordCount > 0
        ? (countOccurrences(plainContent, keyword) / wordCount) * 100
        : 0;

    const checks: CheckResult[] = [];

    checks.push({
      label: "Focus keyword in SEO title",
      pass: keyword ? effectiveTitle.toLowerCase().includes(keyword) : false,
      detail: keyword
        ? effectiveTitle.toLowerCase().includes(keyword)
          ? "Found"
          : "Not found in title"
        : "No keyword set",
    });

    checks.push({
      label: "Focus keyword in meta description",
      pass: keyword ? seoDescription.toLowerCase().includes(keyword) : false,
      detail: keyword
        ? seoDescription.toLowerCase().includes(keyword)
          ? "Found"
          : "Not found in description"
        : "No keyword set",
    });

    checks.push({
      label: "Focus keyword in URL/slug",
      pass: keyword ? slug.toLowerCase().includes(keyword) : false,
      detail: keyword
        ? slug.toLowerCase().includes(keyword)
          ? "Found"
          : "Not found in slug"
        : "No keyword set",
    });

    checks.push({
      label: "Focus keyword in first paragraph",
      pass: keyword ? firstParagraph.toLowerCase().includes(keyword) : false,
      detail: keyword
        ? firstParagraph.toLowerCase().includes(keyword)
          ? "Found"
          : "Not found in opening paragraph"
        : "No keyword set",
    });

    checks.push({
      label: "Focus keyword in subheadings",
      pass: keyword ? subheadings.toLowerCase().includes(keyword) : false,
      detail: keyword
        ? subheadings.toLowerCase().includes(keyword)
          ? "Found in H2/H3"
          : "Not found in subheadings"
        : "No keyword set",
    });

    const densityPass = keyword
      ? keywordDensity >= 1 && keywordDensity <= 3
      : false;
    checks.push({
      label: "Keyword density",
      pass: densityPass,
      detail: keyword
        ? `${keywordDensity.toFixed(1)}% (ideal: 1-3%)`
        : "No keyword set",
    });

    const titleLenPass = seoTitleLength >= 50 && seoTitleLength <= 60;
    checks.push({
      label: "SEO title length",
      pass: titleLenPass,
      detail: `${seoTitleLength} characters (ideal: 50-60)`,
    });

    const descLenPass = descLength >= 120 && descLength <= 160;
    checks.push({
      label: "Meta description length",
      pass: descLenPass,
      detail: `${descLength} characters (ideal: 120-160)`,
    });

    checks.push({
      label: "Content length",
      pass: wordCount >= 1500,
      detail: `${wordCount.toLocaleString()} words (ideal: 1,500+)`,
    });

    checks.push({
      label: "Has H2/H3 subheadings",
      pass: hasHeadings(content),
      detail: hasHeadings(content) ? "Present" : "No subheadings found",
    });

    checks.push({
      label: "Has images",
      pass: hasImages(content),
      detail: hasImages(content) ? "Present" : "No images found",
    });

    checks.push({
      label: "External links",
      pass: hasExtLinks,
      detail: hasExtLinks ? "Present" : "No external links found",
    });

    checks.push({
      label: "Internal links",
      pass: hasIntLinks,
      detail: hasIntLinks ? "Present" : "No internal links found",
    });

    checks.push({
      label: "URL length",
      pass: urlLength <= 75 && urlLength > 0,
      detail: `${urlLength} characters (ideal: under 75)`,
    });

    const passedCount = checks.filter((c) => c.pass).length;
    const score = Math.round((passedCount / checks.length) * 100);

    return { checks, score, passedCount, total: checks.length };
  }, [title, content, seoTitle, seoDescription, focusKeywords, slug, primaryKeyword]);

  const { checks, score, passedCount, total } = analysis;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  const seoTitleChecks = checks.filter((c) =>
    ["Focus keyword in SEO title", "SEO title length"].includes(c.label)
  );
  const contentChecks = checks.filter((c) =>
    [
      "Focus keyword in meta description",
      "Focus keyword in URL/slug",
      "Focus keyword in first paragraph",
      "Focus keyword in subheadings",
      "Keyword density",
      "Content length",
      "Has H2/H3 subheadings",
      "Has images",
      "External links",
      "Internal links",
      "URL length",
    ].includes(c.label)
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={getScoreRingColor(score)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-text-primary">
            SEO Score: {passedCount}/{total} checks passed
          </p>
          <p className="text-[11px] text-gray-400 font-semibold">
            {score <= 40
              ? "Your content needs significant SEO improvements."
              : score <= 70
                ? "Good progress — a few more optimizations will boost your ranking."
                : "Excellent! Your content is well-optimized for search engines."}
          </p>
        </div>
      </div>

      <CheckGroup title="SEO Title" checks={seoTitleChecks} />
      <CheckGroup title="Content" checks={contentChecks} />
    </div>
  );
}

function CheckGroup({ title, checks }: { title: string; checks: CheckResult[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {title}
      </h4>
      <div className="flex flex-col gap-1.5">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-2.5 py-1.5 px-3 rounded-md bg-bg-light/60 border border-border-subtle"
          >
            {check.pass ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span className="text-xs font-bold text-text-primary flex-1 min-w-0">
              {check.label}
            </span>
            <span
              className={`text-[10px] font-semibold shrink-0 ${
                check.pass ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {check.detail}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
