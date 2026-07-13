// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { getSetting } from "@/lib/settings";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const general = await getSetting("general_settings");
  return {
    title: {
      default: general?.siteName || "Chronicle",
      template: `%s | ${general?.siteName || "Chronicle"}`,
    },
    description: general?.siteDescription || "Premium, minimal & modern enterprise News & Magazine CMS.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch branding and theme colors from Database
  const colors = await getSetting("theme_colors");

  const primary = colors?.primary || "#5F4A8B";
  const secondary = colors?.secondary || "#FEFACD";
  const background = colors?.background || "#FFFFFF";
  const text = colors?.text || "#1A1A1A";
  const lightGray = colors?.lightGray || "#F5F5F5";
  const border = colors?.border || "#EAEAEA";
  const primaryHover = colors?.primaryHover || "#4C3B70";

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --brand-primary: ${primary};
                --brand-secondary: ${secondary};
                --brand-primary-hover: ${primaryHover};
                --bg-primary: ${background};
                --bg-light: ${lightGray};
                --text-primary: ${text};
                --border-subtle: ${border};
                --font-sans: var(--font-inter), system-ui, sans-serif;
                --font-serif: var(--font-playfair), Georgia, serif;
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
