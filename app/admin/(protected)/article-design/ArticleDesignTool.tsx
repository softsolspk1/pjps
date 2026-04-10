"use client";

import { useRef, useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Paragraph from "@tiptap/extension-paragraph";
import { useReactToPrint } from "react-to-print";
import { Printer, Bold, Italic, Heading1, Heading2, Heading3, Minus, Image as ImageIcon, Maximize2, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Minimize, Maximize, Columns, Loader2 } from "lucide-react";
import styles from "./article-design.module.css";

const editorStyles = `
  .tiptap-manuscript {
     text-align: justify;
     font-family: 'Times New Roman', Times, serif;
     font-size: 11pt;
     line-height: 1.5;
     min-height: 800px;
     width: 100%;
     margin: 0 auto;
     padding: 20px;
     box-sizing: border-box;
  }
  
  .tiptap-manuscript:focus,
  .tiptap-manuscript:active {
    outline: none;
  }
  
  .tiptap-manuscript img {
     aspect-ratio: 1 / 1 !important;
     object-fit: contain !important;
     width: 100% !important;
     max-width: 50vw !important;
     background: transparent !important;
     padding: 0 !important;
     border: none !important;
     box-shadow: none !important;
     margin: 20px auto !important;
  }
  
  .ProseMirror, .ProseMirror-focused {
     outline: none !important;
     border: none !important;
     box-shadow: none !important;
  }

  .column-layout {
     display: grid;
     grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
     gap: 3rem;
     margin: 1.5rem 0;
  }
  
  .column-block {
     min-height: 2rem;
     border: 1px dashed #cbd5e1;
     padding: 1rem;
     border-radius: 6px;
  }
  
  .tiptap-manuscript > p, .tiptap-manuscript > ul, .tiptap-manuscript > ol {
     break-inside: avoid-column;
  }
  
  .tiptap-manuscript .full-width-block {
     border-left: 3px solid #3b82f6;
     padding-left: 14px;
     background: rgba(59, 130, 246, 0.02);
  }
  
  .tiptap-manuscript h1 { margin-top: 2rem; margin-bottom: 1rem; font-size: 24px; line-height: 1.2; font-weight: bold; text-align: center; text-transform: uppercase; }
  .tiptap-manuscript h2 { margin-top: 2rem; margin-bottom: 0.8rem; font-size: 18px; font-weight: bold; text-transform: uppercase; }
  .tiptap-manuscript h3 { margin-top: 1rem; margin-bottom: 0.5rem; font-size: 16px; font-weight: bold; font-style: italic; }
  .tiptap-manuscript p { margin-bottom: 1rem; }
  .tiptap-manuscript hr { margin: 2rem 0; border: 0; border-top: 2px solid black; }
  .tiptap-manuscript img { max-width: 100%; height: auto; border: 1px solid #eee; margin: 1.5rem 0; display: block; }
  
  .tiptap-manuscript ul { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
  .tiptap-manuscript ol { margin-left: 1.5rem; margin-bottom: 1rem; list-style-type: decimal; }

  .tiptap-manuscript p.is-editor-empty:first-child::before {
    color: #cbd5e1;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  @media print { 
     body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
     .print-container { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: none !important; display: block !important; }
     .tiptap-manuscript { width: 100% !important; padding: 0 !important; margin: 0 !important; border: none !important; box-shadow: none !important; font-size: 11pt !important; line-height: 1.5 !important; }
     .tiptap-manuscript > *:first-child { margin-top: 0 !important; }
     .column-block { display: block !important; }
  }
`;

const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      fullWidth: {
        default: false,
        parseHTML: element => element.classList.contains('full-width-block'),
        renderHTML: attributes => {
          if (!attributes.fullWidth) return {};
          return { class: 'full-width-block' };
        },
      },
    };
  },
});

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fullWidth: {
        default: false,
        parseHTML: element => element.classList.contains('full-width-block'),
        renderHTML: attributes => {
          if (!attributes.fullWidth) return {};
          return { class: 'full-width-block' };
        },
      },
    };
  },
});

const ColumnBlock = Node.create({
  name: 'columnBlock',
  content: 'block+',
  isolating: true,
  parseHTML() {
    return [{ tag: 'div.column-block' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'column-block' }), 0];
  },
});

