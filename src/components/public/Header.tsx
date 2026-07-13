// src/components/public/Header.tsx
import { getSetting } from "@/lib/settings";
import { auth } from "@/lib/auth";
import AnnouncementBar from "./AnnouncementBar";
import NewsTicker from "./NewsTicker";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const [general, config, session, footerConfig] = await Promise.all([
    getSetting("general_settings"),
    getSetting("header_config"),
    auth(),
    getSetting("footer_config"),
  ]);

  const siteName = general?.siteName || "Chronicle";
  const logoUrl = config?.logoUrl || general?.logoUrl || "";
  const announcementText = general?.announcementText || "";
  const announcementLink = general?.announcementLink || "";
  const announcementEnabled = general?.announcementEnabled ?? true;
  const tickerEnabled = general?.tickerEnabled ?? true;
  const tickerText = general?.tickerText || "";

  const sticky = config?.sticky ?? true;
  const transparent = config?.transparent ?? false;
  const logoPosition = config?.logoPosition || "left";
  const menuItems = config?.menuItems || [];
  const socialLinks = {
    twitter: config?.socialLinks?.twitter || general?.twitterUrl || "",
    facebook: config?.socialLinks?.facebook || general?.facebookUrl || "",
    linkedin: config?.socialLinks?.linkedin || general?.linkedinUrl || "",
    instagram: config?.socialLinks?.instagram || "",
    youtube: config?.socialLinks?.youtube || "",
    github: config?.socialLinks?.github || "",
  };

  return (
    <>
      <AnnouncementBar
        text={announcementText}
        link={announcementLink}
        enabled={announcementEnabled}
      />
      <HeaderClient
        siteName={siteName}
        logoUrl={logoUrl}
        sticky={sticky}
        transparent={transparent}
        logoPosition={logoPosition}
        menuItems={menuItems}
        socialLinks={socialLinks}
        session={session}
      />
      <NewsTicker text={tickerText} enabled={tickerEnabled} />
    </>
  );
}
