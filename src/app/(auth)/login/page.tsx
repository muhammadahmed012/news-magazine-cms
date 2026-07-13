// src/app/(auth)/login/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { getSetting } from "@/lib/settings";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your Chronicle CMS account",
};

export default async function LoginPage() {
  const session = await auth();

  // Already logged in — redirect to admin
  if (session) {
    redirect("/admin");
  }

  const general = await getSetting("general_settings");
  const siteName = general?.siteName || "Chronicle";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif font-black text-4xl text-brand-primary tracking-tight">{siteName}</h1>
          <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Editorial Management System</p>
        </div>

        <div className="bg-white border border-border-subtle rounded-lg shadow-sm p-8">
          <h2 className="font-serif font-black text-xl text-text-primary mb-1">Welcome back</h2>
          <p className="text-xs text-gray-400 font-semibold mb-8">Sign in to your publishing account to continue.</p>

          <LoginForm />

          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <p className="text-[10px] text-gray-400 font-semibold">
              Demo credentials: <span className="text-brand-primary font-bold">admin@example.com</span> / <span className="text-brand-primary font-bold">admin123</span>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-semibold mt-6">
          &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
