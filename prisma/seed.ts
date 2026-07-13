// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clear database
  await prisma.activityLog.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.revision.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.ad.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.tag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.newsletterSubscriber.deleteMany({});

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

  await prisma.setting.createMany({
    data: [
      { key: "theme_colors", value: JSON.stringify(defaultColors) },
      { key: "general_settings", value: JSON.stringify(defaultGeneral) },
      { key: "header_config", value: JSON.stringify(defaultHeader) },
      { key: "footer_config", value: JSON.stringify(defaultFooter) },
      { key: "homepage_layout", value: JSON.stringify(defaultHomepageLayout) },
      { key: "seo_settings", value: JSON.stringify(defaultSEO) },
      { key: "sidebar_config", value: JSON.stringify(defaultSidebar) },
      { key: "sitemap_settings", value: JSON.stringify({ includePosts: true, includePages: true, includeCategories: true }) },
      { key: "indexing_settings", value: JSON.stringify({ discourageIndexing: false }) }
    ]
  });

  console.log("Settings seeded.");

  // 3. Create Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const authorPassword = await bcrypt.hash("author123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Elizabeth Vance",
      passwordHash: adminPassword,
      role: "ADMIN",
      title: "Editor-in-Chief",
      bio: "Elizabeth Vance has over 15 years of experience in journalism and digital publishing.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
    }
  });

  const author1 = await prisma.user.create({
    data: {
      email: "author1@example.com",
      name: "David Chen",
      passwordHash: authorPassword,
      role: "AUTHOR",
      title: "Senior Tech Correspondent",
      bio: "David Chen covers AI, computing, and cybersecurity.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  });

  const author2 = await prisma.user.create({
    data: {
      email: "author2@example.com",
      name: "Sarah Jenkins",
      passwordHash: authorPassword,
      role: "AUTHOR",
      title: "Financial Journalist",
      bio: "Sarah Jenkins covers macroeconomic trends, corporate finance, and emerging startups.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    }
  });

  const author3 = await prisma.user.create({
    data: {
      email: "author3@example.com",
      name: "Marcus Rivera",
      passwordHash: authorPassword,
      role: "AUTHOR",
      title: "Sports & Entertainment Writer",
      bio: "Marcus covers sports, entertainment, and gaming culture.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  });

  console.log("Users seeded.");

  // 4. Create Categories (7 categories)
  const business = await prisma.category.create({
    data: {
      name: "Business",
      slug: "business",
      description: "Global trade, economic policy, corporate strategies, and market analysis.",
      icon: "Briefcase",
      color: "#1A1A1A",
      layoutStyle: "grid",
      order: 1
    }
  });

  const lifestyle = await prisma.category.create({
    data: {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Health, wellness, travel, food, fashion, and modern living.",
      icon: "Heart",
      color: "#E91E63",
      layoutStyle: "editorial",
      order: 2
    }
  });

  const technology = await prisma.category.create({
    data: {
      name: "Technology",
      slug: "technology",
      description: "Software, hardware, AI, and engineering innovations reshaping the world.",
      icon: "Laptop",
      color: "#5F4A8B",
      layoutStyle: "grid",
      order: 3
    }
  });

  const politics = await prisma.category.create({
    data: {
      name: "Politics",
      slug: "politics",
      description: "National governance, international diplomacy, and legislative updates.",
      icon: "Vote",
      color: "#E63946",
      layoutStyle: "list",
      order: 4
    }
  });

  const entertainment = await prisma.category.create({
    data: {
      name: "Entertainment",
      slug: "entertainment",
      description: "Movies, music, TV, celebrity culture, and pop culture commentary.",
      icon: "Film",
      color: "#FF9800",
      layoutStyle: "grid",
      order: 5
    }
  });

  const sport = await prisma.category.create({
    data: {
      name: "Sport",
      slug: "sport",
      description: "Football, basketball, tennis, motorsport, and global athletics coverage.",
      icon: "Trophy",
      color: "#2E7D32",
      layoutStyle: "grid",
      order: 6
    }
  });

  const gaming = await prisma.category.create({
    data: {
      name: "Gaming",
      slug: "gaming",
      description: "Console, PC, mobile gaming, esports, and game industry news.",
      icon: "Gamepad2",
      color: "#9C27B0",
      layoutStyle: "grid",
      order: 7
    }
  });

  console.log("Categories seeded.");

  // 5. Create Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Breaking News", slug: "breaking-news" } }),
    prisma.tag.create({ data: { name: "Analysis", slug: "analysis" } }),
    prisma.tag.create({ data: { name: "Exclusive", slug: "exclusive" } }),
    prisma.tag.create({ data: { name: "Trending", slug: "trending" } }),
    prisma.tag.create({ data: { name: "Opinion", slug: "opinion" } }),
    prisma.tag.create({ data: { name: "Review", slug: "review" } }),
    prisma.tag.create({ data: { name: "Interview", slug: "interview" } }),
    prisma.tag.create({ data: { name: "Feature", slug: "feature" } }),
    prisma.tag.create({ data: { name: "Investigation", slug: "investigation" } }),
    prisma.tag.create({ data: { name: "Live Updates", slug: "live-updates" } }),
  ]);

  console.log("Tags seeded.");

  // 6. Helper to build article content
  const articleContent = (title: string, paragraphs: string[]) => JSON.stringify({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: paragraphs[0] || "" }]
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Key Developments" }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: paragraphs[1] || "" }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: paragraphs[2] || "" }]
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "What This Means Going Forward" }]
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: paragraphs[3] || "" }]
      },
      {
        type: "blockquote",
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: `"${title}" is a story we will continue to follow closely as it develops.` }]
        }]
      }
    ]
  });

  // 7. Create ~40 Articles

  // === BUSINESS (6 articles) ===
  const biz1 = await prisma.post.create({
    data: {
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
    }
  });

  const biz2 = await prisma.post.create({
    data: {
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
    }
  });

  const biz3 = await prisma.post.create({
    data: {
      title: "Remote Work Revolution: Fortune 500 Companies Permanently Adopt Hybrid Models",
      slug: "remote-work-hybrid-models-fortune-500",
      excerpt: "A landmark survey reveals that 72% of Fortune 500 companies have made hybrid work a permanent policy.",
      content: articleContent("Remote Work Revolution", [
        "A comprehensive survey conducted by McKinsey & Company has found that an overwhelming majority of Fortune 500 companies have formally adopted permanent hybrid work policies, fundamentally reshaping the commercial real estate landscape.",
        "The shift has led to a measurable decline in downtown office occupancy rates, with major cities like San Francisco, New York, and Chicago seeing Class A office vacancy rates hover between 18-25%. This has prompted landlords to convert unused office space into residential and mixed-use developments.",
        "Employee satisfaction scores have risen sharply in companies offering flexibility. A parallel study by Stanford economist Nicholas Bloom found that hybrid workers were 5% more productive and 35% less likely to seek new employment.",
        "The long-term economic implications are significant. Reduced commuting patterns are reshaping urban transportation demand, while suburban and rural communities are experiencing economic booms as remote workers relocate to lower-cost areas."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      readingTime: 7,
      viewCount: 2800,
      authorId: author2.id,
      categoryId: business.id,
    }
  });

  const biz4 = await prisma.post.create({
    data: {
      title: "European Central Bank Signals Rate Cut Amid Slowing Growth",
      slug: "ecb-rate-cut-signal",
      excerpt: "ECB President hints at a 25 basis point cut as eurozone inflation falls below target for the first time in two years.",
      content: articleContent("European Central Bank Rate Cut", [
        "European Central Bank President Christine Lagarde indicated during a press conference in Frankfurt that the bank's governing council is prepared to reduce the main refinancing rate by 25 basis points at its next policy meeting.",
        "The signal comes after Eurozone headline inflation fell to 1.7%, dropping below the ECB's 2% target for the first time since 2024. Economic growth across the bloc has slowed to 0.8% annualized, raising concerns about stagnation.",
        "Bond markets rallied immediately following the announcement, with German 10-year bund yields falling 12 basis points. The euro weakened slightly against the dollar, trading at 1.082 as currency traders priced in easier monetary policy.",
        "Business groups across the eurozone welcomed the news, with the European Chamber of Commerce noting that lower borrowing costs would provide much-needed relief for small and medium enterprises facing tight credit conditions."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      readingTime: 5,
      viewCount: 1900,
      authorId: author2.id,
      categoryId: business.id,
    }
  });

  const biz5 = await prisma.post.create({
    data: {
      title: "Startup Funding Rebounds: VC Investment Hits $48B in Q2 2026",
      slug: "startup-funding-rebounds-q2-2026",
      excerpt: "Venture capital investment surged 34% quarter-over-quarter, led by AI infrastructure and climate tech deals.",
      content: articleContent("Startup Funding Rebounds", [
        "After four consecutive quarters of declining venture capital activity, global startup funding has rebounded strongly in Q2 2026, reaching $48 billion across 2,100 deals according to Crunchbase data.",
        "AI infrastructure companies dominated the funding landscape, with three separate rounds exceeding $500 million. Climate technology startups also attracted significant capital, driven by new government subsidies and corporate net-zero commitments.",
        "Late-stage deals accounted for the majority of capital deployed, as investors concentrated bets on companies with proven revenue models. Early-stage seed and Series A rounds remained stable, suggesting continued grassroots innovation.",
        "The recovery has been geographically diverse, with European and Asian startups capturing a growing share of global VC investment. London, Berlin, Singapore, and Tokyo emerged as the fastest-growing startup hubs in the first half of 2026."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 345600000),
      readingTime: 6,
      viewCount: 1500,
      isTrending: true,
      authorId: author2.id,
      categoryId: business.id,
    }
  });

  const biz6 = await prisma.post.create({
    data: {
      title: "Oil Prices Stabilize as OPEC Extends Production Cuts Through 2027",
      slug: "oil-prices-stabilize-opec-cuts",
      excerpt: "Brent crude holds above $80 as OPEC+ agrees to maintain current output levels for an additional 12 months.",
      content: articleContent("Oil Prices Stabilize", [
        "Brent crude oil prices stabilized above $80 per barrel after OPEC+ members unanimously agreed to extend their current production cuts through the end of 2027. The decision was widely expected but still provided a firm floor for energy markets.",
        "Saudi Arabia, the de facto leader of the cartel, signaled that supply discipline would remain in place until global oil inventories returned to five-year average levels. Russia reaffirmed its commitment to the production agreement despite ongoing geopolitical tensions.",
        "The energy sector's stock performance reflected the bullish outlook, with major integrated oil companies like ExxonMobil and Shell gaining between 2-4% following the announcement. Renewable energy stocks, however, saw modest declines as traditional energy's near-term outlook strengthened.",
        "Consumer advocacy groups expressed concern about the impact on fuel prices at the pump, noting that sustained high crude prices tend to translate into higher gasoline and diesel costs for consumers and businesses alike."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 432000000),
      readingTime: 5,
      viewCount: 2100,
      authorId: author2.id,
      categoryId: business.id,
    }
  });

  // === LIFESTYLE (6 articles) ===
  const ls1 = await prisma.post.create({
    data: {
      title: "The Rise of Slow Travel: Why More Tourists Are Choosing Trains Over Planes",
      slug: "slow-travel-trains-over-planes",
      excerpt: "A growing movement of travelers is embracing longer, more immersive journeys by rail across Europe and Asia.",
      content: articleContent("The Rise of Slow Travel", [
        "Slow travel has emerged as one of the fastest-growing tourism trends of 2026, with international rail bookings up 45% compared to last year. The movement encourages travelers to prioritize depth of experience over speed of transit.",
        "European rail operators have responded to the demand by launching new scenic routes connecting major cultural capitals. The Venice Simplon-Orient-Express, for example, has expanded its seasonal offerings to include summer routes through the Swiss Alps and Croatian coastline.",
        "Advocates of slow travel cite environmental benefits alongside personal wellness advantages. A train journey from Paris to Barcelona produces roughly 90% less carbon emissions than the equivalent flight, making it an attractive choice for environmentally conscious travelers.",
        "The trend has spawned a new genre of travel content on social media, with creators documenting multi-day rail journeys, layover adventures in small European towns, and the meditative experience of watching landscapes unfold from a train window."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 6,
      viewCount: 2400,
      isFeatured: true,
      authorId: admin.id,
      categoryId: lifestyle.id,
    }
  });

  const ls2 = await prisma.post.create({
    data: {
      title: "Mediterranean Diet Named Best Overall Diet for Eighth Consecutive Year",
      slug: "mediterranean-diet-best-2026",
      excerpt: "The annual ranking by health experts reaffirms the Mediterranean diet's dominance in nutritional science.",
      content: articleContent("Mediterranean Diet Named Best", [
        "For the eighth year running, the Mediterranean diet has been named the best overall eating pattern by an independent panel of nutritionists and health professionals. The ranking evaluates diets across 23 health parameters.",
        "The diet's emphasis on olive oil, whole grains, fish, fruits, and vegetables has been linked to reduced risks of cardiovascular disease, type 2 diabetes, and cognitive decline. Recent studies have also highlighted its positive effects on gut microbiome diversity.",
        "Unlike restrictive fad diets, the Mediterranean approach is praised for its sustainability and flexibility. It accommodates a wide range of cultural food preferences and social dining situations, making it easier for people to maintain long-term.",
        "Health authorities in several countries have begun incorporating Mediterranean dietary guidelines into their national nutrition recommendations, particularly targeting populations with high rates of heart disease and obesity."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
      readingTime: 5,
      viewCount: 1800,
      authorId: admin.id,
      categoryId: lifestyle.id,
    }
  });

  const ls3 = await prisma.post.create({
    data: {
      title: "Japan's Cherry Blossom Season Breaks Tourism Records with 12 Million Visitors",
      slug: "japan-cherry-blossom-tourism-records",
      excerpt: "Japan welcomed an unprecedented number of international visitors during the 2026 sakura season.",
      content: articleContent("Japan Cherry Blossom Tourism", [
        "Japan's iconic cherry blossom season attracted a record-breaking 12 million international visitors in March and April 2026, generating an estimated ¥2.1 trillion in tourism revenue according to the Japan National Tourism Organization.",
        "The surge was driven by weakened yen exchange rates and expanded visa-free access for citizens of 25 additional countries. Popular viewing spots in Kyoto, Tokyo, and Osaka managed crowd control through new digital reservation systems.",
        "Local businesses adapted quickly to the influx, with hotels near major cherry blossom parks reporting occupancy rates above 95% for the six-week period. Traditional ryokan accommodations saw particularly strong demand from Western tourists seeking authentic cultural experiences.",
        "Environmental groups raised concerns about overcrowding at sensitive natural sites, prompting several prefectures to implement visitor caps and trail rotations to protect ancient cherry trees and their surrounding ecosystems."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      readingTime: 5,
      viewCount: 3100,
      isTrending: true,
      authorId: admin.id,
      categoryId: lifestyle.id,
    }
  });

  const ls4 = await prisma.post.create({
    data: {
      title: "How Cold Water Swimming Became the World's Fastest Growing Fitness Trend",
      slug: "cold-water-swimming-fitness-trend",
      excerpt: "From Wim Hof to open-water clubs, the science-backed health benefits are drawing millions of new participants.",
      content: articleContent("Cold Water Swimming Trend", [
        "Cold water swimming has exploded from a niche extreme sport into a mainstream fitness phenomenon, with organized open-water swimming groups reporting membership increases of 200% over the past two years.",
        "Scientific research has increasingly validated the practice's health benefits, including improved immune function, enhanced mood through cold-shock endorphin release, and reduced chronic inflammation. A 2026 study in The Lancet found regular cold water swimmers had 40% fewer sick days.",
        "The trend has spawned a thriving industry of wetsuits designed for cold water immersion, waterproof health monitoring devices, and even dedicated cold water swimming retreats in Scandinavia, Scotland, and Iceland.",
        "Mental health professionals have taken notice, with several NHS trusts in the UK now prescribing open-water swimming as a complementary therapy for depression and anxiety disorders, citing both physical and social benefits."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      readingTime: 6,
      viewCount: 1600,
      authorId: admin.id,
      categoryId: lifestyle.id,
    }
  });

  const ls5 = await prisma.post.create({
    data: {
      title: "The $50 Billion Wellness Tourism Industry Is Booming in Southeast Asia",
      slug: "wellness-tourism-southeast-asia-boom",
      excerpt: "Thailand, Bali, and Vietnam lead a wellness tourism surge driven by post-pandemic health consciousness.",
      content: articleContent("Wellness Tourism Southeast Asia", [
        "The global wellness tourism industry has surpassed $50 billion in annual revenue, with Southeast Asia capturing nearly 30% of the market. Thailand alone welcomed 4.2 million wellness-focused tourists in 2025.",
        "Ayurvedic retreats in Bali, meditation centers in Chiang Mai, and holistic healing resorts in Vietnam's central highlands have become international destinations. Many combine traditional Eastern wellness practices with modern medical diagnostics.",
        "The growth has attracted significant investment from luxury hotel chains, with brands like Aman, Six Senses, and COMO expanding their wellness-focused properties across the region. New openings in 2026 include purpose-built wellness villages in Laos and Cambodia.",
        "Critics note that the wellness tourism boom has also contributed to gentrification in popular areas, displacing local communities and commodifying traditional healing practices that were once freely shared within cultural contexts."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 345600000),
      readingTime: 6,
      viewCount: 1400,
      authorId: admin.id,
      categoryId: lifestyle.id,
    }
  });

  const ls6 = await prisma.post.create({
    data: {
      title: "Plant-Based Restaurant Openings Outpace Traditional Dining for First Time",
      slug: "plant-based-restaurants-outpace-traditional",
      excerpt: "New data shows plant-based dining establishments opened at a faster rate than conventional restaurants in 2025.",
      content: articleContent("Plant-Based Restaurants Outpace", [
        "For the first time in modern food service history, plant-based and vegan restaurant openings outpaced traditional meat-centered restaurant debuts in major global cities, according to data from the National Restaurant Association.",
        "The shift is attributed to a combination of consumer demand, lower overhead costs, and innovations in plant-based food technology. Products from companies like Impossible Foods and Beyond Meat now closely replicate the taste and texture of animal proteins at competitive prices.",
        "Major food service chains have taken notice, with several fast-food giants launching dedicated plant-based menu sections. McDonald's reported that its McPlant burger line now accounts for 12% of total burger sales in test markets.",
        "Nutritionists caution that while plant-based diets offer environmental and ethical benefits, poorly planned vegan menus can lead to nutritional deficiencies. They recommend that restaurants ensure adequate protein, B12, and iron options are available."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 432000000),
      readingTime: 5,
      viewCount: 1200,
      authorId: author1.id,
      categoryId: lifestyle.id,
    }
  });

  // === TECHNOLOGY (6 articles) ===
  const tech1 = await prisma.post.create({
    data: {
      title: "Apple Unveils Revolutionary Mixed Reality Headset at WWDC 2026",
      slug: "apple-mixed-reality-headset-wwdc-2026",
      excerpt: "The tech giant revealed its next-generation spatial computing device with a focus on mainstream affordability.",
      content: articleContent("Apple Mixed Reality Headset", [
        "Apple took the wraps off its second-generation mixed reality headset at WWDC 2026, dramatically slimming the form factor while cutting the price to $1,999 — less than half the cost of the original Vision Pro.",
        "The new device features Apple's custom M5 Ultra chip, which delivers 2.5x the graphics performance of its predecessor while consuming 40% less power. A new micro-OLED display technology achieves 4,000 nits of peak brightness per eye.",
        "The killer feature for mainstream adoption is EyeSight 2.0, which uses advanced displays to show the wearer's eyes to people nearby with unprecedented clarity, solving one of the biggest social friction points of current headsets.",
        "Developers received new APIs for spatial computing that allow seamless transitions between augmented reality overlays and full virtual environments. Apple expects over 10,000 native spatial apps by the end of 2026."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 7,
      viewCount: 8500,
      isFeatured: true,
      isBreaking: true,
      isTrending: true,
      authorId: author1.id,
      categoryId: technology.id,
    }
  });

  const tech2 = await prisma.post.create({
    data: {
      title: "OpenAI Releases GPT-5: What the New Model Means for AI Applications",
      slug: "openai-gpt-5-release",
      excerpt: "GPT-5 achieves near-human performance across a broad range of reasoning benchmarks while using 60% less compute.",
      content: articleContent("OpenAI Releases GPT-5", [
        "OpenAI has officially launched GPT-5, its most capable language model to date, demonstrating significant improvements in mathematical reasoning, code generation, and multilingual comprehension across 50 languages.",
        "The model introduces a new architecture called 'Adaptive Reasoning Chains' that allows it to dynamically adjust its computational effort based on task complexity. Simple queries are answered instantly, while complex problems trigger extended reasoning sequences.",
        "Early benchmarks show GPT-5 achieving 94% on the MMLU evaluation suite, surpassing human expert performance for the first time. On coding challenges, it solved 89% of competitive programming problems rated 'hard' difficulty.",
        "OpenAI has also implemented enhanced safety measures, including a new constitutional AI framework that the company says reduces harmful outputs by 75% compared to GPT-4 while maintaining creative flexibility for legitimate use cases."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
      readingTime: 8,
      viewCount: 12000,
      isFeatured: true,
      isBreaking: true,
      authorId: author1.id,
      categoryId: technology.id,
    }
  });

  const tech3 = await prisma.post.create({
    data: {
      title: "Quantum Computing Startup Achieves 10,000 Qubit Milestone",
      slug: "quantum-computing-10000-qubits",
      excerpt: "A Silicon Valley startup has shattered the previous qubit record, bringing practical quantum computing closer to reality.",
      content: articleContent("Quantum Computing 10000 Qubits", [
        "QuantumLeap Technologies announced it has successfully demonstrated a 10,000-qubit quantum processor, more than doubling the previous record held by IBM. The breakthrough was achieved using a novel topological qubit architecture.",
        "The milestone is significant because practical quantum advantage — where quantum computers solve real-world problems faster than classical supercomputers — is generally estimated to require at least 10,000 stable, error-corrected qubits.",
        "The company's CEO stated in a press briefing that early access partners in pharmaceuticals, materials science, and cryptography will begin receiving cloud access to the processor in Q4 2026, with commercial availability planned for mid-2027.",
        "Industry analysts note that while the qubit count is impressive, error rates and coherence times remain the true measures of quantum computing practicality. QuantumLeap claims its error correction scheme achieves a logical error rate below 10^-6, which would be a significant advance."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      readingTime: 7,
      viewCount: 5200,
      isEditorPick: true,
      authorId: author1.id,
      categoryId: technology.id,
    }
  });

  const tech4 = await prisma.post.create({
    data: {
      title: "Tesla's Fully Autonomous Robotaxi Fleet Begins Operating in Austin",
      slug: "tesla-autonomous-robotaxi-austin",
      excerpt: "Tesla launches its long-awaited driverless ride-hailing service in Austin, Texas, with plans to expand to 10 cities by year-end.",
      content: articleContent("Tesla Robotaxi Austin Launch", [
        "Tesla has officially launched its autonomous robotaxi service in Austin, Texas, deploying a fleet of 500 fully driverless Model Y vehicles equipped with the company's latest Full Self-Driving (FSD) v14 software.",
        "The service operates within a 150-square-mile geofenced zone covering most of the Austin metropolitan area. Passengers request rides through a dedicated Tesla app, with fares priced approximately 30% below comparable Uber or Lyft trips.",
        "Safety monitoring is conducted remotely by Tesla's operations center, where human supervisors can intervene if the AI encounters edge cases it cannot resolve independently. The company reports zero at-fault incidents during the six-month beta testing period.",
        "Regulatory approval in Texas was obtained after Tesla provided over 2 million miles of disengagement-free driving data. Competitors Waymo and Cruise have criticized the rapid rollout, citing concerns about the vision-only approach without lidar sensors."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      readingTime: 6,
      viewCount: 6800,
      isTrending: true,
      authorId: author1.id,
      categoryId: technology.id,
    }
  });

  const tech5 = await prisma.post.create({
    data: {
      title: "EU's Digital Markets Act Forces Major Platform Overhauls",
      slug: "eu-digital-markets-act-platform-overhauls",
      excerpt: "Big Tech companies are scrambling to comply with the EU's landmark antitrust regulation before the September deadline.",
      content: articleContent("EU Digital Markets Act", [
        "The European Union's Digital Markets Act (DMA) has reached its enforcement phase, and major technology platforms are racing to implement sweeping changes to their products and services before the September compliance deadline.",
        "Apple has been forced to allow alternative app marketplaces on iOS for the first time, with Epic Games and several other developers preparing to launch competing stores. The company has also opened its NFC chip to third-party payment providers.",
        "Google has separated its search results from its own shopping, travel, and mapping services in European search results, addressing long-standing complaints about self-preferencing in its search engine.",
        "Meta has introduced data portability tools that allow users to transfer their Facebook and Instagram data to competing services in a machine-readable format. The company faces the largest potential fine — up to 10% of global revenue — for non-compliance."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 345600000),
      readingTime: 6,
      viewCount: 3400,
      authorId: author1.id,
      categoryId: technology.id,
    }
  });

  const tech6 = await prisma.post.create({
    data: {
      title: "Starlink's Third-Generation Satellites Deliver 1Gbps to Rural Communities",
      slug: "starlink-gen3-1gbps-rural",
      excerpt: "SpaceX's latest satellite constellation is closing the digital divide with gigabit speeds in underserved areas.",
      content: articleContent("Starlink Gen3 1Gbps", [
        "SpaceX has begun deploying its third-generation Starlink satellites, delivering download speeds exceeding 1Gbps to rural and underserved communities across North America. The service marks a dramatic improvement over the previous generation's 250Mbps peak speeds.",
        "The Gen3 satellites use advanced inter-satellite laser links and phased array antennas to reduce latency to under 20ms, making the service competitive with urban fiber connections for most applications including video conferencing and online gaming.",
        "Educational institutions in remote areas have been among the first beneficiaries. School districts in rural Montana, Alaska, and northern Canada report that students now have reliable high-speed internet for the first time, enabling access to online learning platforms.",
        "The improved performance comes at a higher equipment cost, with the Gen3 dish priced at $599. However, SpaceX has introduced a subsidized program for qualifying low-income households, offering the hardware at no cost with a 24-month service commitment."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 432000000),
      readingTime: 5,
      viewCount: 4100,
      authorId: author1.id,
      categoryId: technology.id,
    }
  });

  // === POLITICS (6 articles) ===
  const pol1 = await prisma.post.create({
    data: {
      title: "Historic Climate Agreement: 190 Nations Pledge Carbon Neutrality by 2045",
      slug: "historic-climate-agreement-2045",
      excerpt: "In a landmark deal at the UN Climate Summit, nations agreed to accelerate carbon neutrality targets by five years.",
      content: articleContent("Historic Climate Agreement", [
        "In what environmental leaders are calling the most significant climate accord since Paris, representatives from 190 nations unanimously agreed to a binding resolution targeting global carbon neutrality by 2045.",
        "The agreement includes a $4.5 trillion Green Transition Fund financed by developed nations, with the US, EU, and China each contributing at least $500 billion over the next decade. The fund will support renewable energy deployment and climate adaptation in developing countries.",
        "Enforcement mechanisms, previously a weakness of international climate agreements, include automatic trade penalties for nations that fail to meet intermediate emissions reduction targets. Independent verification will be conducted by a newly established UN Climate Compliance Agency.",
        "While environmental organizations largely praised the accord, some critics argued the timeline remains insufficient to limit warming to 1.5°C above pre-industrial levels. Youth climate activists staged demonstrations outside the summit venue demanding even more aggressive action."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 8,
      viewCount: 7200,
      isFeatured: true,
      isBreaking: true,
      authorId: admin.id,
      categoryId: politics.id,
    }
  });

  const pol2 = await prisma.post.create({
    data: {
      title: "UK General Election Called for October as PM Dissolves Parliament",
      slug: "uk-general-election-october",
      excerpt: "The Prime Minister has announced a snap general election, setting the stage for a closely contested race.",
      content: articleContent("UK General Election Called", [
        "The British Prime Minister announced the dissolution of Parliament today, calling a general election for October 15th in what political analysts expect to be one of the most unpredictable contests in modern UK history.",
        "Current polling shows the two major parties within three percentage points of each other, with immigration, the economy, and healthcare emerging as the dominant campaign issues. Reform UK continues to poll strongly, potentially splitting the right-of-center vote.",
        "The election was triggered after the government failed to pass its budget, losing a key vote by two members. The Chancellor of the Exchequer resigned following the defeat, citing irreconcilable differences over spending priorities.",
        "International observers have noted the election's potential impact on UK-EU relations, as both leading parties have proposed varying degrees of renewed economic cooperation with the European bloc. Trade analysts warn that policy uncertainty could affect currency markets."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
      readingTime: 6,
      viewCount: 4800,
      isTrending: true,
      authorId: admin.id,
      categoryId: politics.id,
    }
  });

  const pol3 = await prisma.post.create({
    data: {
      title: "US Senate Passes Landmark AI Regulation Bill with Bipartisan Support",
      slug: "us-senate-ai-regulation-bill",
      excerpt: "The bill establishes a federal framework for AI oversight, requiring safety testing for models above a certain capability threshold.",
      content: articleContent("US Senate AI Regulation Bill", [
        "The US Senate passed the Artificial Intelligence Safety and Innovation Act with a decisive 78-22 bipartisan vote, establishing the first comprehensive federal regulatory framework for artificial intelligence development and deployment.",
        "The legislation requires AI companies to conduct safety evaluations and submit model cards to a newly created Office of AI Policy before releasing models above a defined capability threshold. Models used in critical applications like healthcare and finance face stricter requirements.",
        "The bill includes provisions for protecting AI researchers and whistleblowers, establishing safe harbor protections for individuals who report safety concerns about AI systems they develop or test.",
        "Industry reactions were mixed. OpenAI and Google praised the bill's risk-based approach, while smaller startups expressed concern about compliance costs. The open-source community had lobbied successfully for exemptions that protect non-commercial research and open-weight model distribution."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      readingTime: 7,
      viewCount: 3900,
      authorId: admin.id,
      categoryId: politics.id,
    }
  });

  const pol4 = await prisma.post.create({
    data: {
      title: "India Overtakes China as World's Most Populous Nation, UN Data Shows",
      slug: "india-overtakes-china-population",
      excerpt: "The UN Population Division confirms India's population has reached 1.44 billion, surpassing China for the first time.",
      content: articleContent("India Overtakes China Population", [
        "India has officially surpassed China as the world's most populous nation according to updated United Nations Population Division data, with India's population reaching an estimated 1.44 billion compared to China's 1.43 billion.",
        "The demographic shift has been anticipated for several years, driven by China's decades-long one-child policy and India's higher fertility rates. India's median age of 28.4 years contrasts sharply with China's aging population with a median age of 39.",
        "Economic analysts see the demographic transition as a potential boost for India's economy, provided the nation can create sufficient employment opportunities. India needs to generate approximately 12 million new jobs annually to absorb its growing working-age population.",
        "China's population decline is accelerating, with the country recording its third consecutive year of population decrease. The Chinese government has introduced various pro-natal policies, but demographic experts suggest the fertility trend may be irreversible."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      readingTime: 6,
      viewCount: 5600,
      authorId: admin.id,
      categoryId: politics.id,
    }
  });

  const pol5 = await prisma.post.create({
    data: {
      title: "African Union Launches Continental Free Trade Zone Second Phase",
      slug: "au-continental-free-trade-phase-2",
      excerpt: "Phase two of the AfCFTA removes tariff barriers on 90% of goods, creating the world's largest free trade zone by member states.",
      content: articleContent("African Union Free Trade Phase 2", [
        "The African Union officially launched the second phase of the African Continental Free Trade Area (AfCFTA), eliminating tariff barriers on 90% of traded goods across the 55-member-state bloc.",
        "The expanded agreement is projected to increase intra-African trade by 52% by 2030, according to the World Bank. The combined GDP of participating nations exceeds $3.4 trillion, creating the world's largest free trade zone by number of member countries.",
        "Phase two also introduces simplified customs procedures, mutual recognition of standards, and digital trade facilitation measures. A new pan-African payment system allows businesses to settle cross-border transactions in local currencies.",
        "Infrastructure development remains a critical bottleneck. The AU has partnered with development banks to invest $180 billion in transport corridors, digital infrastructure, and cold chain logistics necessary to support expanded trade volumes."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 345600000),
      readingTime: 6,
      viewCount: 2200,
      authorId: author2.id,
      categoryId: politics.id,
    }
  });

  const pol6 = await prisma.post.create({
    data: {
      title: "Japan and South Korea Announce Historic Defense Cooperation Agreement",
      slug: "japan-south-korea-defense-agreement",
      excerpt: "The two nations sign a military intelligence-sharing pact, signaling a major shift in East Asian geopolitics.",
      content: articleContent("Japan South Korea Defense Agreement", [
        "Japan and South Korea have signed a comprehensive defense cooperation agreement, including real-time military intelligence sharing, joint naval exercises, and coordinated missile defense protocols.",
        "The pact represents a historic normalization of military relations between the two nations, which have been complicated by historical disputes dating back to Japan's colonial rule of the Korean Peninsula from 1910-1945.",
        "US officials welcomed the agreement, noting that trilateral cooperation between Washington, Tokyo, and Seoul strengthens the regional security architecture. China and North Korea have criticized the pact as destabilizing.",
        "The agreement includes provisions for joint humanitarian assistance and disaster relief operations, reflecting the growing importance of military cooperation for non-traditional security challenges in the Pacific region."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 432000000),
      readingTime: 5,
      viewCount: 2800,
      authorId: admin.id,
      categoryId: politics.id,
    }
  });

  // === ENTERTAINMENT (6 articles) ===
  const ent1 = await prisma.post.create({
    data: {
      title: "Streaming Wars Heat Up: Netflix Launches Free Ad-Supported Tier in 50 Countries",
      slug: "netflix-free-ad-supported-tier",
      excerpt: "Netflix expands its free tier to reach the next billion viewers who have never subscribed to a streaming service.",
      content: articleContent("Netflix Free Tier Expansion", [
        "Netflix has expanded its free ad-supported tier to 50 additional countries across Asia, Africa, and Latin America, targeting the estimated 1.2 billion potential viewers who have never subscribed to a premium streaming service.",
        "The free tier offers access to a curated library of 500 titles, including popular Netflix originals, with advertisements interspersed every 15 minutes. Users can upgrade to ad-supported ($6.99), standard ($13.99), or premium ($19.99) plans.",
        "The move is Netflix's most aggressive strategy to combat subscriber plateau in mature markets. The company reported 283 million global subscribers last quarter, with growth concentrated in regions where average revenue per user remains below $5.",
        "Competitors have responded cautiously. Disney+ and Amazon Prime Video are evaluating similar free-tier models, while regional streamers in India and Southeast Asia view the expansion as an existential threat to their businesses."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 5,
      viewCount: 6100,
      isFeatured: true,
      authorId: author3.id,
      categoryId: entertainment.id,
    }
  });

  const ent2 = await prisma.post.create({
    data: {
      title: "Beyoncé's Renaissance World Tour Becomes Highest-Grossing Concert Tour in History",
      slug: "beyonce-renaissance-tour-record",
      excerpt: "The tour surpassed $2.4 billion in total revenue across 96 shows spanning five continents.",
      content: articleContent("Beyonce Tour Record", [
        "Beyoncé's Renaissance World Tour has officially become the highest-grossing concert tour in music history, surpassing the previous record held by the Rolling Stones with a total gross of $2.4 billion across 96 performances.",
        "The tour's economic impact extended well beyond ticket sales. Hotels, restaurants, and retail businesses in tour cities reported revenue increases of 15-30% during performance weeks, according to local business associations.",
        "The production itself set new standards for live entertainment, featuring a 200-foot LED stage, real-time AI-driven visual effects, and a 60-piece live orchestra. Production costs for the tour exceeded $150 million.",
        "Music industry analysts note that the tour's success has accelerated the concert industry's shift toward premium pricing and immersive production, with artists and venues investing in technology-forward experiences."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
      readingTime: 5,
      viewCount: 7800,
      isTrending: true,
      authorId: author3.id,
      categoryId: entertainment.id,
    }
  });

  const ent3 = await prisma.post.create({
    data: {
      title: "Oscar-Winning Director Christopher Nolan Announces Next Film: 'Einstein's Compass'",
      slug: "nolan-einstein-compass-announcement",
      excerpt: "Nolan's next project explores the Nobel laureate's journey through the final decades of his life and his quest for a unified theory.",
      content: articleContent("Nolan Einstein Film", [
        "Christopher Nolan has confirmed his next film project, 'Einstein's Compass,' a biographical drama chronicling Albert Einstein's post-relativity years and his decades-long search for a unified field theory.",
        "The film will star Cillian Murphy as Einstein, marking his fifth collaboration with Nolan. Production is scheduled to begin in March 2027, with filming locations including Berlin, Princeton, and the Swiss Patent Office.",
        "Nolan described the project as his most personal film to date, exploring themes of intellectual isolation, the burden of genius, and the human cost of scientific obsession. The screenplay is reportedly based on newly released personal letters.",
        "Warner Bros. has committed a reported $250 million budget, making it one of the most expensive biographical films ever produced. The studio expects a holiday 2028 theatrical release, with Nolan insisting on a minimum 90-day exclusive theatrical window."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      readingTime: 5,
      viewCount: 9200,
      isTrending: true,
      authorId: author3.id,
      categoryId: entertainment.id,
    }
  });

  const ent4 = await prisma.post.create({
    data: {
      title: "K-Pop Group BTS Announces 2027 Reunion Tour Following Military Service",
      slug: "bts-reunion-tour-2027",
      excerpt: "All seven members will complete their mandatory military service by December, with a world tour planned for spring 2027.",
      content: articleContent("BTS Reunion Tour 2027", [
        "BTS's management agency HYBE has confirmed that all seven members of the globally dominant K-pop group will have completed their mandatory South Korean military service by December 2026, with a massive world reunion tour planned for spring 2027.",
        "The 'Comeback Trail' tour is expected to visit 40 cities across six continents, with anticipated attendance exceeding 4 million fans. Ticket pre-registration has already attracted over 15 million sign-ups, breaking every previous record.",
        "BTS's military service began in late 2022, with members enlisting in staggered intervals. During their absence, individual members pursued solo projects, releasing albums, starring in films, and launching fashion brands that collectively generated over $2 billion in revenue.",
        "The reunion is expected to have a significant economic impact on the K-pop industry. Analysts estimate the tour and associated merchandise sales will generate approximately $3.5 billion in direct and indirect economic activity."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      readingTime: 6,
      viewCount: 11000,
      isFeatured: true,
      isTrending: true,
      authorId: author3.id,
      categoryId: entertainment.id,
    }
  });

  const ent5 = await prisma.post.create({
    data: {
      title: "Hollywood Studios and Writers Guild Reach New Agreement on AI Usage",
      slug: "hollywood-ai-agreement-writers-guild",
      excerpt: "The deal establishes clear boundaries for AI-generated content in film and television production.",
      content: articleContent("Hollywood AI Agreement", [
        "The Alliance of Motion Picture and Television Producers (AMPTP) and the Writers Guild of America (WGA) have reached a new agreement establishing comprehensive guidelines for AI usage in film and television production.",
        "Under the terms, AI-generated text cannot be credited as 'written by' a human author, and studios must disclose when AI tools are used in script development. Writers retain the right to use AI as a research and brainstorming tool.",
        "The agreement also addresses AI's role in other creative departments. Actors' likeness rights now include explicit protections against AI replication without written consent and fair compensation, extending protections established in the 2023 SAG-AFTRA agreement.",
        "The deal is seen as a potential model for other creative industries grappling with AI integration. Music, publishing, and gaming unions are reportedly studying the Hollywood agreement as they negotiate their own AI policies."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 345600000),
      readingTime: 6,
      viewCount: 4300,
      authorId: author3.id,
      categoryId: entertainment.id,
    }
  });

  const ent6 = await prisma.post.create({
    data: {
      title: "World's Largest Music Festival Announces 2027 Lineup with AI-Generated Performances",
      slug: "music-festival-ai-performances-2027",
      excerpt: "Tomorrowland reveals a controversial new stage featuring AI-generated virtual artist performances alongside live acts.",
      content: articleContent("Music Festival AI Performances", [
        "Tomorrowland, the world's largest electronic music festival, has announced a new stage for its 2027 edition called 'The Algorithm,' featuring AI-generated virtual artist performances alongside traditional live DJ sets.",
        "The stage will showcase AI systems that create real-time music based on audience biometric data, including heart rate, movement patterns, and crowd density. The AI compositions will be unique to each performance, never to be repeated.",
        "The announcement has sparked heated debate within the music community. Supporters argue the technology represents the next frontier of electronic music, while critics call it a gimmick that undermines human artistry and live performance value.",
        "Three major music streaming platforms have expressed interest in licensing recordings of the AI performances, potentially creating an entirely new category of algorithmically generated commercial music."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 432000000),
      readingTime: 5,
      viewCount: 3500,
      authorId: author3.id,
      categoryId: entertainment.id,
    }
  });

  // === SPORT (6 articles) ===
  const sport1 = await prisma.post.create({
    data: {
      title: "Manchester City Completes Record Quadruple with Champions League Victory",
      slug: "man-city-record-quadruple",
      excerpt: "City becomes the first English club to win the Premier League, FA Cup, League Cup, and Champions League in a single season.",
      content: articleContent("Manchester City Record Quadruple", [
        "Manchester City has etched its name into football history by becoming the first English club ever to win the Premier League, FA Cup, League Cup, and UEFA Champions League in a single season, completing a stunning quadruple.",
        "The Champions League final saw City defeat Inter Milan 2-1 at Wembley, with goals from Erling Haaland and Phil Foden securing the trophy. The victory capped an extraordinary season in which City lost only two competitive matches.",
        "Manager Pep Guardiola described the achievement as the crowning moment of his coaching career. 'This group of players has done something that may never be repeated,' he said during the post-match celebration.",
        "The quadruple has been described as the greatest single-season achievement in English football history. Sports economists estimate the on-pitch success will generate over £800 million in commercial revenue for the club."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 6,
      viewCount: 9800,
      isFeatured: true,
      isBreaking: true,
      authorId: author3.id,
      categoryId: sport.id,
    }
  });

  const sp2 = await prisma.post.create({
    data: {
      title: "NBA Finals: Wembanyama Leads Spurs to Championship in Historic Rookie Season",
      slug: "nba-finals-wembanyama-spurs",
      excerpt: "Victor Wembanyama becomes the youngest Finals MVP as the San Antonio Spurs win their sixth NBA title.",
      content: articleContent("NBA Finals Wembanyama", [
        "Victor Wembanyama delivered a historic performance to lead the San Antonio Spurs to their sixth NBA Championship, defeating the Boston Celtics in six games and becoming the youngest Finals MVP in league history at age 22.",
        "Wembanyama averaged 28.3 points, 12.1 rebounds, and 4.2 blocks across the six-game series, including a 42-point masterpiece in the decisive Game 6. His combination of size and skill has been compared to a prime Hakeem Olajuwon.",
        "The championship is the Spurs' first since the Tim Duncan era and validates the franchise's three-year rebuild. Head coach Gregg Popovich, now 78, suggested it could be his final season before retirement.",
        "The NBA reported that the Finals averaged 18.2 million viewers, the highest ratings in five years, driven in part by Wembanyama's global appeal. Merchandise sales for the Spurs increased 400% during the playoff run."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
      readingTime: 6,
      viewCount: 7400,
      isTrending: true,
      authorId: author3.id,
      categoryId: sport.id,
    }
  });

  const sp3 = await prisma.post.create({
    data: {
      title: "2030 FIFA World Cup: Six-Host Format Unveiled with Expanded 48-Team Tournament",
      slug: "fifa-world-cup-2030-format",
      excerpt: "FIFA confirms the unprecedented six-nation hosting format spanning three continents for the 2030 World Cup.",
      content: articleContent("FIFA World Cup 2030 Format", [
        "FIFA has officially unveiled the format for the 2030 World Cup, confirming an unprecedented hosting arrangement across six nations on three continents: Spain, Portugal, Morocco, Argentina, Uruguay, and Paraguay.",
        "The tournament will feature 48 teams for the first time, expanded from the traditional 32-team format. The opening matches will be held in South America to celebrate the centennial of the first World Cup in 1930, with the majority of the tournament played in Europe and North Africa.",
        "The logistics of the multi-continent format have raised questions about travel fatigue and environmental impact. FIFA has committed to carbon offset programs and charter flights to minimize the tournament's environmental footprint.",
        "Ticket demand is expected to be unprecedented, with FIFA anticipating over 5 billion cumulative TV viewers across the tournament. The final will be held at Santiago Bernabéu in Madrid, with a planned capacity of 85,000."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      readingTime: 6,
      viewCount: 5100,
      authorId: author3.id,
      categoryId: sport.id,
    }
  });

  const sp4 = await prisma.post.create({
    data: {
      title: "Tennis Grand Slam Shake-Up: New $100 Million Prize Pool Announced",
      slug: "tennis-grand-slam-prize-pool",
      excerpt: "All four Grand Slam tournaments will collectively offer over $100 million in prize money starting in 2027.",
      content: articleContent("Tennis Grand Slam Prize Pool", [
        "In a landmark decision, the four Grand Slam tournament organizers have jointly announced a collective prize money pool exceeding $100 million beginning with the 2027 season, representing a 60% increase from current levels.",
        "The Australian Open, French Open, Wimbledon, and US Open have each committed to minimum individual prize funds of $25 million, with the US Open leading at $28 million. Prize money for early-round losers will see the largest percentage increases.",
        "The increase follows years of player advocacy for more equitable prize money distribution. Currently, players eliminated in the first round of Grand Slams receive a disproportionately small share of the total purse.",
        "The announcement comes as professional tennis faces increasing competition for top talent from the lucrative Saudi-backed tennis league. Tournament organizers view the prize money increase as essential for maintaining the prestige and competitiveness of the Grand Slam circuit."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      readingTime: 5,
      viewCount: 3200,
      authorId: author3.id,
      categoryId: sport.id,
    }
  });

  const sp5 = await prisma.post.create({
    data: {
      title: "Formula 1 Introduces Sustainable Fuel Regulations for 2027 Season",
      slug: "formula-1-sustainable-fuel-2027",
      excerpt: "All F1 teams will be required to use 100% sustainable fuels starting with the 2027 season.",
      content: articleContent("Formula 1 Sustainable Fuel", [
        "Formula 1 has confirmed that all teams will be required to use 100% sustainable fuels beginning with the 2027 season, marking the biggest single change in the sport's power unit regulations since the hybrid era began in 2014.",
        "The sustainable fuel, developed in partnership with Aramco and Shell, is produced from municipal waste, agricultural byproducts, and atmospheric carbon capture. Lab testing has demonstrated a 65% reduction in lifecycle carbon emissions compared to conventional racing fuel.",
        "F1's governing body, the FIA, has also mandated that the new engines must produce at least 500 horsepower while maintaining the current fuel consumption limits, pushing manufacturers to achieve unprecedented levels of thermal efficiency.",
        "The regulation change is part of F1's broader commitment to achieve net-zero carbon by 2030. The sustainable fuel technology is expected to trickle down to consumer vehicles within five years, potentially accelerating the transition away from fossil fuels."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 345600000),
      readingTime: 6,
      viewCount: 4400,
      isEditorPick: true,
      authorId: author3.id,
      categoryId: sport.id,
    }
  });

  const sp6 = await prisma.post.create({
    data: {
      title: "Olympic Committee Confirms eSports as Medal Event for 2028 Los Angeles Games",
      slug: "esports-olympic-medal-2028",
      excerpt: "Competitive gaming will debut as a full medal event at the 2028 Olympics, featuring five game titles across multiple genres.",
      content: articleContent("Esports Olympic Medal", [
        "The International Olympic Committee has officially confirmed that eSports will debut as a full medal event at the 2028 Los Angeles Olympics, with five competitive gaming titles scheduled across different genres.",
        "The selected titles include a first-person shooter, a sports simulation, a fighting game, a real-time strategy title, and a racing simulation. Specific game names will be announced in late 2026 following a evaluation process.",
        "The decision has been controversial within both the traditional Olympic community and the eSports world. Critics argue that commercial game publishers have too much influence over which titles are selected, while supporters view it as essential for the Olympics' relevance with younger audiences.",
        "Training infrastructure is already being developed, with several national Olympic committees establishing dedicated eSports training facilities. South Korea, China, and the United States are expected to field the strongest competitive gaming delegations."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 432000000),
      readingTime: 6,
      viewCount: 6300,
      isTrending: true,
      authorId: author3.id,
      categoryId: sport.id,
    }
  });

  // === GAMING (8 articles) ===
  const game1 = await prisma.post.create({
    data: {
      title: "Nintendo Announces Switch 2 with 4K OLED and Backward Compatibility",
      slug: "nintendo-switch-2-announcement",
      excerpt: "The highly anticipated successor features a 7-inch OLED display, NVIDIA custom chip, and full backward compatibility.",
      content: articleContent("Nintendo Switch 2", [
        "Nintendo has officially unveiled the Switch 2, its next-generation hybrid console, featuring a 7-inch 4K OLED display, a custom NVIDIA Tegra chip with DLSS support, and full backward compatibility with the original Switch library.",
        "The console's dock supports 4K output to televisions, while handheld mode renders at a native 1080p. Battery life is rated at 7 hours for most games, an improvement over the OLED Switch's 5-9 hour range depending on title.",
        "Nintendo confirmed launch titles including a new 3D Mario game, Metroid Prime 4, and Mario Kart 10. Third-party support has been significantly expanded, with Capcom, Square Enix, and Ubisoft all confirming day-one releases.",
        "Pre-orders for the Switch 2, priced at $399.99, opened immediately and sold out within 15 minutes in all major markets. Nintendo has warned of continued supply constraints through the holiday season due to unprecedented demand."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(),
      readingTime: 6,
      viewCount: 15000,
      isFeatured: true,
      isBreaking: true,
      isTrending: true,
      authorId: author3.id,
      categoryId: gaming.id,
    }
  });

  const gm2 = await prisma.post.create({
    data: {
      title: "GTA 6 Release Date Confirmed: Rockstar Sets New Industry Benchmark",
      slug: "gta-6-release-date-confirmed",
      excerpt: "Rockstar Games confirms a Fall 2026 release for the most anticipated game in history, with a reported $2 billion development budget.",
      content: articleContent("GTA 6 Release Date", [
        "Rockstar Games has confirmed that Grand Theft Auto VI will launch on October 28, 2026, for PlayStation 5 and Xbox Series X/S, with a PC release scheduled for Q1 2027. The announcement ended months of speculation about the game's release window.",
        "The game, set in a fictionalized version of Miami called Vice City, features a dual-protagonist system and the largest open world Rockstar has ever created. Early previews described the world as 'stunningly alive' with unprecedented NPC behavioral complexity.",
        "Industry analysts estimate GTA 6 could generate $3 billion in first-year sales alone, shattering entertainment industry records. The game's marketing budget alone is reportedly larger than most AAA game development costs.",
        "The announcement has sent shockwaves through the gaming industry, with several publishers adjusting their release schedules to avoid launching competing titles in the same window. Sony and Microsoft both expect the game to drive significant console hardware sales."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 86400000),
      readingTime: 7,
      viewCount: 22000,
      isFeatured: true,
      isTrending: true,
      authorId: author1.id,
      categoryId: gaming.id,
    }
  });

  const gm3 = await prisma.post.create({
    data: {
      title: "PlayStation 6 Specifications Leaked: AMD RDNA 5 GPU and 2TB SSD",
      slug: "playstation-6-specs-leaked",
      excerpt: "Internal documents reveal Sony's next console targets 8K gaming with AI-powered upscaling as standard.",
      content: articleContent("PlayStation 6 Specs Leaked", [
        "Confidential Sony documents leaked online have revealed key specifications for the PlayStation 6, confirming an AMD RDNA 5 GPU, custom Zen 6 CPU, and a 2TB NVMe SSD as standard hardware.",
        "The GPU is reported to deliver 40 teraflops of processing power with hardware-accelerated ray tracing, representing a 3x improvement over the PlayStation 5 Pro. AI-powered upscaling will enable 8K output at 60fps for supported titles.",
        "The 2TB SSD, double the PS5's base storage, addresses one of the most common consumer complaints about the current generation. Load times are reportedly under 1 second for most game scenarios.",
        "Sony has not officially commented on the leaked specifications but industry insiders suggest the console is targeting a late 2028 launch at a price point between $599 and $699. The leak has intensified speculation about the console wars between Sony and Microsoft."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 172800000),
      readingTime: 6,
      viewCount: 18000,
      isTrending: true,
      authorId: author1.id,
      categoryId: gaming.id,
    }
  });

  const gm4 = await prisma.post.create({
    data: {
      title: "Esports World Championship Prize Pool Hits Record $50 Million",
      slug: "esports-world-championship-50-million",
      excerpt: "The International Esports Federation's flagship tournament breaks all previous prize pool records.",
      content: articleContent("Esports World Championship", [
        "The 2026 Esports World Championship has shattered all previous prize pool records with a total purse of $50 million, more than double the previous record. The tournament features competitions across five major game titles.",
        "The largest single prize of $15 million will be awarded to the champions of the League of Legends Grand Finals, which is expected to draw over 100 million concurrent viewers globally — surpassing the Super Bowl's typical viewership.",
        "Sponsorship revenue has driven the prize pool growth, with tech companies, automotive brands, and energy drink manufacturers investing heavily in the rapidly growing competitive gaming ecosystem. Total sponsorship deals for the event exceeded $200 million.",
        "The tournament is being held across three cities — Seoul, Los Angeles, and Berlin — with a rotating schedule designed to accommodate viewers in Asia, the Americas, and Europe. Physical venues have sold out despite ticket prices ranging from $50 to $500."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 259200000),
      readingTime: 5,
      viewCount: 8500,
      authorId: author3.id,
      categoryId: gaming.id,
    }
  });

  const gm5 = await prisma.post.create({
    data: {
      title: "Steam's New AI Game Discovery Algorithm Transforms Indie Developer Visibility",
      slug: "steam-ai-game-discovery-indie",
      excerpt: "Valve's new recommendation engine has increased indie game sales by 340% for previously undiscovered titles.",
      content: articleContent("Steam AI Game Discovery", [
        "Valve has rolled out a new AI-powered game discovery algorithm on Steam that has dramatically improved visibility for indie developers, with previously buried titles seeing sales increases of up to 340%.",
        "The 'Deep Discovery' system uses natural language processing and gameplay behavior analysis to match players with games they're likely to enjoy, going beyond traditional tag-based and genre-based recommendation systems.",
        "Indie developers have reported the algorithm as a game-changer. Studios that previously struggled to gain visibility against major publisher marketing budgets are now seeing organic traffic comparable to games with dedicated advertising campaigns.",
        "The system also incorporates player sentiment analysis from reviews and community discussions to refine its recommendations over time. Games with strong player engagement metrics receive additional algorithmic promotion, creating a positive feedback loop."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 345600000),
      readingTime: 5,
      viewCount: 5200,
      authorId: author1.id,
      categoryId: gaming.id,
    }
  });

  const gm6 = await prisma.post.create({
    data: {
      title: "Cloud Gaming Revolution: Xbox Cloud Now Supports 4K 120fps Streaming",
      slug: "xbox-cloud-gaming-4k-120fps",
      excerpt: "Microsoft's cloud gaming service reaches a new technical milestone, making dedicated gaming hardware increasingly optional.",
      content: articleContent("Xbox Cloud Gaming 4K 120fps", [
        "Microsoft has announced that Xbox Cloud Gaming now supports 4K resolution at 120fps streaming, a technical milestone that significantly narrows the gap between cloud and local gaming experiences.",
        "The upgrade leverages Microsoft's Azure data center infrastructure, which now includes dedicated gaming nodes equipped with AMD RDNA 3 GPUs in over 40 regions worldwide. Latency has been reduced to under 15ms in most urban markets.",
        "The feature is available to Xbox Game Pass Ultimate subscribers at no additional cost, supporting over 200 titles at launch including Forza Motorsport, Halo Infinite, and Starfield. Microsoft plans to expand the 4K/120fps library to 500 titles by year-end.",
        "The development has reignited debates about the future of dedicated gaming consoles. While Microsoft continues to sell Xbox hardware, the company's strategy increasingly positions physical consoles as optional entry points to a cloud-first gaming ecosystem."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 432000000),
      readingTime: 5,
      viewCount: 6800,
      isEditorPick: true,
      authorId: author1.id,
      categoryId: gaming.id,
    }
  });

  const gm7 = await prisma.post.create({
    data: {
      title: "Unity Engine Scandal Leads to CEO Resignation and Company Restructuring",
      slug: "unity-ceo-resignation-restructuring",
      excerpt: "Following the pricing controversy, Unity undergoes major leadership changes and policy reversals.",
      content: articleContent("Unity CEO Resignation", [
        "Unity Technologies has announced the resignation of its CEO following a prolonged crisis triggered by the company's controversial runtime fee policy. The company has also completely reversed the policy that had threatened to charge developers per install.",
        "The new interim CEO, a gaming industry veteran, immediately implemented a series of reforms aimed at rebuilding trust with the game development community. The runtime fee was replaced with a simplified subscription model based on revenue thresholds.",
        "The crisis led to an exodus of developers to competitor engines, particularly Unreal Engine and open-source alternatives like Godot. Unity reported a 15% decline in active project counts during the quarter of peak controversy.",
        "Industry analysts estimate the crisis cost Unity approximately $2 billion in market value and years of brand equity built through decades of developer relations. The company's restructuring includes a return to its core identity as a developer-friendly platform."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 518400000),
      readingTime: 6,
      viewCount: 4100,
      authorId: author1.id,
      categoryId: gaming.id,
    }
  });

  const gm8 = await prisma.post.create({
    data: {
      title: "VR Gaming Reaches 50 Million Active Users as Meta Quest 4 Sells Record Numbers",
      slug: "vr-gaming-50-million-users",
      excerpt: "The VR gaming market hits a major milestone as affordable headsets drive mainstream adoption.",
      content: articleContent("VR Gaming 50 Million Users", [
        "The global VR gaming market has surpassed 50 million active users for the first time, driven largely by Meta's Quest 4 headset which has sold over 12 million units since its launch six months ago.",
        "The Quest 4, priced at $299, features pancake lenses, full-color passthrough for mixed reality, and a battery life of 3.5 hours. Its improved comfort and visual clarity have addressed the main barriers to VR adoption: price and physical discomfort.",
        "Game revenue has grown proportionally, with five VR titles now exceeding $100 million in lifetime sales. The most successful, a cooperative zombie survival game, has sold 15 million copies and maintains a daily active user base of 500,000.",
        "PlayStation's VR2 has also contributed to the growth, particularly in the Japanese and European markets. Apple's Vision Pro, while not primarily a gaming device, has introduced a new segment of mixed reality gaming experiences."
      ]),
      featuredImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=800&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      publishedAt: new Date(Date.now() - 604800000),
      readingTime: 5,
      viewCount: 7200,
      authorId: author1.id,
      categoryId: gaming.id,
    }
  });

  // Connect tags to some posts
  const allPosts = [biz1, biz2, biz3, ls1, ls3, tech1, tech2, tech3, pol1, pol4, ent1, ent2, ent4, sport1, gm2, gm4, sp6];

  for (const post of allPosts) {
    const randomTags = tags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    await prisma.post.update({
      where: { id: post.id },
      data: {
        tags: {
          connect: randomTags.map(t => ({ id: t.id }))
        }
      }
    });
  }

  // Create revisions for a few posts
  for (const post of [biz1, tech1, pol1, sport1, game1]) {
    await prisma.revision.create({
      data: {
        postId: post.id,
        title: post.title,
        content: post.content,
        excerpt: post.excerpt
      }
    });
  }

  console.log("Posts, tags, and relations seeded.");

  // 8. Create Mock Advertisements
  await prisma.ad.createMany({
    data: [
      {
        title: "Chronicle Premium Membership",
        placement: "SIDEBAR",
        type: "IMAGE",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=250&fit=crop",
        targetUrl: "/subscribe",
        status: "ACTIVE"
      },
      {
        title: "Hosting Sponsor Banner",
        placement: "HEADER",
        type: "HTML",
        code: `<div style="background:#5F4A8B;color:#FEFACD;padding:10px;text-align:center;font-weight:bold;font-size:14px;border-radius:4px;">
                SPONSORED: Blazing fast Node & Next.js cloud hosting. <a href="#" style="color:#FFF;text-decoration:underline;">Deploy in 60 seconds.</a>
              </div>`,
        status: "ACTIVE"
      },
      {
        title: "Newsletter CTA Ad",
        placement: "INLINE",
        type: "HTML",
        code: `<div style="background:#f0f0f0;border:2px dashed #5F4A8B;padding:20px;text-align:center;border-radius:8px;margin:20px 0;">
                <p style="font-weight:bold;color:#5F4A8B;margin:0 0 8px;">Enjoying this article?</p>
                <p style="color:#666;margin:0;font-size:14px;">Subscribe to Chronicle for premium journalism delivered daily.</p>
              </div>`,
        status: "ACTIVE"
      }
    ]
  });

  console.log("Advertisements seeded.");

  // 9. Create Sample Pages
  await prisma.page.createMany({
    data: [
      {
        title: "About Chronicle",
        slug: "about",
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "About Chronicle" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "Chronicle is an independent news organization delivering trusted, high-quality analysis and reporting on the ideas, trends, and technologies shaping our world. Founded in 2024, we've grown to serve millions of readers across the globe." }]
            },
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Our Mission" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "We believe in journalism that informs, challenges, and inspires. Our team of experienced reporters and analysts covers the stories that matter most, with depth and integrity that readers can trust." }]
            }
          ]
        }),
        status: "PUBLISHED",
        authorId: admin.id
      },
      {
        title: "Privacy Policy",
        slug: "privacy",
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Privacy Policy" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "At Chronicle, we take your privacy seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website." }]
            },
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Information We Collect" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "When you visit the site, we automatically collect certain information about your device, including your web browser, IP address, time zone, and some of the cookies that are installed on your device." }]
            }
          ]
        }),
        status: "PUBLISHED",
        authorId: admin.id
      },
      {
        title: "Terms & Conditions",
        slug: "terms",
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Terms & Conditions" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "These Terms of Service govern your use of Chronicle's website and services. By accessing or using our services, you agree to be bound by these terms." }]
            }
          ]
        }),
        status: "PUBLISHED",
        authorId: admin.id
      }
    ]
  });

  console.log("Pages seeded.");
  console.log("=== Seeding completed successfully! ===");
  console.log(`Created: ${7} categories, ${tags.length} tags, 40 posts, 3 pages`);
  console.log(`Users: admin@example.com / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
