"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, GripVertical, Layout, Megaphone, Share2, Code, Clock, TrendingUp, HelpCircle } from "lucide-react";

interface SidebarWidget {
  id: string;
  type: "ad" | "social" | "html" | "latest_posts" | "trending" | "newsletter" | "custom";
  title: string;
  enabled: boolean;
  settings: Record<string, any>;
}

const WIDGET_TYPES = [
  { type: "ad", label: "Advertisement", icon: Megaphone, description: "Display an ad from Ad Manager" },
  { type: "social", label: "Social Icons", icon: Share2, description: "Follow us social media links" },
  { type: "html", label: "Custom HTML", icon: Code, description: "Any custom HTML/JS code" },
  { type: "latest_posts", label: "Latest Posts", icon: Clock, description: "Recent articles from any category" },
  { type: "trending", label: "Trending Posts", icon: TrendingUp, description: "Most viewed articles" },
  { type: "newsletter", label: "Newsletter Signup", icon: HelpCircle, description: "Email subscription box" },
  { type: "custom", label: "Custom Widget", icon: Layout, description: "Title + custom HTML content" },
];

function generateId() {
  return `wgt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function SidebarBuilderPage() {
  const [widgets, setWidgets] = useState<SidebarWidget[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [footerConfig, setFooterConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/footer-config", { credentials: "include" })
      .then(r => r.json())
      .then(d => setFooterConfig(d.config?.socialLinks || {}));
    fetch("/api/admin/sidebar-config", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        try {
          const parsed = JSON.parse(d.value || "{}");
          setWidgets(parsed.widgets || []);
        } catch { setWidgets([]); }
      });
  }, []);

  const addWidget = (type: string) => {
    const wType = WIDGET_TYPES.find(w => w.type === type)!;
    const newWidget: SidebarWidget = {
      id: generateId(),
      type: type as any,
      title: wType.label,
      enabled: true,
      settings: type === "ad" ? { adPlacement: "SIDEBAR" } :
                type === "social" ? {} :
                type === "html" ? { code: "" } :
                type === "latest_posts" ? { categorySlug: "", count: 5 } :
                type === "trending" ? { count: 5 } :
                type === "newsletter" ? { description: "Get the latest news delivered to your inbox." } :
                type === "custom" ? { html: "" } : {},
    };
    setWidgets([...widgets, newWidget]);
    setExpandedId(newWidget.id);
  };

  const updateWidget = (id: string, patch: Partial<SidebarWidget>) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...patch } : w));
  };

  const updateWidgetSettings = (id: string, key: string, value: any) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, settings: { ...w.settings, [key]: value } } : w));
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const moveWidget = (id: string, direction: -1 | 1) => {
    const idx = widgets.findIndex(w => w.id === id);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= widgets.length) return;
    const arr = [...widgets];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    setWidgets(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sidebar-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ widgets }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (e) {
      console.error("Failed to save sidebar config:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 select-none max-w-5xl">
      <div className="flex items-center justify-between pb-6 border-b border-border-subtle">
        <div>
          <h1 className="font-serif font-black text-2xl text-text-primary tracking-tight">Post Sidebar Builder</h1>
          <p className="text-xs font-semibold text-gray-400 mt-1">Configure widgets that appear in the sidebar on every post page.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md text-xs font-bold tracking-wide transition-all ${
            saved ? "bg-green-500 text-white" : "bg-brand-primary hover:bg-brand-hover text-white"
          } disabled:opacity-50`}
        >
          <Save className="w-4 h-4" /> {saving ? "Saving..." : saved ? "Saved!" : "Save Sidebar"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Widget List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {widgets.length === 0 && (
            <div className="bg-white border-2 border-dashed border-border-subtle rounded-md p-12 text-center">
              <Layout className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">No widgets yet</p>
              <p className="text-xs text-gray-300 mt-1">Click a widget type on the right to add it.</p>
            </div>
          )}

          {widgets.map((widget, idx) => {
            const wType = WIDGET_TYPES.find(w => w.type === widget.type);
            const Icon = wType?.icon || Layout;
            const isExpanded = expandedId === widget.id;

            return (
              <div key={widget.id} className={`bg-white border rounded-md shadow-sm overflow-hidden transition-all ${widget.enabled ? "border-border-subtle" : "border-gray-200 opacity-60"}`}>
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg-light/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : widget.id)}
                >
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab" />
                  <Icon className="w-4 h-4 text-brand-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={widget.title}
                      onChange={(e) => updateWidget(widget.id, { title: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-text-primary bg-transparent border-none outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, -1); }}
                      disabled={idx === 0}
                      className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20"
                      title="Move up"
                    >▲</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 1); }}
                      disabled={idx === widgets.length - 1}
                      className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20"
                      title="Move down"
                    >▼</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateWidget(widget.id, { enabled: !widget.enabled }); }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${widget.enabled ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {widget.enabled ? "ON" : "OFF"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                      className="p-1 text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border-subtle bg-bg-light/20">
                    {widget.type === "ad" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Ad Placement</label>
                        <select
                          value={widget.settings.adPlacement || "SIDEBAR"}
                          onChange={(e) => updateWidgetSettings(widget.id, "adPlacement", e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md outline-none"
                        >
                          <option value="SIDEBAR">Sidebar (default)</option>
                          <option value="ABOVE_HEADING">Above Heading</option>
                          <option value="BELOW_HEADING">Below Heading</option>
                          <option value="START_OF_ARTICLE">Start of Article</option>
                          <option value="END_OF_ARTICLE">End of Article</option>
                        </select>
                      </div>
                    )}

                    {widget.type === "html" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">HTML Code</label>
                        <textarea
                          value={widget.settings.code || ""}
                          onChange={(e) => updateWidgetSettings(widget.id, "code", e.target.value)}
                          rows={4}
                          placeholder="<div>Your HTML here...</div>"
                          className="w-full text-xs font-mono px-3 py-2 border border-border-subtle bg-white rounded-md outline-none resize-y"
                        />
                      </div>
                    )}

                    {widget.type === "social" && (
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Social Links</p>
                        <p className="text-xs text-gray-500">Social icons are configured in the Footer Builder. This widget will display them in the post sidebar.</p>
                      </div>
                    )}

                    {widget.type === "latest_posts" && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Category Slug (blank=all)</label>
                          <input
                            type="text"
                            value={widget.settings.categorySlug || ""}
                            onChange={(e) => updateWidgetSettings(widget.id, "categorySlug", e.target.value)}
                            placeholder="e.g. technology"
                            className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Count</label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={widget.settings.count || 5}
                            onChange={(e) => updateWidgetSettings(widget.id, "count", Number(e.target.value))}
                            className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {widget.type === "trending" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Count</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={widget.settings.count || 5}
                          onChange={(e) => updateWidgetSettings(widget.id, "count", Number(e.target.value))}
                          className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md outline-none max-w-[120px]"
                        />
                      </div>
                    )}

                    {widget.type === "newsletter" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                        <input
                          type="text"
                          value={widget.settings.description || ""}
                          onChange={(e) => updateWidgetSettings(widget.id, "description", e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle bg-white rounded-md outline-none"
                        />
                      </div>
                    )}

                    {widget.type === "custom" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Custom HTML Content</label>
                        <textarea
                          value={widget.settings.html || ""}
                          onChange={(e) => updateWidgetSettings(widget.id, "html", e.target.value)}
                          rows={5}
                          placeholder="<p>Any HTML content...</p>"
                          className="w-full text-xs font-mono px-3 py-2 border border-border-subtle bg-white rounded-md outline-none resize-y"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Widget Type Picker */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border-subtle rounded-md shadow-sm overflow-hidden sticky top-24">
            <div className="px-4 py-3 bg-bg-light/40 border-b border-border-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">Add Widget</h3>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
              {WIDGET_TYPES.map((wType) => {
                const Icon = wType.icon;
                return (
                  <button
                    key={wType.type}
                    onClick={() => addWidget(wType.type)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-left hover:bg-bg-light transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-brand-primary shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-text-primary group-hover:text-brand-primary transition-colors">{wType.label}</p>
                      <p className="text-[10px] text-gray-400">{wType.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
