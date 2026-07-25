import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  primaryKey,
  foreignKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable(
  "User",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").notNull().unique(),
    passwordHash: text("passwordHash"),
    image: text("image"),
    role: text("role").notNull().default("SUBSCRIBER"),
    bio: text("bio"),
    title: text("title"),
    facebookUrl: text("facebookUrl"),
    twitterUrl: text("twitterUrl"),
    linkedinUrl: text("linkedinUrl"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [index("User_createdAt_idx").on(t.createdAt)]
);

// ─── Accounts (NextAuth) ─────────────────────────────────────────────
export const accounts = pgTable(
  "Account",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    uniqueIndex("Account_provider_providerAccountId_idx").on(
      t.provider,
      t.providerAccountId
    ),
  ]
);

// ─── Sessions (NextAuth) ─────────────────────────────────────────────
export const sessions = pgTable("Session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// ─── Posts ───────────────────────────────────────────────────────────
export const posts = pgTable(
  "Post",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
    featuredImage: text("featuredImage"),
    gallery: text("gallery"),
    videoUrl: text("videoUrl"),
    audioUrl: text("audioUrl"),
    status: text("status").notNull().default("DRAFT"),
    publishedAt: timestamp("publishedAt"),
    readingTime: integer("readingTime").notNull().default(0),
    viewCount: integer("viewCount").notNull().default(0),

    isFeatured: boolean("isFeatured").notNull().default(false),
    isBreaking: boolean("isBreaking").notNull().default(false),
    isEditorPick: boolean("isEditorPick").notNull().default(false),
    isTrending: boolean("isTrending").notNull().default(false),
    isSponsored: boolean("isSponsored").notNull().default(false),
    isSticky: boolean("isSticky").notNull().default(false),

    seoTitle: text("seoTitle"),
    seoDescription: text("seoDescription"),
    focusKeywords: text("focusKeywords"),
    canonicalUrl: text("canonicalUrl"),
    robotsMeta: text("robotsMeta"),
    schemaType: text("schemaType").notNull().default("NewsArticle"),
    structuredData: text("structuredData"),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),

    authorId: text("authorId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    categoryId: text("categoryId")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
  },
  (t) => [
    index("Post_status_publishedAt_idx").on(t.status, t.publishedAt),
    index("Post_categoryId_idx").on(t.categoryId),
    index("Post_authorId_idx").on(t.authorId),
    index("Post_viewCount_idx").on(t.viewCount),
    index("Post_status_isFeatured_publishedAt_idx").on(
      t.status,
      t.isFeatured,
      t.publishedAt
    ),
    index("Post_status_isTrending_idx").on(t.status, t.isTrending),
    index("Post_status_isEditorPick_idx").on(t.status, t.isEditorPick),
    index("Post_status_isBreaking_idx").on(t.status, t.isBreaking),
  ]
);

// ─── Pages ───────────────────────────────────────────────────────────
export const pages = pgTable("Page", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  featuredImage: text("featuredImage"),
  status: text("status").notNull().default("DRAFT"),

  seoTitle: text("seoTitle"),
  seoDescription: text("seoDescription"),
  focusKeywords: text("focusKeywords"),
  canonicalUrl: text("canonicalUrl"),
  robotsMeta: text("robotsMeta"),
  schemaType: text("schemaType").notNull().default("WebPage"),
  structuredData: text("structuredData"),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),

  authorId: text("authorId")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
});

