"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Tag, Search } from "lucide-react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export default function TagsManager() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/admin/tags", { credentials: "include" });
      const data = await res.json();
      setTags(data.tags || []);
    } catch (e) {
      console.error("Failed to fetch tags:", e);
    }
  };

  useEffect(() => { fetchTags(); }, []);

  const handleCreate = async () => {
    if (!newTagName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      if (res.ok) {
        setNewTagName("");
        fetchTags();
      }
    } catch (e) {
      console.error("Failed to create tag:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    try {
      await fetch(`/api/admin/tags?id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _action: "delete" }),
      });
      fetchTags();
    } catch (e) {
      console.error("Failed to delete tag:", e);
    }
  };

  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-brand-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Tags</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-bg-light px-1.5 py-0.5 rounded border border-border-subtle">{tags.length}</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New tag name..."
            className="flex-1 text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={saving || !newTagName.trim()}
            className="px-3 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tags..."
            className="w-full text-xs font-semibold pl-8 pr-3 py-2 border border-border-subtle rounded-md focus:border-brand-primary outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-1">
        {filtered.map((tag) => (
          <div
            key={tag.id}
            className="group flex items-center gap-1.5 bg-bg-light border border-border-subtle rounded-md px-3 py-1.5 hover:border-brand-primary/30 transition-colors"
          >
            <span className="text-xs font-semibold text-text-primary">{tag.name}</span>
            {tag._count && (
              <span className="text-[9px] font-bold text-gray-400">({tag._count.posts})</span>
            )}
            <button
              onClick={() => handleDelete(tag.id)}
              className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-1"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-gray-400 italic py-4">{search ? "No tags match your search." : "No tags created yet."}</p>
        )}
      </div>
    </div>
  );
}
