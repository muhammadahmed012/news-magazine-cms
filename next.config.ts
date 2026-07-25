import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-hook-form",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-table",
      "@tiptap/extension-table-row",
      "@tiptap/extension-table-header",
      "@tiptap/extension-table-cell",
      "@tiptap/extension-image",
      "@tiptap/extension-link",
      "@tiptap/extension-underline",
      "@tiptap/extension-text-align",
      "@tiptap/extension-highlight",
      "@tiptap/extension-character-count",
      "@tiptap/extension-horizontal-rule",
      "@tiptap/extension-code",
    ],
    inlineCss: true,
  },
  serverExternalPackages: ["postgres", "bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "*.uploadthing.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 768, 828, 1024, 1080, 1280, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  headers: async () => [
    { source: "/(.*)", headers: securityHeaders },
    {
      source: "/(.*)",
      has: [{ type: "header", key: "accept", value: ".*(text/html).*" }],
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, s-maxage=300, stale-while-revalidate=600" },
      ],
    },
    {
      source: "/_next/static/(.*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
