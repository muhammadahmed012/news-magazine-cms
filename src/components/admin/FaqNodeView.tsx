"use client";

import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { Plus, Trash2, GripVertical, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqNodeView({ node, updateAttributes }: any) {
  const items: FaqItem[] = node.attrs.items || [];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const updateItem = (index: number, field: "question" | "answer", value: string) => {
    const newItems = items.map((item: FaqItem, i: number) =>
      i === index ? { ...item, [field]: value } : item
    );
    updateAttributes({ items: newItems });
  };

  const addItem = () => {
    const newItems = [...items, { question: "", answer: "" }];
    updateAttributes({ items: newItems });
    setExpandedIndex(newItems.length - 1);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_: FaqItem, i: number) => i !== index);
    updateAttributes({ items: newItems });
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  return (
    <NodeViewWrapper>
      <style dangerouslySetInnerHTML={{ __html: `
        .faq-editor { border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden; background: #fafafa; }
        .faq-editor-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: linear-gradient(135deg, #5F4A8B 0%, #7B68AE 100%); color: #fff; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .faq-editor-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .faq-item { border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; overflow: hidden; }
        .faq-item-header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; cursor: pointer; background: #f9fafb; border-bottom: 1px solid transparent; transition: background 0.15s; }
        .faq-item-header:hover { background: #f3f4f6; }
        .faq-item-header.open { border-bottom-color: #e5e7eb; }
        .faq-item-q { flex: 1; font-size: 13px; font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .faq-item-a { padding: 12px; }
        .faq-input { width: 100%; font-size: 13px; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 4px; outline: none; transition: border-color 0.15s; }
        .faq-input:focus { border-color: #5F4A8B; }
        .faq-textarea { width: 100%; font-size: 13px; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 4px; outline: none; resize: vertical; min-height: 60px; line-height: 1.5; transition: border-color 0.15s; }
        .faq-textarea:focus { border-color: #5F4A8B; }
        .faq-add-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 10px; border: 2px dashed #d1d5db; border-radius: 6px; background: transparent; color: #6b7280; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .faq-add-btn:hover { border-color: #5F4A8B; color: #5F4A8B; background: #f5f3ff; }
      ` }} />

      <div className="faq-editor" contentEditable={false}>
        <div className="faq-editor-header">
          <HelpCircle className="w-4 h-4" />
          FAQ Accordion Block
        </div>
        <div className="faq-editor-body">
          {items.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No FAQ items yet. Click below to add one.</p>
          )}
          {items.map((item: FaqItem, index: number) => (
            <div key={index} className="faq-item">
              <div
                className={`faq-item-header ${expandedIndex === index ? "open" : ""}`}
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <GripVertical className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <span className="faq-item-q">
                  {item.question || `Question ${index + 1} (click to edit)`}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">{expandedIndex === index ? "▲" : "▼"}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                  className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {expandedIndex === index && (
                <div className="faq-item-a">
                  <div className="flex flex-col gap-1.5 mb-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Question</label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateItem(index, "question", e.target.value)}
                      placeholder="e.g. What is your return policy?"
                      className="faq-input"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Answer</label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => updateItem(index, "answer", e.target.value)}
                      placeholder="Provide a detailed answer to this question..."
                      className="faq-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
          <button type="button" className="faq-add-btn" onClick={addItem}>
            <Plus className="w-4 h-4" /> Add FAQ Item
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
