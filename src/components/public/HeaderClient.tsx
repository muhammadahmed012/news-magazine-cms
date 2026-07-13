// src/components/public/HeaderClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

interface MenuItem {
  id: string;
  label: string;
  link: string;
  target?: "_self" | "_blank";
  children?: { id: string; label: string; link: string; target?: "_self" | "_blank" }[];
}

interface SocialLinks {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

interface HeaderClientProps {
  siteName: string;
  logoUrl?: string;
  sticky: boolean;
  transparent: boolean;
  logoPosition: string;
  menuItems: MenuItem[];
  socialLinks: SocialLinks;
  session: any;
}

export default function HeaderClient({
  siteName,
  logoUrl,
  sticky,
  transparent,
  logoPosition,
  menuItems,
  socialLinks,
  session,
}: HeaderClientProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!sticky) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sticky]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`w-full z-40 transition-all duration-300 ${
          sticky ? "sticky top-0" : "relative"
        } ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border-subtle py-2.5"
            : transparent
            ? "bg-transparent py-4 text-white"
            : "bg-white border-b border-border-subtle py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className={`flex items-center ${logoPosition === "center" ? "order-2" : "order-1"}`}>
            <Link href="/" className="flex items-center gap-2 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
              ) : (
                <span className="font-serif font-black text-2xl tracking-tight text-text-primary group-hover:text-brand-primary transition-colors">
                  {siteName}
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center space-x-1 ${logoPosition === "center" ? "order-1" : "order-2"}`}>
            {menuItems.map((item) => (
              <div key={item.id} className="relative group/nav py-2">
                <Link
                  href={item.link}
                  target={item.target}
                  className="px-3 py-2 text-sm font-semibold tracking-wide text-text-primary hover:text-brand-primary transition-colors duration-150 inline-flex items-center gap-1.5"
                >
                  {item.label}
                  {item.children && (
                    <span className="w-1.5 h-1.5 border-r border-b border-current rotate-45 transform -translate-y-[2px] transition-transform group-hover/nav:rotate-[-135deg] group-hover/nav:translate-y-[1px]" />
                  )}
                </Link>
                {item.children && (
                  <div className="absolute left-0 mt-2 w-56 rounded-md bg-white border border-border-subtle shadow-lg opacity-0 invisible translate-y-2 group-hover/nav:opacity-100 group-hover/nav:visible group-hover/nav:translate-y-0 transition-all duration-200 z-50 py-1.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.link}
                        target={child.target}
                        className="block px-4 py-2 text-xs font-semibold text-text-primary hover:bg-bg-light hover:text-brand-primary transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 order-4">
            {/* Social Icons */}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-brand-primary transition-colors hidden sm:block" aria-label="Twitter / X">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-brand-primary transition-colors hidden sm:block" aria-label="Facebook">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-brand-primary transition-colors hidden sm:block" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            )}

            {/* Admin user menu — only if logged in */}
            {session && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-bg-light border border-border-subtle transition-all"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">
                      {session.user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-border-subtle shadow-xl rounded-lg z-50 py-1.5">
                    <div className="px-4 py-2 border-b border-border-subtle">
                      <p className="text-xs font-bold text-text-primary truncate">{session.user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{session.user.role}</p>
                    </div>
                    {["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR"].includes(session.user.role) && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-text-primary hover:bg-bg-light hover:text-brand-primary transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Control Panel
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-bg-light transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-primary hover:text-brand-primary transition-colors rounded-full hover:bg-bg-light md:hidden"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border-subtle bg-white px-4 pt-2 pb-6 space-y-1 shadow-lg absolute w-full left-0 z-50">
            {menuItems.map((item) => (
              <div key={item.id} className="py-1">
                <Link
                  href={item.link}
                  target={item.target}
                  className="block px-3 py-2 text-sm font-bold text-text-primary hover:text-brand-primary transition-colors"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 border-l border-border-subtle mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.link}
                        target={child.target}
                        className="block px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-brand-primary transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {/* Mobile Social Icons */}
            <div className="flex items-center gap-3 px-3 pt-3 mt-2 border-t border-border-subtle">
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-brand-primary" aria-label="Twitter / X">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-brand-primary" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-brand-primary" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-brand-primary" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
            </div>
          </div>
        )}
      </header>

    </>
  );
}
