// src/components/admin/MediaPicker.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Upload, X, Image as ImageIcon, Trash2, Copy, Check } from "lucide-react";

interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  altText: string | null;
  caption: string | null;
  createdAt: string;
}

interface MediaPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaPicker({ onSelect, onClose }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/media", { credentials: "include" });
      const data = await res.json();
      setMedia(data.items || []);
    } catch {
      console.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));

      const res = await fetch("/api/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setMedia(prev => [data.media, ...prev]);
        onSelect(data.url);
        onClose();
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("altText", file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));

        const res = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.media) {
          setMedia(prev => [data.media, ...prev]);
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ _action: "delete", id }),
      });
      setMedia(prev => prev.filter(m => m.id !== id));
      if (selectedUrl) {
        setSelectedUrl(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter(item =>
    item.fileName.toLowerCase().includes(search.toLowerCase()) ||
    (item.altText && item.altText.toLowerCase().includes(search.toLowerCase()))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-primary" />
            <h2 className="text-sm font-bold text-text-primary">Media Library</h2>
            <span className="text-[10px] text-gray-400 font-semibold">({filteredMedia.length} items)</span>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-border-subtle bg-gray-50">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search media..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-border-subtle rounded-md focus:border-brand-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400">
                {search ? "No media matches your search" : "No media uploaded yet"}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Click &quot;Upload File&quot; to add images, videos, or documents.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {filteredMedia.map(item => (
                <div
                  key={item.id}
                  className={`group relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedUrl === item.fileUrl
                      ? "border-brand-primary ring-2 ring-brand-primary/20"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedUrl(item.fileUrl)}
                  onDoubleClick={() => { onSelect(item.fileUrl); onClose(); }}
                >
                  {item.mimeType.startsWith("image/") ? (
                    <img
                      src={item.fileUrl}
                      alt={item.altText || item.fileName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : item.mimeType.startsWith("video/") ? (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/70 uppercase">Video</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        {item.fileName.split(".").pop()}
                      </span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleCopyUrl(item.fileUrl, item.id); }}
                        className="p-1 bg-white/20 rounded hover:bg-white/40 transition-colors"
                        title="Copy URL"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-white" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-1 bg-white/20 rounded hover:bg-red-500/80 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <div className="text-[9px] font-bold text-white/80 truncate">{item.fileName}</div>
                  </div>

                  {/* Selected indicator */}
                  {selectedUrl === item.fileUrl && (
                    <div className="absolute inset-0 border-2 border-brand-primary rounded-md pointer-events-none">
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-border-subtle bg-gray-50">
          <p className="text-[10px] text-gray-400 font-semibold">
            {selectedUrl ? "Click &quot;Select&quot; or double-click an image to insert" : "Double-click to insert, single-click to select"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { if (selectedUrl) { onSelect(selectedUrl); onClose(); } }}
              disabled={!selectedUrl}
              className="px-4 py-2 bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
