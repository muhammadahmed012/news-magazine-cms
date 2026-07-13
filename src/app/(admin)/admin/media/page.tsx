// src/app/(admin)/admin/media/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Search, Upload, Trash2, HardDrive, X, Copy, Check } from "lucide-react";

interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  folderPath: string;
  altText: string | null;
  caption: string | null;
  createdAt: string;
}

export default function AdminMediaLibraryPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/media", { credentials: "include" });
      const data = await res.json();
      setMediaItems(data.items || []);
    } catch {
      console.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setMediaItems(prev => [data.media, ...prev]);
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
      setMediaItems(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = mediaItems.filter(item =>
    item.fileName.toLowerCase().includes(search.toLowerCase()) ||
    (item.altText && item.altText.toLowerCase().includes(search.toLowerCase()))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalSize = mediaItems.reduce((sum, item) => sum + item.fileSize, 0);

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Header */}
      <div className="pb-6 border-b border-border-subtle">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Media Library
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Upload, manage, and organize your media assets. Drag & drop or click to upload.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Media Grid View (col-span-9) */}
        <div className="lg:col-span-9 bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-brand-primary" /> Media Library ({mediaItems.length} files, {formatFileSize(totalSize)})
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold border border-border-subtle rounded-md focus:border-brand-primary outline-none"
              />
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-brand-primary", "bg-brand-primary/5"); }}
            onDragLeave={(e) => { e.currentTarget.classList.remove("border-brand-primary", "bg-brand-primary/5"); }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-brand-primary", "bg-brand-primary/5");
              const files = e.dataTransfer.files;
              if (files.length > 0 && fileInputRef.current) {
                const dt = new DataTransfer();
                for (const file of Array.from(files)) dt.items.add(file);
                fileInputRef.current.files = dt.files;
                fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }}
            className="border-2 border-dashed border-border-subtle rounded-md p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all"
          >
            <Upload className="w-8 h-8 text-gray-300" />
            <div className="text-center">
              <p className="text-xs font-bold text-gray-500">
                {uploading ? "Uploading..." : "Click to upload or drag & drop files here"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Images, videos, audio, PDFs — Max 10MB per file
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*,.pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Grid display */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-bg-light/40 border border-dashed border-border-subtle rounded-md">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-xs font-bold text-gray-400">
                {search ? "No media matches your search" : "Your media library is empty."}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Upload your first file using the area above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="group relative border border-border-subtle rounded overflow-hidden aspect-square bg-bg-light shadow-sm flex flex-col">
                  {item.mimeType.startsWith("image/") ? (
                    <img src={item.fileUrl} alt={item.altText || ""} className="w-full h-full object-cover select-none" loading="lazy" />
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
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 z-10">
                    <span className="text-[9px] font-bold text-white truncate max-w-full">
                      {item.fileName}
                    </span>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleCopyUrl(item.fileUrl, item.id)}
                        className="text-[9px] font-bold text-brand-secondary underline hover:text-white flex items-center gap-1"
                      >
                        {copiedId === item.id ? (
                          <><Check className="w-3 h-3 text-green-400" /> Copied</>
                        ) : (
                          "Copy URL"
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: File Info Panel (col-span-3) */}
        <div className="lg:col-span-3 bg-white border border-border-subtle p-6 rounded-md shadow-sm flex flex-col gap-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary border-b border-border-subtle pb-4">
            Upload Tips
          </h3>

          <div className="flex flex-col gap-4 text-[11px] text-gray-500 leading-relaxed">
            <div className="flex gap-2">
              <ImageIcon className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-700">Drag & Drop</span>
                <p>Drag files directly onto the upload area for quick uploads.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Copy className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-700">Copy URLs</span>
                <p>Hover any file and click &quot;Copy URL&quot; to paste it anywhere — editors, settings, or code.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Upload className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-700">Multiple Files</span>
                <p>Select multiple files at once by holding Ctrl/Cmd while choosing files.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded p-3 text-[10px] font-semibold text-blue-700">
            Supported formats: JPEG, PNG, GIF, WebP, AVIF, SVG, MP4, WebM, PDF, MP3, WAV
          </div>
        </div>
      </div>
    </div>
  );
}
