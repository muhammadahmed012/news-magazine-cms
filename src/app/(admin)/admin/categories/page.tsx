// src/app/(admin)/admin/categories/page.tsx
import { db } from "@/lib/db";
import { categories, posts } from "@/lib/schema";
import { eq, asc, sql, isNotNull } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { revalidatePath } from "next/cache";
import CategoryEditor from "@/components/admin/CategoryEditor";
import TagsManager from "@/components/admin/TagsManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const parentCat = alias(categories, "parentCategory");

  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      longDescription: categories.longDescription,
      icon: categories.icon,
      image: categories.image,
      color: categories.color,
      layoutStyle: categories.layoutStyle,
      order: categories.order,
      seoTitle: categories.seoTitle,
      seoDescription: categories.seoDescription,
      parentId: categories.parentId,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
      parentName: parentCat.name,
    })
    .from(categories)
    .leftJoin(parentCat, eq(categories.parentId, parentCat.id))
    .orderBy(asc(categories.order), asc(categories.name));

  const [postCountRows, childCountRows] = await Promise.all([
    db
      .select({
        categoryId: posts.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(posts)
      .groupBy(posts.categoryId),
    db
      .select({
        parentId: categories.parentId,
        count: sql<number>`count(*)::int`,
      })
      .from(categories)
      .where(isNotNull(categories.parentId))
      .groupBy(categories.parentId),
  ]);

  const postCountMap = new Map(postCountRows.map((r) => [r.categoryId, r.count]));
  const childCountMap = new Map(childCountRows.map((r) => [r.parentId, r.count]));

  const categoryList = categoryRows.map((row) => ({
    ...row,
    parent: row.parentName ? { name: row.parentName } : null,
    _count: {
      posts: postCountMap.get(row.id) || 0,
      children: childCountMap.get(row.id) || 0,
    },
  }));

  const handleCreateCategory = async (data: {
    name: string;
    description: string;
    longDescription: string;
    parentId: string;
    icon: string;
    color: string;
    layoutStyle: string;
  }) => {
    "use server";
    const { name, description, longDescription, parentId, icon, color, layoutStyle } = data;
    if (!name) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    try {
      await db.insert(categories).values({
        name,
        slug,
        description: description || null,
        longDescription: longDescription || null,
        parentId: parentId || null,
        icon: icon || null,
        color: color || null,
        layoutStyle: layoutStyle || "grid",
      });
      revalidatePath("/admin/categories");
      revalidatePath("/");
    } catch (e) {
      console.error("Failed to create category:", e);
    }
  };

  const handleUpdateCategory = async (data: {
    id: string;
    name: string;
    description: string;
    longDescription: string;
    parentId: string;
    icon: string;
    color: string;
    layoutStyle: string;
  }) => {
    "use server";
    const { id, name, description, longDescription, parentId, icon, color, layoutStyle } = data;
    if (!id || !name) return;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    try {
      await db.update(categories).set({
        name,
        slug,
        description: description || null,
        longDescription: longDescription || null,
        parentId: parentId || null,
        icon: icon || null,
        color: color || null,
        layoutStyle: layoutStyle || "grid",
      }).where(eq(categories.id, id));
      revalidatePath("/admin/categories");
      revalidatePath("/");
    } catch (e) {
      console.error("Failed to update category:", e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    "use server";
    if (!id) return;
    try {
      await db.delete(categories).where(eq(categories.id, id));
      revalidatePath("/admin/categories");
      revalidatePath("/");
    } catch (e) {
      console.error("Failed to delete category:", e);
    }
  };

  return (
    <div className="flex flex-col gap-8 select-none">
      <div className="pb-6 border-b border-border-subtle">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text-primary tracking-tight">
          Categories & Tags
        </h1>
        <p className="text-xs font-semibold text-gray-400 mt-1">
          Manage your publication's topic taxonomy and category hierarchy.
        </p>
      </div>

      <CategoryEditor
        categories={categoryList as any}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <div className="bg-white border border-border-subtle p-6 rounded-md shadow-sm">
        <TagsManager />
      </div>
    </div>
  );
}
