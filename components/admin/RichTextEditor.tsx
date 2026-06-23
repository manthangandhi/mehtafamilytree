'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Heading2, Heading3, Undo, Redo, Quote, Eraser, X } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Start writing your cultural story...', className = '' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80',
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[320px] px-4 py-4 text-[15px] leading-[1.7] selection:bg-primary/10',
      },
    },
  });

  // Update editor when external value changes (e.g. after async fetch in edit form)
  useEffect(() => {
    if (editor && value != null) {
      const currentContent = editor.getHTML();
      if (value !== currentContent) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="min-h-[320px] rounded-xl border border-border bg-surface animate-pulse" />;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl || 'https://');
    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        isActive 
          ? 'bg-primary text-white shadow-sm' 
          : 'text-muted hover:bg-surface-hover hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className={`border border-border rounded-2xl overflow-hidden bg-white shadow-sm ${className}`}>
      {/* Rich Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-3 py-2">
        <div className="flex items-center gap-1 pr-2 border-r border-border/60">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (⌘B)"
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (⌘I)"
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (⌘U)"
          >
            <UnderlineIcon size={16} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border/60">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={16} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border/60">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote / Blockquote"
          >
            <Quote size={16} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border/60">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify size={16} />
          </ToolbarButton>
        </div>

        <div className="flex items-center gap-1 px-2 border-r border-border/60">
          <ToolbarButton
            onClick={toggleLink}
            isActive={editor.isActive('link')}
            title="Insert Link"
          >
            <LinkIcon size={16} />
          </ToolbarButton>
        </div>

        {/* Color and Remove Formatting */}
        <div className="flex items-center gap-1 px-2 border-r border-border/60">
          <input
            type="color"
            title="Text color"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().run();
            }}
            onChange={(e) => {
              const color = e.target.value;
              editor.chain().focus().setColor(color).run();
              // Force a view update so the color appears immediately in the editor
              setTimeout(() => {
                if (editor) {
                  editor.view.dispatch(editor.state.tr);
                  editor.view.focus();
                }
              }, 0);
            }}
            className="w-6 h-6 p-0 border border-border rounded cursor-pointer bg-transparent"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetColor().run()}
            title="Remove text color"
          >
            <Eraser size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Remove all formatting"
          >
            <X size={16} />
          </ToolbarButton>
        </div>

        <div className="ml-auto flex items-center gap-1 pl-2 border-l border-border/60">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white">
        <style>{`
          .tiptap {
            color: #111827; /* default dark text for the editor */
          }
          .tiptap h2 { font-size: 1.35rem; font-weight: 700; margin: 1.25rem 0 0.5rem; font-family: var(--font-serif, serif); }
          .tiptap h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.4rem; }
          .tiptap ul, .tiptap ol { padding-left: 1.35rem; margin: 0.5rem 0; }
          .tiptap li { margin: 0.2rem 0; }
          .tiptap p { margin: 0.45rem 0; }
          .tiptap a { color: #0B2E24; text-decoration: underline; }
          /* Inline styles for color (from setColor) will be respected by the browser */
        `}</style>
        <EditorContent editor={editor} />
      </div>

      <div className="border-t border-border/60 bg-surface px-4 py-2 text-[11px] text-muted">
        Rich text editor • Use the toolbar for formatting. Content will appear formatted on the public site.
      </div>
    </div>
  );
}
