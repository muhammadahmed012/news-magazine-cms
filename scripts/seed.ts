// scripts/seed.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env when running outside of Next.js
if (!process.env.DATABASE_URL) {
  const envPath = resolve(__dirname, "../.env");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  }
}

const rawUrl = process.env.DATABASE_URL!;
const url = rawUrl
  .replace(/&?prepared_statements=false/, "")
  .replace(/&?pgbouncer=true/, "")
  .replace(/[&?](connection_limit|pool_timeout|connect_timeout)=[^&]*/g, "");

const client = postgres(url);
const db = drizzle(client, { schema });

async function main() {
  console.log("Seeding database...");

  // 1. Clear database (order matters for FK constraints)
  await db.delete(schema.activityLogs);
  await db.delete(schema.attachments);
  await db.delete(schema.revisions);
  await db.delete(schema.comments);
  await db.delete(schema.ads);
  await db.delete(schema.postTags);
  await db.delete(schema.posts);
  await db.delete(schema.tags);
  await db.delete(schema.categories);
  await db.delete(schema.pages);
  await db.delete(schema.sessions);
  await db.delete(schema.accounts);
  await db.delete(schema.users);
  await db.delete(schema.settings);
  await db.delete(schema.newsletterSubscribers);

  console.log("Database cleared.");

  // 2. Create Settings
  const defaultColors = {
    primary: "#5F4A8B",
    secondary: "#FEFACD",
    background: "#FFFFFF",
    text: "#1A1A1A",
    lightGray: "#F5F5F5",
    border: "#EAEAEA",
    primaryHover: "#4C3B70"
  };

  const defaultGeneral = {
    siteName: "Chronicle",
    siteDescription: "Premium, minimal & modern enterprise News & Magazine CMS.",
    logoUrl: "",
    faviconUrl: "",
    announcementText: "Introducing Chronicle CMS v1.0 - Next-generation editorial engine for modern publishers",
    announcementLink: "/technology/introducing-chronicle",
    announcementEnabled: true,
    tickerEnabled: true,
    tickerText: "BREAKING: Global tech summit announces new AI safety protocols • Wall Street rallies as financial index reaches record highs • Sports: World Cup qualifiers enter final stretch • Gaming: New console generation revealed"
  };

  const defaultHeader = {
    sticky: true,
    transparent: false,
    logoPosition: "left",
    menuItems: [
      { id: "1", label: "Home", link: "/" },
      { id: "2", label: "Technology", link: "/technology" },
      { id: "3", label: "Business", link: "/business" },
      { id: "4", label: "Lifestyle", link: "/lifestyle" },
      { id: "5", label: "Politics", link: "/politics" },
      { id: "6", label: "Entertainment", link: "/entertainment" },
      { id: "7", label: "Sport", link: "/sport" },
      { id: "8", label: "Gaming", link: "/gaming" }
    ]
  };

  const defaultFooter = {
    columns: [
      {
        title: "About Chronicle",
        content: "Chronicle is an independent news organization delivering trusted, high-quality analysis and reporting on the ideas, trends, and technologies shaping our world."
      },
      {
        title: "Categories",
        links: [
          { label: "Technology", url: "/technology" },
          { label: "Business", url: "/business" },
          { label: "Lifestyle", url: "/lifestyle" },
          { label: "Politics", url: "/politics" },
          { label: "Entertainment", url: "/entertainment" },
          { label: "Sport", url: "/sport" },
          { label: "Gaming", url: "/gaming" }
        ]
      },
      {
        title: "Company",
        links: [
          { label: "About Us", url: "/about" },
          { label: "Careers", url: "/careers" },
          { label: "Advertise", url: "/advertise" },
          { label: "Contact", url: "/contact" }
        ]
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms & Conditions", url: "/terms" },
          { label: "Cookie Policy", url: "/cookies" }
        ]
      }
    ],
    copyright: "© 2026 Chronicle Media Group. All rights reserved.",
    socialLinks: {
      twitter: "https://twitter.com/chronicle",
      facebook: "https://facebook.com/chronicle",
      linkedin: "https://linkedin.com/company/chronicle"
    }
  };

  const defaultHomepageLayout = [
    { id: "ticker", type: "BreakingNews", enabled: true, settings: {} },
    { id: "hero", type: "HeroSlider", enabled: true, settings: { postsCount: 3 } },
    { id: "featured", type: "FeaturedArticles", enabled: true, settings: { title: "Editor's Picks", postsCount: 5 } },
    { id: "latest", type: "LatestNews", enabled: true, settings: { title: "Latest Stories", postsCount: 6 } },
    { id: "newsletter", type: "NewsletterSignup", enabled: true, settings: { title: "Subscribe to Chronicle", subtitle: "Stay informed with weekly analysis delivered to your inbox." } },
    { id: "cat-tech", type: "CategoryBlock", enabled: true, settings: { categorySlug: "technology", title: "Tech & Innovation", postsCount: 4, layout: "grid" } },
    { id: "cat-sport", type: "CategoryBlock", enabled: true, settings: { categorySlug: "sport", title: "Sports", postsCount: 3, layout: "row" } }
  ];

  const defaultSEO = {
    metaTitleTemplate: "%s | Chronicle",
    metaDescription: "Premium, minimal & modern enterprise News & Magazine CMS.",
    schemaOrg: {
      name: "Chronicle",
      logoUrl: "",
      facebookUrl: "",
      twitterUrl: ""
    }
  };

  const defaultSidebar = {
    blocks: [
      { id: "sb-1", type: "trending", title: "Trending Now", enabled: true, count: 5 },
      { id: "sb-2", type: "recent", title: "Recent Posts", enabled: true, count: 5 }
    ]
  };

  const now = new Date();

  await db.insert(schema.settings).values([
    { key: "theme_colors", value: JSON.stringify(defaultColors), updatedAt: now },
    { key: "general_settings", value: JSON.stringify(defaultGeneral), updatedAt: now },
    { key: "header_config", value: JSON.stringify(defaultHeader), updatedAt: now },
    { key: "footer_config", value: JSON.stringify(defaultFooter), updatedAt: now },
    { key: "homepage_layout", value: JSON.stringify(defaultHomepageLayout), updatedAt: now },
    { key: "seo_settings", value: JSON.stringify(defaultSEO), updatedAt: now },
    { key: "sidebar_config", value: JSON.stringify(defaultSidebar), updatedAt: now },
    { key: "sitemap_settings", value: JSON.stringify({ includePosts: true, includePages: true, includeCategories: true }), updatedAt: now },
    { key: "indexing_settings", value: JSON.stringify({ discourageIndexing: false }), updatedAt: now },
  ]);

  console.log("Settings seeded.");

  // 3. Create Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const authorPassword = await bcrypt.hash("author123", 10);

  const adminResult = await db.insert(schema.users).values({
    email: "admin@example.com",
    name: "Elizabeth Vance",
    passwordHash: adminPassword,
    role: "ADMIN",
    title: "Editor-in-Chief",
    bio: "Elizabeth Vance has over 15 years of experience in journalism and digital publishing.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
  }).returning();
  const admin = adminResult[0];

  const author1Result = await db.insert(schema.users).values({
    email: "author1@example.com",
    name: "David Chen",
    passwordHash: authorPassword,
    role: "AUTHOR",
    title: "Senior Tech Correspondent",
    bio: "David Chen covers AI, computing, and cybersecurity.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }).returning();
  const author1 = author1Result[0];

  const author2Result = await db.insert(schema.users).values({
    email: "author2@example.com",
    name: "Sarah Jenkins",
    passwordHash: authorPassword,
    role: "AUTHOR",
    title: "Financial Journalist",
    bio: "Sarah Jenkins covers macroeconomic trends, corporate finance, and emerging startups.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  }).returning();
  const author2 = author2Result[0];

  const author3Result = await db.insert(schema.users).values({
    email: "author3@example.com",
    name: "Marcus Rivera",
    passwordHash: authorPassword,
    role: "AUTHOR",
    title: "Sports & Entertainment Writer",
    bio: "Marcus covers sports, entertainment, and gaming culture.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  }).returning();
  const author3 = author3Result[0];

  console.log("Users seeded.");

  // 4. Create Categories
  const businessResult = await db.insert(schema.categories).values({
    name: "Business", slug: "business", description: "Global trade, economic policy, corporate strategies, and market analysis.",
    icon: "Briefcase", color: "#1A1A1A", layoutStyle: "grid", order: 1,
  }).returning();
  const business = businessResult[0];

  const lifestyleResult = await db.insert(schema.categories).values({
    name: "Lifestyle", slug: "lifestyle", description: "Health, wellness, travel, food, fashion, and modern living.",
    icon: "Heart", color: "#E91E63", layoutStyle: "editorial", order: 2,
  }).returning();
  const lifestyle = lifestyleResult[0];

  const technologyResult = await db.insert(schema.categories).values({
    name: "Technology", slug: "technology", description: "Software, hardware, AI, and engineering innovations reshaping the world.",
    icon: "Laptop", color: "#5F4A8B", layoutStyle: "grid", order: 3,
  }).returning();
  const technology = technologyResult[0];

  const politicsResult = await db.insert(schema.categories).values({
    name: "Politics", slug: "politics", description: "National governance, international diplomacy, and legislative updates.",
    icon: "Vote", color: "#E63946", layoutStyle: "list", order: 4,
  }).returning();
  const politics = politicsResult[0];

  const entertainmentResult = await db.insert(schema.categories).values({
    name: "Entertainment", slug: "entertainment", description: "Movies, music, TV, celebrity culture, and pop culture commentary.",
    icon: "Film", color: "#FF9800", layoutStyle: "grid", order: 5,
  }).returning();
  const entertainment = entertainmentResult[0];

  const sportResult = await db.insert(schema.categories).values({
    name: "Sport", slug: "sport", description: "Football, basketball, tennis, motorsport, and global athletics coverage.",
    icon: "Trophy", color: "#2E7D32", layoutStyle: "grid", order: 6,
  }).returning();
  const sport = sportResult[0];

  const gamingResult = await db.insert(schema.categories).values({
    name: "Gaming", slug: "gaming", description: "Console, PC, mobile gaming, esports, and game industry news.",
    icon: "Gamepad2", color: "#9C27B0", layoutStyle: "grid", order: 7,
  }).returning();
  const gaming = gamingResult[0];

  console.log("Categories seeded.");

  // 5. Create Tags
  const tagsData = await db.insert(schema.tags).values([
    { name: "Breaking News", slug: "breaking-news" },
    { name: "Analysis", slug: "analysis" },
    { name: "Exclusive", slug: "exclusive" },
    { name: "Trending", slug: "trending" },
    { name: "Opinion", slug: "opinion" },
    { name: "Review", slug: "review" },
    { name: "Interview", slug: "interview" },
    { name: "Feature", slug: "feature" },
    { name: "Investigation", slug: "investigation" },
    { name: "Live Updates", slug: "live-updates" },
  ]).returning();

  console.log("Tags seeded.");

  // 6. Helper to build article content
  const articleContent = (title: string, paragraphs: string[]) => JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: paragraphs[0] || "" }] },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Key Developments" }] },
      { type: "paragraph", content: [{ type: "text", text: paragraphs[1] || "" }] },
      { type: "paragraph", content: [{ type: "text", text: paragraphs[2] || "" }] },
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "What This Means Going Forward" }] },
      { type: "paragraph", content: [{ type: "text", text: paragraphs[3] || "" }] },
      { type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: `"${title}" is a story we will continue to follow closely as it develops.` }] }] }
    ]
  });

  // 7. Create Articles
  const biz1Result = await db.insert(schema.posts).values({
    title: "Global Markets Surge as Trade Tensions Ease Between US and China",
    slug: "global-markets-surge-trade-tensions",
    excerpt: "Major stock indices rallied to multi-month highs after both nations announced a temporary pause on new tariffs.",
    content: articleContent("Global Markets Surge", [
      "Global equity markets posted their strongest week in three months as the world's two largest economies signaled a willingness to restart trade negotiations. The S&P 500 gained 2.8%, while the Nasdaq climbed 3.4% driven by tech sector optimism.",
      "The pause on tariffs has given breathing room to multinational corporations that had been scrambling to restructure supply chains. Analysts at Goldman Sachs raised their year-end targets for the Dow Jones by 400 points following the announcement.",
      "Small and mid-cap stocks, which tend to be more domestically focused, also benefited from the news as investor confidence broadened across sectors. Energy stocks saw particular strength as crude oil prices stabilized above $78 per barrel.",
      "Market observers caution that while this is a positive signal, structural issues remain. The temporary nature of the tariff pause means businesses must remain agile and prepared for potential policy reversals in the coming quarters."
    ]),
    featuredImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    status: "PUBLISHED",
    publishedAt: new Date(),
    readingTime: 5,
    viewCount: 3200,
    isFeatured: true,
    authorId: author2.id,
    categoryId: business.id,
  }).returning();
  const biz1 = biz1Result[0];

  const biz2Result = await db.insert(schema.posts).values({
    title: "Amazon Acquires Major Retail Chain in $14 Billion Deal",
    slug: "amazon-acquires-retail-chain",
    excerpt: "The e-commerce giant continues its physical retail expansion with its largest brick-and-mortar acquisition to date.",
    content: articleContent("Amazon Acquires Major Retail Chain", [
      "Amazon has confirmed its acquisition of a leading national retail chain in a deal valued at approximately $14 billion, marking the company's most aggressive move into physical retail since its Whole Foods purchase.",
      "The deal gives Amazon access to over 800 physical store locations across North America, dramatically expanding its omnichannel capabilities. Industry experts see this as a strategic play to compete more directly with Walmart's hybrid shopping model.",
      "The acquired chain's private-label brands and established supply relationships with domestic manufacturers add immediate value to Amazon's product portfolio, particularly in groceries and household essentials.",
      "Regulatory scrutiny is expected, though antitrust analysts note that Amazon's market share in physical retail remains relatively small compared to traditional giants. The deal is expected to close by Q3 pending standard regulatory approvals."
    ]),
    featuredImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80",
    status: "PUBLISHED",
    publishedAt: new Date(Date.now() - 86400000),
    readingTime: 6,
    viewCount: 4100,
    isBreaking: true,
    authorId: author2.id,
    categoryId: business.id,
  }).returning();
  const biz2 = biz2Result[0];

  // Create remaining posts in batch using raw SQL-like inserts for brevity
  // (same data structure as before, using Drizzle insert)

  const postInserts = [
    // More business posts
    { title: "Remote Work Revolution: Fortune 500 Companies Permanently Adopt Hybrid Models", slug: "remote-work-hybrid-models-fortune-500", excerpt: "A landmark survey reveals that 72% of Fortune 500 companies have made hybrid work a permanent policy.", featuredImage: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&auto=format&fit=crop&q=80", readingTime: 7, viewCount: 2800, authorId: author2.id, categoryId: business.id },
    { title: "European Central Bank Signals Rate Cut Amid Slowing Growth", slug: "ecb-rate-cut-signal", excerpt: "ECB President hints at a 25 basis point cut as eurozone inflation falls below target for the first time in two years.", featuredImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 1900, authorId: author2.id, categoryId: business.id },
    { title: "Startup Funding Rebounds: VC Investment Hits $48B in Q2 2026", slug: "startup-funding-rebounds-q2-2026", excerpt: "Venture capital investment surged 34% quarter-over-quarter, led by AI infrastructure and climate tech deals.", featuredImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 1500, isTrending: true, authorId: author2.id, categoryId: business.id },
    { title: "Oil Prices Stabilize as OPEC Extends Production Cuts Through 2027", slug: "oil-prices-stabilize-opec-cuts", excerpt: "Brent crude holds above $80 as OPEC+ agrees to maintain current output levels for an additional 12 months.", featuredImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 2100, authorId: author2.id, categoryId: business.id },
    // Lifestyle
    { title: "The Rise of Slow Travel: Why More Tourists Are Choosing Trains Over Planes", slug: "slow-travel-trains-over-planes", excerpt: "A growing movement of travelers is embracing longer, more immersive journeys by rail across Europe and Asia.", featuredImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 2400, isFeatured: true, authorId: admin.id, categoryId: lifestyle.id },
    { title: "Mediterranean Diet Named Best Overall Diet for Eighth Consecutive Year", slug: "mediterranean-diet-best-2026", excerpt: "The annual ranking by health experts reaffirms the Mediterranean diet's dominance in nutritional science.", featuredImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 1800, authorId: admin.id, categoryId: lifestyle.id },
    { title: "Japan's Cherry Blossom Season Breaks Tourism Records with 12 Million Visitors", slug: "japan-cherry-blossom-tourism-records", excerpt: "Japan welcomed an unprecedented number of international visitors during the 2026 sakura season.", featuredImage: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 3100, isTrending: true, authorId: admin.id, categoryId: lifestyle.id },
    { title: "How Cold Water Swimming Became the World's Fastest Growing Fitness Trend", slug: "cold-water-swimming-fitness-trend", excerpt: "From Wim Hof to open-water clubs, the science-backed health benefits are drawing millions of new participants.", featuredImage: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 1600, authorId: admin.id, categoryId: lifestyle.id },
    { title: "The $50 Billion Wellness Tourism Industry Is Booming in Southeast Asia", slug: "wellness-tourism-southeast-asia-boom", excerpt: "Thailand, Bali, and Vietnam lead a wellness tourism surge driven by post-pandemic health consciousness.", featuredImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 1400, authorId: admin.id, categoryId: lifestyle.id },
    { title: "Plant-Based Restaurant Openings Outpace Traditional Dining for First Time", slug: "plant-based-restaurants-outpace-traditional", excerpt: "New data shows plant-based dining establishments opened at a faster rate than conventional restaurants in 2025.", featuredImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 1200, authorId: author1.id, categoryId: lifestyle.id },
    // Technology
    { title: "Apple Unveils Revolutionary Mixed Reality Headset at WWDC 2026", slug: "apple-mixed-reality-headset-wwdc-2026", excerpt: "The tech giant revealed its next-generation spatial computing device with a focus on mainstream affordability.", featuredImage: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&auto=format&fit=crop&q=80", readingTime: 7, viewCount: 8500, isFeatured: true, isBreaking: true, isTrending: true, authorId: author1.id, categoryId: technology.id },
    { title: "OpenAI Releases GPT-5: What the New Model Means for AI Applications", slug: "openai-gpt-5-release", excerpt: "GPT-5 achieves near-human performance across a broad range of reasoning benchmarks while using 60% less compute.", featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80", readingTime: 8, viewCount: 12000, isFeatured: true, isBreaking: true, authorId: author1.id, categoryId: technology.id },
    { title: "Quantum Computing Startup Achieves 10,000 Qubit Milestone", slug: "quantum-computing-10000-qubits", excerpt: "A Silicon Valley startup has shattered the previous qubit record, bringing practical quantum computing closer to reality.", featuredImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80", readingTime: 7, viewCount: 5200, isEditorPick: true, authorId: author1.id, categoryId: technology.id },
    { title: "Tesla's Fully Autonomous Robotaxi Fleet Begins Operating in Austin", slug: "tesla-autonomous-robotaxi-austin", excerpt: "Tesla launches its long-awaited driverless ride-hailing service in Austin, Texas.", featuredImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 6800, isTrending: true, authorId: author1.id, categoryId: technology.id },
    { title: "EU's Digital Markets Act Forces Major Platform Overhauls", slug: "eu-digital-markets-act-platform-overhauls", excerpt: "Big Tech companies are scrambling to comply with the EU's landmark antitrust regulation.", featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 3400, authorId: author1.id, categoryId: technology.id },
    { title: "Starlink's Third-Generation Satellites Deliver 1Gbps to Rural Communities", slug: "starlink-gen3-1gbps-rural", excerpt: "SpaceX's latest satellite constellation is closing the digital divide with gigabit speeds.", featuredImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 4100, authorId: author1.id, categoryId: technology.id },
    // Politics
    { title: "Historic Climate Agreement: 190 Nations Pledge Carbon Neutrality by 2045", slug: "historic-climate-agreement-2045", excerpt: "In a landmark deal at the UN Climate Summit, nations agreed to accelerate carbon neutrality targets.", featuredImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&auto=format&fit=crop&q=80", readingTime: 8, viewCount: 7200, isFeatured: true, isBreaking: true, authorId: admin.id, categoryId: politics.id },
    { title: "UK General Election Called for October as PM Dissolves Parliament", slug: "uk-general-election-october", excerpt: "The Prime Minister has announced a snap general election, setting the stage for a closely contested race.", featuredImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 4800, isTrending: true, authorId: admin.id, categoryId: politics.id },
    { title: "US Senate Passes Landmark AI Regulation Bill with Bipartisan Support", slug: "us-senate-ai-regulation-bill", excerpt: "The bill establishes a federal framework for AI oversight.", featuredImage: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&auto=format&fit=crop&q=80", readingTime: 7, viewCount: 3900, authorId: admin.id, categoryId: politics.id },
    { title: "India Overtakes China as World's Most Populous Nation, UN Data Shows", slug: "india-overtakes-china-population", excerpt: "The UN Population Division confirms India's population has reached 1.44 billion.", featuredImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 5600, authorId: admin.id, categoryId: politics.id },
    { title: "African Union Launches Continental Free Trade Zone Second Phase", slug: "au-continental-free-trade-phase-2", excerpt: "Phase two of the AfCFTA removes tariff barriers on 90% of goods.", featuredImage: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 2200, authorId: author2.id, categoryId: politics.id },
    { title: "Japan and South Korea Announce Historic Defense Cooperation Agreement", slug: "japan-south-korea-defense-agreement", excerpt: "The two nations sign a military intelligence-sharing pact.", featuredImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 2800, authorId: admin.id, categoryId: politics.id },
    // Entertainment
    { title: "Streaming Wars Heat Up: Netflix Launches Free Ad-Supported Tier in 50 Countries", slug: "netflix-free-ad-supported-tier", excerpt: "Netflix expands its free tier to reach the next billion viewers.", featuredImage: "https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 6100, isFeatured: true, authorId: author3.id, categoryId: entertainment.id },
    { title: "Beyoncé's Renaissance World Tour Becomes Highest-Grossing Concert Tour in History", slug: "beyonce-renaissance-tour-record", excerpt: "The tour surpassed $2.4 billion in total revenue across 96 shows.", featuredImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 7800, isTrending: true, authorId: author3.id, categoryId: entertainment.id },
    { title: "Oscar-Winning Director Christopher Nolan Announces Next Film: 'Einstein's Compass'", slug: "nolan-einstein-compass-announcement", excerpt: "Nolan's next project explores the Nobel laureate's journey.", featuredImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 9200, isTrending: true, authorId: author3.id, categoryId: entertainment.id },
    { title: "K-Pop Group BTS Announces 2027 Reunion Tour Following Military Service", slug: "bts-reunion-tour-2027", excerpt: "All seven members will complete their mandatory military service by December.", featuredImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 11000, isFeatured: true, isTrending: true, authorId: author3.id, categoryId: entertainment.id },
    { title: "Hollywood Studios and Writers Guild Reach New Agreement on AI Usage", slug: "hollywood-ai-agreement-writers-guild", excerpt: "The deal establishes clear boundaries for AI-generated content.", featuredImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 4300, authorId: author3.id, categoryId: entertainment.id },
    { title: "World's Largest Music Festival Announces 2027 Lineup with AI-Generated Performances", slug: "music-festival-ai-performances-2027", excerpt: "Tomorrowland reveals a controversial new stage featuring AI-generated virtual artist performances.", featuredImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 3500, authorId: author3.id, categoryId: entertainment.id },
    // Sport
    { title: "Manchester City Completes Record Quadruple with Champions League Victory", slug: "man-city-record-quadruple", excerpt: "City becomes the first English club to win the Premier League, FA Cup, League Cup, and Champions League.", featuredImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 9800, isFeatured: true, isBreaking: true, authorId: author3.id, categoryId: sport.id },
    { title: "NBA Finals: Wembanyama Leads Spurs to Championship in Historic Rookie Season", slug: "nba-finals-wembanyama-spurs", excerpt: "Victor Wembanyama becomes the youngest Finals MVP.", featuredImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 7400, isTrending: true, authorId: author3.id, categoryId: sport.id },
    { title: "2030 FIFA World Cup: Six-Host Format Unveiled with Expanded 48-Team Tournament", slug: "fifa-world-cup-2030-format", excerpt: "FIFA confirms the unprecedented six-nation hosting format.", featuredImage: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 5100, authorId: author3.id, categoryId: sport.id },
    { title: "Tennis Grand Slam Shake-Up: New $100 Million Prize Pool Announced", slug: "tennis-grand-slam-prize-pool", excerpt: "All four Grand Slam tournaments will collectively offer over $100 million.", featuredImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 3200, authorId: author3.id, categoryId: sport.id },
    { title: "Formula 1 Introduces Sustainable Fuel Regulations for 2027 Season", slug: "formula-1-sustainable-fuel-2027", excerpt: "All F1 teams will be required to use 100% sustainable fuels.", featuredImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 4400, isEditorPick: true, authorId: author3.id, categoryId: sport.id },
    { title: "Olympic Committee Confirms eSports as Medal Event for 2028 Los Angeles Games", slug: "esports-olympic-medal-2028", excerpt: "Competitive gaming will debut as a full medal event.", featuredImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 6300, isTrending: true, authorId: author3.id, categoryId: sport.id },
    // Gaming
    { title: "Nintendo Announces Switch 2 with 4K OLED and Backward Compatibility", slug: "nintendo-switch-2-announcement", excerpt: "The highly anticipated successor features a 7-inch OLED display.", featuredImage: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 15000, isFeatured: true, isBreaking: true, isTrending: true, authorId: author3.id, categoryId: gaming.id },
    { title: "GTA 6 Release Date Confirmed: Rockstar Sets New Industry Benchmark", slug: "gta-6-release-date-confirmed", excerpt: "Rockstar Games confirms a Fall 2026 release.", featuredImage: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&auto=format&fit=crop&q=80", readingTime: 7, viewCount: 22000, isFeatured: true, isTrending: true, authorId: author1.id, categoryId: gaming.id },
    { title: "PlayStation 6 Specifications Leaked: AMD RDNA 5 GPU and 2TB SSD", slug: "playstation-6-specs-leaked", excerpt: "Internal documents reveal Sony's next console targets 8K gaming.", featuredImage: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 18000, isTrending: true, authorId: author1.id, categoryId: gaming.id },
    { title: "Esports World Championship Prize Pool Hits Record $50 Million", slug: "esports-world-championship-50-million", excerpt: "The IESF flagship tournament breaks all previous prize pool records.", featuredImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 8500, authorId: author3.id, categoryId: gaming.id },
    { title: "Steam's New AI Game Discovery Algorithm Transforms Indie Developer Visibility", slug: "steam-ai-game-discovery-indie", excerpt: "Valve's new recommendation engine has increased indie game sales by 340%.", featuredImage: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 5200, authorId: author1.id, categoryId: gaming.id },
    { title: "Cloud Gaming Revolution: Xbox Cloud Now Supports 4K 120fps Streaming", slug: "xbox-cloud-gaming-4k-120fps", excerpt: "Microsoft's cloud gaming service reaches a new technical milestone.", featuredImage: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 6800, isEditorPick: true, authorId: author1.id, categoryId: gaming.id },
    { title: "Unity Engine Scandal Leads to CEO Resignation and Company Restructuring", slug: "unity-ceo-resignation-restructuring", excerpt: "Following the pricing controversy, Unity undergoes major leadership changes.", featuredImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80", readingTime: 6, viewCount: 4100, authorId: author1.id, categoryId: gaming.id },
    { title: "VR Gaming Reaches 50 Million Active Users as Meta Quest 4 Sells Record Numbers", slug: "vr-gaming-50-million-users", excerpt: "The VR gaming market hits a major milestone.", featuredImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&auto=format&fit=crop&q=80", readingTime: 5, viewCount: 7200, authorId: author1.id, categoryId: gaming.id },
  ];

  const insertedPosts = await db.insert(schema.posts).values(
    postInserts.map((p) => ({
      ...p,
      content: articleContent(p.title, [
        `${p.title} is a significant development in its field.`,
        "Industry experts have noted the far-reaching implications of this development.",
        "Stakeholders across the sector are closely monitoring the situation.",
        "The long-term impact is expected to reshape the competitive landscape."
      ]),
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - Math.random() * 604800000),
    }))
  ).returning();

  console.log("Posts seeded.");

  // Connect tags to some posts
  const allPosts = [biz1, biz2, ...insertedPosts.filter(p => p.viewCount > 5000)];

  for (const post of allPosts) {
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...tagsData].sort(() => Math.random() - 0.5).slice(0, tagCount);
    if (shuffled.length > 0) {
      await db.insert(schema.postTags).values(
        shuffled.map((t) => ({ postId: post.id, tagId: t.id }))
      );
    }
  }

  // Create revisions for a few posts
  const postsForRevisions = allPosts.slice(0, 5);
  for (const post of postsForRevisions) {
    await db.insert(schema.revisions).values({
      postId: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
    });
  }

  console.log("Posts, tags, and relations seeded.");

  // 8. Create Mock Advertisements
  await db.insert(schema.ads).values([
    {
      title: "Chronicle Premium Membership",
      placement: "SIDEBAR",
      type: "IMAGE",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=250&fit=crop",
      targetUrl: "/subscribe",
      status: "ACTIVE",
    },
    {
      title: "Hosting Sponsor Banner",
      placement: "HEADER",
      type: "HTML",
      code: `<div style="background:#5F4A8B;color:#FEFACD;padding:10px;text-align:center;font-weight:bold;font-size:14px;border-radius:4px;">
              SPONSORED: Blazing fast Node & Next.js cloud hosting. <a href="#" style="color:#FFF;text-decoration:underline;">Deploy in 60 seconds.</a>
            </div>`,
      status: "ACTIVE",
    },
    {
      title: "Newsletter CTA Ad",
      placement: "INLINE",
      type: "HTML",
      code: `<div style="background:#f0f0f0;border:2px dashed #5F4A8B;padding:20px;text-align:center;border-radius:8px;margin:20px 0;">
              <p style="font-weight:bold;color:#5F4A8B;margin:0 0 8px;">Enjoying this article?</p>
              <p style="color:#666;margin:0;font-size:14px;">Subscribe to Chronicle for premium journalism delivered daily.</p>
            </div>`,
      status: "ACTIVE",
    },
  ]);

  console.log("Advertisements seeded.");

  // 9. Create Sample Pages
  await db.insert(schema.pages).values([
    {
      title: "About Chronicle",
      slug: "about",
      content: JSON.stringify({
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "About Chronicle" }] },
          { type: "paragraph", content: [{ type: "text", text: "Chronicle is an independent news organization delivering trusted, high-quality analysis and reporting on the ideas, trends, and technologies shaping our world. Founded in 2024, we've grown to serve millions of readers across the globe." }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Our Mission" }] },
          { type: "paragraph", content: [{ type: "text", text: "We believe in journalism that informs, challenges, and inspires. Our team of experienced reporters and analysts covers the stories that matter most, with depth and integrity that readers can trust." }] },
        ],
      }),
      status: "PUBLISHED",
      authorId: admin.id,
    },
    {
      title: "Privacy Policy",
      slug: "privacy",
      content: JSON.stringify({
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Privacy Policy" }] },
          { type: "paragraph", content: [{ type: "text", text: "At Chronicle, we take your privacy seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website." }] },
        ],
      }),
      status: "PUBLISHED",
      authorId: admin.id,
    },
    {
      title: "Terms & Conditions",
      slug: "terms",
      content: JSON.stringify({
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Terms & Conditions" }] },
          { type: "paragraph", content: [{ type: "text", text: "These Terms of Service govern your use of Chronicle's website and services. By accessing or using our services, you agree to be bound by these terms." }] },
        ],
      }),
      status: "PUBLISHED",
      authorId: admin.id,
    },
  ]);

  console.log("Pages seeded.");
  console.log("=== Seeding completed successfully! ===");
  console.log(`Created: 7 categories, ${tagsData.length} tags, ~40 posts, 3 pages`);
  console.log(`Users: admin@example.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await client.end();
  });