const ColumnLayout = Node.create({
  name: 'columnLayout',
  group: 'block',
  content: 'columnBlock columnBlock',
  parseHTML() {
    return [{ tag: 'div.column-layout' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'column-layout' }), 0];
  },
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

export default function ArticleDesignTool() {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "PJPS_Formatted_Manuscript",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ paragraph: false }),
      CustomParagraph,
      CustomImage,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
      ColumnLayout,
      ColumnBlock,
    ],
    content: `
      <h1>MANUSCRIPT TITLE</h1>
      <p>Start writing your manuscript here...</p>
    `,
    editorProps: {
      attributes: {
        className: 'tiptap-manuscript',
      },
      handlePaste: (view, event, slice) => {
        const items = event.clipboardData?.items;
        if (items) {
          const filesToUpload: File[] = [];
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
              const file = items[i].getAsFile();
              if (file) filesToUpload.push(file);
            }
          }
          if (filesToUpload.length > 0) {
            uploadImageNative(filesToUpload);
            return true;
          }
        }
        return false;
      },
    },
  });

  if (!isMounted) return null;

  const uploadImageNative = async (files: File[]) => {
    setIsUploading(true);
    let successCount = 0;

    try {
      await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          
          const data = await res.json();
          if (data.success && editor) {
            const squareUrl = data.url.replace('/upload/', '/upload/c_fill,ar_1.0,w_800/');
            editor.chain().focus().setImage({ src: squareUrl }).run();
            successCount++;
          } else {
            console.error("Image upload failed: " + data.error);
          }
        })
      );
      if (successCount < files.length) {
        alert(`Finished: ${successCount}/${files.length} images uploaded successfully.`);
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred during multi-upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImageNative(Array.from(e.target.files));
    }
  };

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden" style={{display: 'none'}} />
      <div className={styles.container} style={{ maxWidth: '100%', padding: 0, boxShadow: 'none', border: 'none' }}>
        <div className={`${styles.editorContainerWrapper} ${isFullscreen ? styles.editorContainerFullscreen : ''} relative`}>
          {isUploading && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-sm rounded-b-xl">
              <div className="bg-white px-8 py-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,45,94,0.3)] border border-blue-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                 <Loader2 className="animate-spin text-blue-600" size={36} />
                 <span className="text-blue-950 font-black tracking-tight text-lg">Uploading to Cloudinary...</span>
              </div>
            </div>
          )}
          {editor && (
            <div className={styles.toolbar} style={{ justifyContent: 'center' }}>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 1 }) ? styles.toolbarBtnActive : ''}`} title="Main Title"><Heading1 size={18} /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.toolbarBtnActive : ''}`} title="Section Heading"><Heading2 size={18} /></button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 3 }) ? styles.toolbarBtnActive : ''}`} title="Subsection"><Heading3 size={18} /></button>
              
              <div className={styles.toolbarDivider}></div>
              
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.toolbarBtnActive : ''}`}><Bold size={18} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.toolbarBtnActive : ''}`}><Italic size={18} /></button>
              
              <div className={styles.toolbarDivider}></div>

              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'left' }) ? styles.toolbarBtnActive : ''}`} title="Align Left"><AlignLeft size={18} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'center' }) ? styles.toolbarBtnActive : ''}`} title="Align Center"><AlignCenter size={18} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'right' }) ? styles.toolbarBtnActive : ''}`} title="Align Right"><AlignRight size={18} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: 'justify' }) ? styles.toolbarBtnActive : ''}`} title="Justify Text"><AlignJustify size={18} /></button>

              <div className={styles.toolbarDivider}></div>

              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${styles.toolbarBtn} ${editor.isActive('bulletList') ? styles.toolbarBtnActive : ''}`}><List size={18} /></button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${styles.toolbarBtn} ${editor.isActive('orderedList') ? styles.toolbarBtnActive : ''}`}><ListOrdered size={18} /></button>

              <div className={styles.toolbarDivider}></div>

              <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={styles.toolbarBtn} title="Insert Divider"><Minus size={18} /></button>
              <button 
                  onClick={triggerImagePicker} 
                  className={styles.toolbarBtn} 
                  title="Upload Image"
                  disabled={isUploading}
              >
                 {isUploading ? <Loader2 className="animate-spin text-blue-600" size={18} /> : <ImageIcon size={18} />}
              </button>
              
              <div className={styles.toolbarDivider}></div>

              <button 
                  onClick={() => (editor.chain().focus() as any).insertTwoColumns().run()} 
                  className={styles.toolbarBtn}
                  title="Insert Expliclt 2-Column Block"
              >
                <Columns size={18} />
              </button>

              <div className={styles.toolbarDivider}></div>

              <button onClick={() => handlePrint()} className={`${styles.toolbarBtn} text-white bg-blue-600 hover:bg-blue-700`} style={{ padding: '6px 16px', borderRadius: '4px', gap: '8px' }}>
                <Printer size={16} /> Print PDF
              </button>

              <button 
                  onClick={() => setIsFullscreen(!isFullscreen)} 
                  className={`${styles.toolbarBtn} ${isFullscreen ? styles.toolbarBtnActive : ''}`}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize2 size={18} />}
              </button>

            </div>
          )}
          <div ref={printRef} className={`print-container ${styles.tiptapEditorBox}`}>
            <style>{editorStyles}</style>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </>
  );
}
