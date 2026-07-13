// src/lib/seo.ts

export function generateNewsArticleSchema(post: any, siteUrl: string) {
  const postUrl = `${siteUrl}/${post.category.slug}/${post.slug}`;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl
    },
    "headline": post.seoTitle || post.title,
    "description": post.seoDescription || post.excerpt || post.subtitle || "",
    "image": post.featuredImage || "",
    "datePublished": post.publishedAt || post.createdAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name || "Chronicle Staff"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Chronicle",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    }
  };
  
  return JSON.stringify(schema);
}

export function generateBreadcrumbSchema(post: any, siteUrl: string) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": post.category.name,
        "item": `${siteUrl}/${post.category.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `${siteUrl}/${post.category.slug}/${post.slug}`
      }
    ]
  };
  
  return JSON.stringify(schema);
}

export function generatePageSchema(page: any, siteUrl: string) {
  const pageUrl = `${siteUrl}/${page.slug}`;
  
  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": page.schemaType || "WebPage",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": pageUrl
    },
    "name": page.seoTitle || page.title,
    "description": page.seoDescription || page.excerpt || "",
    "url": pageUrl,
    "datePublished": page.createdAt,
    "dateModified": page.updatedAt,
    "author": {
      "@type": "Person",
      "name": page.author?.name || "Chronicle Staff"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Chronicle",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    }
  };

  if (page.featuredImage) {
    schema.image = page.featuredImage;
  }

  if (page.structuredData) {
    try {
      const custom = JSON.parse(page.structuredData);
      return JSON.stringify({ ...schema, ...custom });
    } catch {}
  }

  return JSON.stringify(schema);
}

export function generatePageBreadcrumbSchema(page: any, siteUrl: string) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": page.title,
        "item": `${siteUrl}/${page.slug}`
      }
    ]
  };
  
  return JSON.stringify(schema);
}