// ─── Categories ──────────────────────────────────────────────────────
export const categories = pgTable(
  "Category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    longDescription: text("longDescription"),
    icon: text("icon"),
    image: text("image"),
    color: text("color"),
    layoutStyle: text("layoutStyle").notNull().default("grid"),
    order: integer("order").notNull().default(0),
    seoTitle: text("seoTitle"),
    seoDescription: text("seoDescription"),
    parentId: text("parentId"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [
    index("Category_parentId_idx").on(t.parentId),
    index("Category_order_idx").on(t.order),
  ]
);

// Self-referential FK for Category
export const categoryParentFk = foreignKey({
  columns: [categories.parentId],
  foreignColumns: [categories.id],
  name: "Category_parentId_fkey",
}).onDelete("cascade");

// ─── Tags ────────────────────────────────────────────────────────────
export const tags = pgTable("Tag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ─── PostTags (many-to-many) ─────────────────────────────────────────
export const postTags = pgTable(
  "PostTags",
  {
    postId: text("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })]
);

// ─── Media ───────────────────────────────────────────────────────────
export const media = pgTable("Media", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fileName: text("fileName").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: integer("fileSize").notNull(),
  mimeType: text("mimeType").notNull(),
  folderPath: text("folderPath").notNull().default("/"),
  altText: text("altText"),
  caption: text("caption"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ─── Comments ────────────────────────────────────────────────────────
export const comments = pgTable(
  "Comment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    content: text("content").notNull(),
    status: text("status").notNull().default("APPROVED"),

    postId: text("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("authorId").references(() => users.id, {
      onDelete: "cascade",
    }),

    guestName: text("guestName"),
    guestEmail: text("guestEmail"),

    parentId: text("parentId"),

    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [
    index("Comment_postId_status_idx").on(t.postId, t.status),
    index("Comment_authorId_idx").on(t.authorId),
  ]
);

// Self-referential FK for Comment
export const commentParentFk = foreignKey({
  columns: [comments.parentId],
  foreignColumns: [comments.id],
  name: "Comment_parentId_fkey",
}).onDelete("cascade");

// ─── Ads ─────────────────────────────────────────────────────────────
export const ads = pgTable(
  "Ad",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    placement: text("placement").notNull(),
    type: text("type").notNull().default("IMAGE"),
    code: text("code"),
    imageUrl: text("imageUrl"),
    targetUrl: text("targetUrl"),
    status: text("status").notNull().default("ACTIVE"),
    impressions: integer("impressions").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    startDate: timestamp("startDate"),
    endDate: timestamp("endDate"),
    desktopOnly: boolean("desktopOnly").notNull().default(false),
    mobileOnly: boolean("mobileOnly").notNull().default(false),
    targetSection: text("targetSection"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (t) => [
    index("Ad_placement_status_idx").on(t.placement, t.status),
    index("Ad_status_idx").on(t.status),
  ]
);

// ─── Settings ────────────────────────────────────────────────────────
export const settings = pgTable("Setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// ─── Newsletter Subscribers ──────────────────────────────────────────
export const newsletterSubscribers = pgTable("NewsletterSubscriber", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ─── Revisions ───────────────────────────────────────────────────────
export const revisions = pgTable("Revision", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ─── Attachments ─────────────────────────────────────────────────────
export const attachments = pgTable("Attachment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  fileName: text("fileName").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileSize: integer("fileSize").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// ─── Activity Logs ───────────────────────────────────────────────────
export const activityLogs = pgTable(
  "ActivityLog",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    details: text("details"),
    ipAddress: text("ipAddress"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (t) => [index("ActivityLog_userId_idx").on(t.userId)]
);

// ─── Relations ───────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  pages: many(pages),
  comments: many(comments),
  sessions: many(sessions),
  accounts: many(accounts),
  logs: many(activityLogs),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  tags: many(postTags),
  comments: many(comments),
  revisions: many(revisions),
  attachments: many(attachments),
}));

export const pagesRelations = relations(pages, ({ one }) => ({
  author: one(users, {
    fields: [pages.authorId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "ParentChildren",
  }),
  children: many(categories, { relationName: "ParentChildren" }),
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "CommentReplies",
  }),
  replies: many(comments, { relationName: "CommentReplies" }),
}));

export const revisionsRelations = relations(revisions, ({ one }) => ({
  post: one(posts, {
    fields: [revisions.postId],
    references: [posts.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  post: one(posts, {
    fields: [attachments.postId],
    references: [posts.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));
