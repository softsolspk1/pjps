"use client";

import React, { useRef, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Highlight } from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { 
  Bold, Italic, Heading1, Heading2, Heading3, 
  Minus, Image as ImageIcon, Maximize2, AlignLeft, 
  AlignCenter, AlignRight, AlignJustify, List, 
  ListOrdered, Minimize, Columns,
  Link as LinkIcon, Underline as UnderlineIcon,
  Highlighter, Quote, Subscript as SubIcon, Superscript as SuperIcon, 
  Undo2, Redo2, Table2, ArrowDownToLine, ArrowRightToLine, Eraser, 
  Strikethrough
} from "lucide-react";
import styles from "./article-design.module.css";

const editorStyles = `
  .tiptap-section {
     text-align: justify;
     font-family: 'Times New Roman', Times, serif;
     font-size: 10pt;
     line-height: 1.35;
     width: 100%;
     box-sizing: border-box;
     background: white;
     color: black;
  }
  .tiptap-section:focus, .tiptap-section:active { outline: none; }
  .tiptap-section img { max-width: 100% !important; margin: 10pt auto !important; display: block; }
  .ProseMirror, .ProseMirror-focused { outline: none !important; border: none !important; box-shadow: none !important; }
  .tiptap-section h1 { margin-top: 15pt; margin-bottom: 8pt; font-size: 14pt; line-height: 1.2; font-weight: bold; text-align: left; text-transform: uppercase; }
  .tiptap-section h2 { margin-top: 12pt; margin-bottom: 6pt; font-size: 11pt; font-weight: bold; text-transform: uppercase; }
  .tiptap-section h3 { margin-top: 10pt; margin-bottom: 4pt; font-size: 10.5pt; font-weight: bold; font-style: italic; }
  .tiptap-section p { margin-bottom: 8pt; line-height: 1.35; }
  .tiptap-section ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
  .tiptap-section ol { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: decimal; }
  .tiptap-section table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 0; overflow: hidden; }
  .tiptap-section table td, .tiptap-section table th { min-width: 1em; border: 1px solid #cbd5e0; padding: 3px 5px; vertical-align: top; box-sizing: border-box; position: relative; }
  .tiptap-section table th { font-weight: bold; text-align: left; background-color: #f7fafc; }
  .column-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18pt; margin: 12pt 0; }
  .column-block { min-height: 2rem; padding: 0; }
  @media print { .column-block { border: none !important; padding: 0 !important; } }
`;

const ColumnBlock = TiptapNode.create({
  name: 'columnBlock',
  content: 'block+',
  isolating: true,
  parseHTML() { return [{ tag: 'div.column-block' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'column-block' }), 0]; },
});

const ColumnLayout = TiptapNode.create({
  name: 'columnLayout',
  group: 'block',
  content: 'columnBlock columnBlock',
  parseHTML() { return [{ tag: 'div.column-layout' }]; },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { class: 'column-layout' }), 0]; },
  addCommands() {
    return {
      // @ts-ignore
      insertTwoColumns: () => ({ commands }: any) => {
        return commands.insertContent({
          type: 'columnLayout',
          content: [
            { type: 'columnBlock', content: [{ type: 'paragraph' }] },
            { type: 'columnBlock', content: [{ type: 'paragraph' }] },
          ],
        });
      },
    } as any;
  },
});

interface SectionEditorProps {
  title: string;
  html: string;
  onChange: (html: string) => void;
  onImageUpload: (files: File[], editor: any) => Promise<void>;
}

