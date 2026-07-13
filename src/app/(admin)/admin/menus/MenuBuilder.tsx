"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Link as LinkIcon, FileText, FolderOpen, ChevronDown, ChevronRight, Newspaper, ArrowUpRight } from "lucide-react";

interface MenuItem {
  id: string;
  label: string;
  link: string;
  target?: "_self" | "_blank";
  children?: MenuItem[];
}

export default function MenuBuilder({
  initialMenu,
  availablePages,
  availableCategories,
  availablePosts,
  onChange,
}: {
  initialMenu: MenuItem[];
  availablePages: any[];
  availableCategories: any[];
  availablePosts?: any[];
  onChange?: (items: MenuItem[]) => void;
}) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenu || []);

  const updateMenu = (items: MenuItem[]) => {
    setMenuItems(items);
    onChange?.(items);
  };
  const [customLabel, setCustomLabel] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [customTarget, setCustomTarget] = useState<"_self" | "_blank">("_self");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [nestingTarget, setNestingTarget] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddCustom = () => {
    if (!customLabel || !customLink) return;
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: customLabel,
      link: customLink,
      target: customTarget,
    };
    if (nestingTarget) {
      updateMenu(addChildToItem(menuItems, nestingTarget, newItem));
      setNestingTarget(null);
    } else {
      updateMenu([...menuItems, newItem]);
    }
    setCustomLabel("");
    setCustomLink("");
    setCustomTarget("_self");
  };

  const handleAddPage = (page: any) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: page.title,
      link: `/${page.slug}`,
    };
    if (nestingTarget) {
      updateMenu(addChildToItem(menuItems, nestingTarget, newItem));
      setNestingTarget(null);
    } else {
      updateMenu([...menuItems, newItem]);
    }
  };

  const handleAddCategory = (category: any) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: category.name,
      link: `/${category.slug}`,
    };
    if (nestingTarget) {
      updateMenu(addChildToItem(menuItems, nestingTarget, newItem));
      setNestingTarget(null);
    } else {
      updateMenu([...menuItems, newItem]);
    }
  };

  const handleAddPost = (post: any) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: post.title,
      link: `/${post.category?.slug || "posts"}/${post.slug}`,
    };
    if (nestingTarget) {
      updateMenu(addChildToItem(menuItems, nestingTarget, newItem));
      setNestingTarget(null);
    } else {
      updateMenu([...menuItems, newItem]);
    }
  };

  const handleRemove = (id: string) => {
    updateMenu(removeItemById(menuItems, id));
  };

  const handleToggleTarget = (id: string) => {
    updateMenu(toggleItemTarget(menuItems, id));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newItems = [...menuItems];
    if (index + direction < 0 || index + direction >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = temp;
    updateMenu(newItems);
  };

  const nestItem = (id: string) => {
    setNestingTarget(nestingTarget === id ? null : id);
  };

  const unNestItem = (parentId: string, childId: string) => {
    const newItems = JSON.parse(JSON.stringify(menuItems)) as MenuItem[];
    const parent = findItemById(newItems, parentId);
    if (!parent || !parent.children) return;
    const childIdx = parent.children.findIndex((c) => c.id === childId);
    if (childIdx === -1) return;
    const [child] = parent.children.splice(childIdx, 1);
    parent.children = parent.children.length > 0 ? parent.children : undefined;
    const parentIdx = newItems.findIndex((i) => i.id === parentId);
    newItems.splice(parentIdx + 1, 0, child);
    updateMenu(newItems);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1 flex flex-col gap-6">
        <div className="bg-white p-4 border border-border-subtle rounded-md shadow-sm flex flex-col gap-3">
          <h4 className="font-bold text-xs uppercase tracking-widest text-text-primary flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gray-400" /> Custom Link
          </h4>
          <input
            type="text"
            placeholder="Link Text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md"
          />
          <input
            type="text"
            placeholder="URL (e.g. /contact or https://...)"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
            className="w-full text-xs font-semibold px-3 py-2 border border-border-subtle rounded-md"
          />
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Target:</label>
            <select
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value as "_self" | "_blank")}
              className="flex-1 text-xs font-semibold px-2 py-1.5 border border-border-subtle bg-white rounded-md"
            >
              <option value="_self">Same Tab</option>
              <option value="_blank">New Tab</option>
            </select>
          </div>
          {nestingTarget && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold px-3 py-2 rounded-md flex items-center justify-between">
              <span>Nesting under selected item</span>
              <button type="button" onClick={() => setNestingTarget(null)} className="text-blue-500 hover:text-blue-700">Cancel</button>
            </div>
          )}
          <button
            type="button"
            onClick={handleAddCustom}
            className="bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded-md hover:bg-brand-hover transition-colors"
          >
            Add to Menu
          </button>
        </div>

        <div className="bg-white p-4 border border-border-subtle rounded-md shadow-sm flex flex-col gap-3">
          <h4 className="font-bold text-xs uppercase tracking-widest text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Pages
          </h4>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-2">
            {availablePages.map((page) => (
              <div key={page.id} className="flex items-center justify-between group py-1 border-b border-gray-100 last:border-0">
                <span className="text-xs font-medium text-gray-600 truncate">{page.title}</span>
                <button
                  type="button"
                  onClick={() => handleAddPage(page)}
                  className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 border border-border-subtle rounded-md shadow-sm flex flex-col gap-3">
          <h4 className="font-bold text-xs uppercase tracking-widest text-text-primary flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-gray-400" /> Categories
          </h4>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-2">
            {availableCategories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between group py-1 border-b border-gray-100 last:border-0">
                <span className="text-xs font-medium text-gray-600 truncate">{cat.name}</span>
                <button
                  type="button"
                  onClick={() => handleAddCategory(cat)}
                  className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {availablePosts && availablePosts.length > 0 && (
          <div className="bg-white p-4 border border-border-subtle rounded-md shadow-sm flex flex-col gap-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-text-primary flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-gray-400" /> Posts
            </h4>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-2">
              {availablePosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between group py-1 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-medium text-gray-600 truncate">{post.title}</span>
                  <button
                    type="button"
                    onClick={() => handleAddPost(post)}
                    className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <div className="bg-white border border-border-subtle rounded-md shadow-sm min-h-[400px]">
          <div className="p-4 border-b border-border-subtle bg-bg-light">
            <h4 className="font-bold text-xs uppercase tracking-widest text-text-primary">Menu Structure</h4>
            <p className="text-[10px] text-gray-500 mt-1">Reorder items using arrows. Click the nest button to make an item a submenu of the item above it.</p>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {menuItems.map((item, index) => (
              <MenuItemRow
                key={item.id}
                item={item}
                index={index}
                totalItems={menuItems.length}
                depth={0}
                nestingTarget={nestingTarget}
                expandedItems={expandedItems}
                onToggleExpand={toggleExpand}
                onMove={moveItem}
                onNest={nestItem}
                onRemove={handleRemove}
                onToggleTarget={handleToggleTarget}
                onUnNest={unNestItem}
                parentId={null}
              />
            ))}
            {menuItems.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-400 font-medium">
                Add items from the left column.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuItemRow({
  item,
  index,
  totalItems,
  depth,
  nestingTarget,
  expandedItems,
  onToggleExpand,
  onMove,
  onNest,
  onRemove,
  onToggleTarget,
  onUnNest,
  parentId,
}: {
  item: MenuItem;
  index: number;
  totalItems: number;
  depth: number;
  nestingTarget: string | null;
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onNest: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleTarget: (id: string) => void;
  onUnNest: (parentId: string, childId: string) => void;
  parentId: string | null;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isNesting = nestingTarget === item.id;
  const isTopLevel = depth === 0;

  return (
    <div>
      <div
        className={`flex items-center gap-3 border rounded-md p-3 group transition-colors ${
          isNesting ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-border-subtle"
        }`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        {isTopLevel ? (
          <div className="flex flex-col gap-1 opacity-50 hover:opacity-100">
            <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} className="disabled:opacity-20"><GripVertical className="w-4 h-4 rotate-90" /></button>
            <button type="button" onClick={() => onMove(index, 1)} disabled={index === totalItems - 1} className="disabled:opacity-20"><GripVertical className="w-4 h-4 rotate-90" /></button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onUnNest(parentId!, item.id)}
            className="opacity-40 hover:opacity-100 text-gray-500"
            title="Move to top level"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}

        {hasChildren && (
          <button type="button" onClick={() => onToggleExpand(item.id)} className="text-gray-400 hover:text-gray-600">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <span className="font-bold text-sm text-text-primary truncate">{item.label}</span>
          <span className="text-xs text-gray-400 font-mono truncate">{item.link}</span>
        </div>

        {item.target === "_blank" && (
          <span className="text-[8px] font-bold uppercase bg-orange-50 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-sm">New Tab</span>
        )}

        <button
          type="button"
          onClick={() => onToggleTarget(item.id)}
          className="text-gray-400 hover:text-brand-primary transition-colors p-1"
          title="Toggle open in new tab"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        {isTopLevel && (
          <button
            type="button"
            onClick={() => onNest(item.id)}
            className={`text-gray-400 hover:text-brand-primary transition-colors p-1 ${isNesting ? "text-brand-primary" : ""}`}
            title="Nest under previous item"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-red-400 hover:text-red-600 transition-colors p-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col gap-1 mt-1">
          {item.children!.map((child, childIdx) => (
            <MenuItemRow
              key={child.id}
              item={child}
              index={childIdx}
              totalItems={item.children!.length}
              depth={depth + 1}
              nestingTarget={nestingTarget}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
              onMove={() => {}}
              onNest={onNest}
              onRemove={onRemove}
              onToggleTarget={onToggleTarget}
              onUnNest={onUnNest}
              parentId={item.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function addChildToItem(items: MenuItem[], parentId: string, child: MenuItem): MenuItem[] {
  return items.map((item) => {
    if (item.id === parentId) {
      return { ...item, children: [...(item.children || []), child] };
    }
    if (item.children) {
      return { ...item, children: addChildToItem(item.children, parentId, child) };
    }
    return item;
  });
}

function removeItemById(items: MenuItem[], id: string): MenuItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => {
      if (item.children) {
        return { ...item, children: removeItemById(item.children, id) };
      }
      return item;
    });
}

function findItemById(items: MenuItem[], id: string): MenuItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

function toggleItemTarget(items: MenuItem[], id: string): MenuItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return { ...item, target: item.target === "_blank" ? "_self" : "_blank" };
    }
    if (item.children) {
      return { ...item, children: toggleItemTarget(item.children, id) };
    }
    return item;
  });
}
