// src/app/(public)/layout.tsx
import { Suspense } from "react";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import AdBanner from "@/components/public/AdBanner";

function HeaderFallback() {
  return <div className="h-[120px] bg-white" />;
}

function FooterFallback() {
  return <div className="h-[200px] bg-gray-50" />;
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={<HeaderFallback />}>
        <Header />
      </Suspense>
      <Suspense fallback={null}>
        <AdBanner placement="HEADER" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2" />
      </Suspense>
      <main className="flex-grow">{children}</main>
      <Suspense fallback={null}>
        <AdBanner placement="FOOTER" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" />
      </Suspense>
      <Suspense fallback={<FooterFallback />}>
        <Footer />
      </Suspense>
    </div>
  );
}
