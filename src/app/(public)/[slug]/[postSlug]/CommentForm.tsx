// src/app/(public)/[category]/[postSlug]/CommentForm.tsx
"use client";

import { useState } from "react";
import { createComment } from "@/actions/comments";
import { Send, RefreshCw } from "lucide-react";

interface CommentFormProps {
  postId: string;
  session: any; // NextAuth session
}

export default function CommentForm({ postId, session }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await createComment({
        postId,
        content: content.trim(),
        authorId: session?.user?.id || undefined,
        guestName: session ? undefined : guestName || "Anonymous",
        guestEmail: session ? undefined : guestEmail || "guest@example.com",
      });

      if (response.success) {
        setContent("");
        setGuestName("");
        setGuestEmail("");
        setMessage({ type: "success", text: "Comment submitted successfully!" });
      } else {
        setMessage({ type: "error", text: response.error || "Failed to submit comment." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-bg-light/40 border border-border-subtle p-5 rounded-md">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2">
          Join the Conversation
        </h4>
        <textarea
          required
          rows={3}
          placeholder="Share your perspective on this article..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full text-xs font-semibold px-4 py-3.5 bg-white border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary resize-y"
        />
      </div>

      {!session && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Jameson Blake"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full text-xs font-semibold px-4 py-2.5 bg-white border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Your Email</label>
            <input
              type="email"
              placeholder="e.g. jameson@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full text-xs font-semibold px-4 py-2.5 bg-white border border-border-subtle rounded-md focus:border-brand-primary outline-none text-text-primary"
            />
          </div>
        </div>
      )}

      {message && (
        <div
          className={`text-xs font-bold p-3 rounded-md border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-primary hover:bg-brand-hover text-white px-5 py-3 rounded-md text-xs font-bold tracking-wide flex items-center justify-center gap-2 self-end transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Submitting...
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" /> Submit Comment
          </>
        )}
      </button>
    </form>
  );
}
