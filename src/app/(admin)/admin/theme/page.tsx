// src/app/(admin)/admin/theme/page.tsx
import { getSetting } from "@/lib/settings";
import { saveSetting } from "@/actions/admin-settings";
import { Palette, CheckCircle, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminThemePage() {
  const colors = await getSetting("theme_colors");

  const primary = colors?.primary || "#5F4A8B";
  const primaryHover = colors?.primaryHover || "#4C3B70";
  const secondary = colors?.secondary || "#FEFACD";
  const background = colors?.background || "#FFFFFF";
  const text = colors?.text || "#1A1A1A";
  const border = colors?.border || "#EAEAEA";
  const lightGray = colors?.lightGray || "#F5F5F5";

  // Server action handle form submit
  const handleSaveThemeForm = async (formData: FormData) => {
    "use server";
    
    const colorsObj = {
      primary: formData.get("primary") as string,
      primaryHover: formData.get("primaryHover") as string,
      secondary: formData.get("secondary") as string,
      background: formData.get("background") as string,
      text: formData.get("text") as string,
      border: formData.get("border") as string,
      lightGray: formData.get("lightGray") as string,
    };

    await saveSetting("theme_colors", JSON.stringify(colorsObj));
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl select-none">
      {/* Header section */}
      <div className="pb-6 border-b border-border-subtle">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Theme & Branding Customizer
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Adjust the visual design tokens of the publication. Changes apply in real-time across the website.
        </p>
      </div>

      <form action={handleSaveThemeForm} className="bg-white border border-border-subtle p-8 rounded-md shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-1.5 border-b border-border-subtle pb-4 mb-2">
          <Palette className="w-5 h-5 text-brand-primary" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">
            Branding Colors System
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 bg-bg-light/40 border border-border-subtle rounded-md gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Primary Brand Color</span>
              <span className="text-[10px] text-gray-400">Used for links, active tabs, highlights (Default: Ultra Violet)</span>
            </div>
            <input
              type="color"
              name="primary"
              defaultValue={primary}
              className="w-12 h-12 rounded border border-border-subtle cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-light/40 border border-border-subtle rounded-md gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Primary Hover Color</span>
              <span className="text-[10px] text-gray-400">Darker variation of primary color shown on button hovers</span>
            </div>
            <input
              type="color"
              name="primaryHover"
              defaultValue={primaryHover}
              className="w-12 h-12 rounded border border-border-subtle cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-light/40 border border-border-subtle rounded-md gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Secondary Accent Color</span>
              <span className="text-[10px] text-gray-400">Pills, cards overlays, highlights (Default: Lemon Chiffon)</span>
            </div>
            <input
              type="color"
              name="secondary"
              defaultValue={secondary}
              className="w-12 h-12 rounded border border-border-subtle cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-light/40 border border-border-subtle rounded-md gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Global Background Color</span>
              <span className="text-[10px] text-gray-400">Base background layout color of the website (Default: White)</span>
            </div>
            <input
              type="color"
              name="background"
              defaultValue={background}
              className="w-12 h-12 rounded border border-border-subtle cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-light/40 border border-border-subtle rounded-md gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Main Typography Color</span>
              <span className="text-[10px] text-gray-400">Base color for text elements and headings (Default: Dark Text)</span>
            </div>
            <input
              type="color"
              name="text"
              defaultValue={text}
              className="w-12 h-12 rounded border border-border-subtle cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-light/40 border border-border-subtle rounded-md gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Light Gray Background</span>
              <span className="text-[10px] text-gray-400">Default shading for sidebar containers and tickers (Default: Light Gray)</span>
            </div>
            <input
              type="color"
              name="lightGray"
              defaultValue={lightGray}
              className="w-12 h-12 rounded border border-border-subtle cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-bg-light/40 border border-border-subtle rounded-md gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-text-primary">Subtle Border Lines</span>
              <span className="text-[10px] text-gray-400">Borders for cards and headers dividers (Default: subtle gray)</span>
            </div>
            <input
              type="color"
              name="border"
              defaultValue={border}
              className="w-12 h-12 rounded border border-border-subtle cursor-pointer shrink-0"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-brand-primary hover:bg-brand-hover text-white py-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors self-end px-6 mt-4"
        >
          <CheckCircle className="w-4 h-4" /> Save Branding Theme
        </button>
      </form>
    </div>
  );
}
