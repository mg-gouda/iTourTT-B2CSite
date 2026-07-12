'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
  Quote, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Code,
} from 'lucide-react';
import { cn } from './ui';

// Full WP-style rich editor. Emits HTML via onChange. Image insert accepts a URL
// (wire the media library's upload URL from the parent).
export function RichEditor({
  value, onChange, onRequestImage, placeholder = 'Write something…',
}: {
  value: string;
  onChange: (html: string) => void;
  onRequestImage?: () => Promise<string | null>;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener', class: 'text-sky-400 underline' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[320px] px-4 py-3 focus:outline-none prose-headings:font-semibold prose-a:text-sky-400',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep external value changes in sync (e.g. loading an existing post).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const Btn = ({
    on, active, children, title,
  }: { on: () => void; active?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      title={title}
      onClick={on}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition',
        active ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
      )}
    >
      {children}
    </button>
  );

  const addLink = () => {
    const url = window.prompt('Link URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };
  const addImage = async () => {
    let url: string | null = null;
    if (onRequestImage) url = await onRequestImage();
    else url = window.prompt('Image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-800 bg-slate-900/80 px-2 py-1.5">
        <Btn title="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}><Bold className="h-4 w-4" /></Btn>
        <Btn title="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}><Italic className="h-4 w-4" /></Btn>
        <Btn title="Strike" on={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}><Strikethrough className="h-4 w-4" /></Btn>
        <span className="mx-1 h-5 w-px bg-slate-800" />
        <Btn title="Heading 2" on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 className="h-4 w-4" /></Btn>
        <Btn title="Heading 3" on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 className="h-4 w-4" /></Btn>
        <Btn title="Bullet list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="h-4 w-4" /></Btn>
        <Btn title="Ordered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn title="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote className="h-4 w-4" /></Btn>
        <Btn title="Code block" on={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}><Code className="h-4 w-4" /></Btn>
        <span className="mx-1 h-5 w-px bg-slate-800" />
        <Btn title="Link" on={addLink} active={editor.isActive('link')}><LinkIcon className="h-4 w-4" /></Btn>
        <Btn title="Image" on={addImage}><ImageIcon className="h-4 w-4" /></Btn>
        <span className="mx-1 h-5 w-px bg-slate-800" />
        <Btn title="Undo" on={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></Btn>
        <Btn title="Redo" on={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
