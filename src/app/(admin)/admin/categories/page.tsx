// src/app/(admin)/admin/categories/page.tsx
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import CategoryEditor from "@/components/admin/CategoryEditor";
import TagsManager from "@/components/admin/TagsManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: {
      parent: { select: { name: true } },
      _count: { select: { posts: true, children: true } },
    },
  });

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
      await prisma.category.create({
        data: {
          name,
          slug,
          description: description || null,
          longDescription: longDescription || null,
          parentId: parentId || null,
          icon: icon || null,
          color: color || null,
          layoutStyle: layoutStyle || "grid",
        },
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
      await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
          description: description || null,
          longDescription: longDescription || null,
          parentId: parentId || null,
          icon: icon || null,
          color: color || null,
          layoutStyle: layoutStyle || "grid",
        },
      });
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
      await prisma.category.delete({ where: { id } });
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
        categories={categories as any}
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
