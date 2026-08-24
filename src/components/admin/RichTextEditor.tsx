"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle, Color, FontSize } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImagePlus,
  Video as VideoIcon,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";

const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, { controls: "true", style: "max-width:100%;border-radius:0.75rem;" }),
    ];
  },
});

const FONT_SIZES = [
  { label: "Küçük", value: "14px" },
  { label: "Normal", value: "" },
  { label: "Büyük", value: "20px" },
  { label: "Başlık Boyutu", value: "28px" },
];

const COLORS = ["#2e2620", "#5c2a3a", "#c6a15b", "#c98a9e", "#0e9488", "#b91c1c"];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-charcoal/70 hover:bg-rose-pale hover:text-burgundy disabled:opacity-40 cursor-pointer ${
        active ? "bg-rose-pale text-burgundy" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (html: string) => void;
  label?: string;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      TextStyle,
      Color,
      FontSize,
      Image.configure({ HTMLAttributes: { style: "max-width:100%;border-radius:0.75rem;" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      VideoNode,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "blog-content min-h-[220px] rounded-b-xl bg-ivory px-4 py-3 text-sm leading-relaxed focus:outline-none",
      },
    },
  });

  const uploadFile = async (file: File, type: "image" | "video") => {
    setUploading(type);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/upload?type=${type}`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Yükleme başarısız.");
        return;
      }
      if (type === "image") {
        editor?.chain().focus().setImage({ src: data.url }).run();
      } else {
        editor?.chain().focus().insertContent({ type: "video", attrs: { src: data.url } }).run();
      }
    } catch {
      setUploadError("Yükleme sırasında hata oluştu.");
    } finally {
      setUploading(null);
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Bağlantı URL'si", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div>
      {label && <p className="mb-1.5 text-sm font-medium text-charcoal/80">{label}</p>}
      <div className="overflow-hidden rounded-xl border border-burgundy/15 bg-ivory">
        <div className="flex flex-wrap items-center gap-1 border-b border-burgundy/10 bg-cream/60 px-2 py-1.5">
          <ToolbarButton title="Kalın" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton title="İtalik" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Üstü Çizili"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Alt Başlık"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Küçük Başlık"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Madde Listesi"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Numaralı Liste"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} />
          </ToolbarButton>
          <ToolbarButton
            title="Alıntı"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={15} />
          </ToolbarButton>
          <ToolbarButton title="Bağlantı" active={editor.isActive("link")} onClick={setLink}>
            <LinkIcon size={15} />
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-burgundy/10" />

          <select
            onChange={(e) => {
              const size = e.target.value;
              if (size) {
                editor.chain().focus().setFontSize(size).run();
              } else {
                editor.chain().focus().unsetFontSize().run();
              }
            }}
            defaultValue=""
            className="h-8 rounded-lg border border-burgundy/15 bg-ivory px-1.5 text-xs focus:border-burgundy focus:outline-none cursor-pointer"
            title="Yazı Boyutu"
          >
            {FONT_SIZES.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 px-1" title="Yazı Rengi">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => editor.chain().focus().setColor(c).run()}
                className="h-5 w-5 shrink-0 rounded-full border border-black/10 cursor-pointer"
                style={{ backgroundColor: c }}
              />
            ))}
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="text-[10px] text-charcoal/50 hover:text-burgundy cursor-pointer"
              title="Rengi Kaldır"
            >
              Sıfırla
            </button>
          </div>

          <div className="mx-1 h-5 w-px bg-burgundy/10" />

          <ToolbarButton title="Görsel Ekle" disabled={uploading === "image"} onClick={() => imageInputRef.current?.click()}>
            {uploading === "image" ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          </ToolbarButton>
          <ToolbarButton title="Video Ekle" disabled={uploading === "video"} onClick={() => videoInputRef.current?.click()}>
            {uploading === "video" ? <Loader2 size={15} className="animate-spin" /> : <VideoIcon size={15} />}
          </ToolbarButton>

          <div className="mx-1 h-5 w-px bg-burgundy/10" />

          <ToolbarButton title="Geri Al" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={15} />
          </ToolbarButton>
          <ToolbarButton title="Yinele" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={15} />
          </ToolbarButton>
        </div>

        <EditorContent editor={editor} />
      </div>
      {uploadError && <p className="mt-1 text-xs text-red-700">{uploadError}</p>}

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file, "image");
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file, "video");
          e.target.value = "";
        }}
      />
    </div>
  );
}