export default function SectionEditor({ title, html, onChange, onImageUpload }: SectionEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({ inline: true, HTMLAttributes: { class: 'tiptap-image' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ openOnClick: false }),
      Subscript,
      Superscript,
      Highlight,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      ColumnBlock,
      ColumnLayout
    ],
    content: html,
    editorProps: { attributes: { class: 'tiptap-section' } },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  if (!editor) return null;

  return (
    <div className={`${styles.editorContainerWrapper} ${isFullscreen ? styles.editorContainerFullscreen : ""} relative`} style={{ marginBottom: "20px", border: "1px solid #edf2f7", borderRadius: "8px", overflow: "hidden", backgroundColor: "white" }}>
        
        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onImageUpload(Array.from(e.target.files), editor)} accept="image/*" multiple className="hidden" style={{display: "none"}} />

        <div style={{ backgroundColor: "#f8fafc", padding: "12px 20px", borderBottom: "1px solid #edf2f7", fontWeight: "bold", fontSize: "12px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </div>
        
        <div className={styles.toolbar} style={{ justifyContent: "flex-start", display: "flex", flexWrap: "wrap", gap: "6px", padding: "10px", backgroundColor: "#fff", borderBottom: "1px solid #edf2f7", position: "sticky", top: 0, zIndex: 50 }}>
          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
            <button onClick={() => editor.chain().focus().undo().run()} className={styles.toolbarBtn} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
            <button onClick={() => editor.chain().focus().redo().run()} className={styles.toolbarBtn} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
          </div>
          
          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? styles.toolbarBtnActive : ""}`} title="Heading 1"><Heading1 size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? styles.toolbarBtnActive : ""}`} title="Heading 2"><Heading2 size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 3 }) ? styles.toolbarBtnActive : ""}`} title="Heading 3"><Heading3 size={16} /></button>
          </div>

          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${styles.toolbarBtn} ${editor.isActive("bold") ? styles.toolbarBtnActive : ""}`} title="Bold"><Bold size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${styles.toolbarBtn} ${editor.isActive("italic") ? styles.toolbarBtnActive : ""}`} title="Italic"><Italic size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${styles.toolbarBtn} ${editor.isActive("underline") ? styles.toolbarBtnActive : ""}`} title="Underline"><UnderlineIcon size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleStrike && editor.chain().focus().toggleStrike().run()} className={`${styles.toolbarBtn} ${editor.isActive("strike") ? styles.toolbarBtnActive : ""}`} title="Strikethrough"><Strikethrough size={16} /></button>
          </div>

          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
             <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={`${styles.toolbarBtn} ${editor.isActive("subscript") ? styles.toolbarBtnActive : ""}`} title="Subscript"><SubIcon size={16} /></button>
             <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={`${styles.toolbarBtn} ${editor.isActive("superscript") ? styles.toolbarBtnActive : ""}`} title="Superscript"><SuperIcon size={16} /></button>
             <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={`${styles.toolbarBtn} ${editor.isActive("highlight") ? styles.toolbarBtnActive : ""}`} title="Highlight"><Highlighter size={16} /></button>
          </div>

          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
            <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "left" }) ? styles.toolbarBtnActive : ""}`} title="Align Left"><AlignLeft size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "center" }) ? styles.toolbarBtnActive : ""}`} title="Align Center"><AlignCenter size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "right" }) ? styles.toolbarBtnActive : ""}`} title="Align Right"><AlignRight size={16} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign("justify").run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "justify" }) ? styles.toolbarBtnActive : ""}`} title="Justify"><AlignJustify size={16} /></button>
          </div>

          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
             <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.toolbarBtn} ${editor.isActive("bulletList") ? styles.toolbarBtnActive : ""}`} title="Bullet List"><List size={16} /></button>
             <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${styles.toolbarBtn} ${editor.isActive("orderedList") ? styles.toolbarBtnActive : ""}`} title="Ordered List"><ListOrdered size={16} /></button>
             <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`${styles.toolbarBtn} ${editor.isActive("blockquote") ? styles.toolbarBtnActive : ""}`} title="Blockquote"><Quote size={16} /></button>
          </div>

          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
            <button onClick={() => { const url = window.prompt("Enter URL:"); if (url) editor.chain().focus().setLink({ href: url }).run(); }} className={`${styles.toolbarBtn} ${editor.isActive("link") ? styles.toolbarBtnActive : ""}`} title="Insert Link"><LinkIcon size={16} /></button>
            <button onClick={() => fileInputRef.current?.click()} className={styles.toolbarBtn} title="Insert Image"><ImageIcon size={16} /></button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={styles.toolbarBtn} title="Insert Divider (HR)"><Minus size={16} /></button>
            {title !== "ABSTRACT" && (
              <button onClick={() => (editor.chain().focus() as any).insertTwoColumns().run()} className={styles.toolbarBtn} title="Two Column Layout"><Columns size={16} /></button>
            )}
          </div>

          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "2px", marginRight: "8px", borderRight: "1px solid #e2e8f0", paddingRight: "8px" }}>
            <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={styles.toolbarBtn} title="Insert Table (3x3)"><Table2 size={16} /></button>
            {editor.isActive('table') && (
              <>
                <button onClick={() => editor.chain().focus().addColumnBefore().run()} className={styles.toolbarBtn} title="Add Column Before"><ArrowRightToLine size={14} style={{ transform: "rotate(180deg)" }} /></button>
                <button onClick={() => editor.chain().focus().addColumnAfter().run()} className={styles.toolbarBtn} title="Add Column After"><ArrowRightToLine size={14} /></button>
                <button onClick={() => editor.chain().focus().addRowBefore().run()} className={styles.toolbarBtn} title="Add Row Before"><ArrowDownToLine size={14} style={{ transform: "rotate(180deg)" }} /></button>
                <button onClick={() => editor.chain().focus().addRowAfter().run()} className={styles.toolbarBtn} title="Add Row After"><ArrowDownToLine size={14} /></button>
                <button onClick={() => editor.chain().focus().deleteTable().run()} className={styles.toolbarBtn} title="Delete Table"><Eraser size={14} color="#f87171" /></button>
              </>
            )}
          </div>

          <div className={styles.toolbarGroup} style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className={styles.toolbarBtn} title="Toggle Fullscreen">
              {isFullscreen ? <Minimize size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: "white", padding: "20px", minHeight: "150px" }}>
           <style>{editorStyles}</style>
           <EditorContent editor={editor} />
        </div>
    </div>
  );
}
