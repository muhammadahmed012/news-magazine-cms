import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import FaqNodeView from "../FaqNodeView";

export interface FaqItem {
  question: string;
  answer: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    faq: {
      insertFaq: (items: FaqItem[]) => ReturnType;
      updateFaq: (items: FaqItem[]) => ReturnType;
    };
  }
}

export const FaqNode = Node.create({
  name: "faq",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (element) => {
          const data = element.getAttribute("data-faq-items");
          return data ? JSON.parse(data) : [];
        },
        renderHTML: (attributes) => {
          return { "data-faq-items": JSON.stringify(attributes.items) };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="faq"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "faq" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FaqNodeView);
  },

  addCommands() {
    return {
      insertFaq:
        (items: FaqItem[]) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { items },
          });
        },
      updateFaq:
        (items: FaqItem[]) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, { items });
        },
    };
  },
});
