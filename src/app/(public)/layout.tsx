// src/app/(public)/layout.tsx
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import AdBanner from "@/components/public/AdBanner";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AdBanner placement="HEADER" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" />
      <main className="flex-grow">{children}</main>
      <AdBanner placement="FOOTER" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" />
      <Footer />
    </div>
  );
}
