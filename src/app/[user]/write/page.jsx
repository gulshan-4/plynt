"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { FaMagic } from "react-icons/fa";
import { useCategories } from "@/app/lib/hooks";
import toast from "react-hot-toast";

// Custom Node for Note
const NoteNode = Node.create({
  name: 'note',
  group: 'block',
  content: 'inline*',
  addNodeView() {
    return ReactNodeViewRenderer(NoteViewComponent);
  },
});

const NoteViewComponent = (props) => {
  return (
    <NodeViewWrapper className="my-4">
      <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded flex items-start gap-2">
        <span contentEditable={false} className="font-bold">Note:</span>
        <NodeViewContent className="flex-1" />
      </div>
    </NodeViewWrapper>
  );
};

// Custom Node for Tip
const TipNode = Node.create({
  name: 'tip',
  group: 'block',
  content: 'inline*',
  addNodeView() {
    return ReactNodeViewRenderer(TipViewComponent);
  },
});

const TipViewComponent = (props) => {
  return (
    <NodeViewWrapper className="my-4">
      <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-start gap-2">
        <span contentEditable={false} className="font-bold">Tip:</span>
        <NodeViewContent className="flex-1" />
      </div>
    </NodeViewWrapper>
  );
};

// Custom Node for Warning
const WarningNode = Node.create({
  name: 'warning',
  group: 'block',
  content: 'inline*',
  addNodeView() {
    return ReactNodeViewRenderer(WarningViewComponent);
  },
});

const WarningViewComponent = (props) => {
  return (
    <NodeViewWrapper className="my-4">
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded flex items-start gap-2">
        <span contentEditable={false} className="font-bold">Warning:</span>
        <NodeViewContent className="flex-1" />
      </div>
    </NodeViewWrapper>
  );
};

// Custom Node for Info
const InfoNode = Node.create({
  name: 'info',
  group: 'block',
  content: 'inline*',
  addNodeView() {
    return ReactNodeViewRenderer(InfoViewComponent);
  },
});

const InfoViewComponent = (props) => {
  return (
    <NodeViewWrapper className="my-4">
      <div className="p-4 bg-cyan-50 border-l-4 border-cyan-500 text-cyan-700 rounded flex items-start gap-2">
        <span contentEditable={false} className="font-bold">Info:</span>
        <NodeViewContent className="flex-1" />
      </div>
    </NodeViewWrapper>
  );
};

// Utility: slugify
function makeSlug(s) {
  return s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[’'“”"·/_,:;?#!@$%^&*()+=[\]{}|\\<>~`]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Toolbar button — uses onMouseDown + preventDefault to keep editor focus
function ToolbarButton({ onClick, label, isActive = false }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();   // prevent editor from losing focus
        onClick?.();
      }}
      className={`
        px-3 py-1.5 rounded-md text-sm font-medium select-none
        transition-all duration-150 ease-in-out
        ${isActive
          ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300 scale-[1.04] border border-blue-600"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 active:scale-95"
        }
      `}
    >
      {label}
    </button>
  );
}

// Simple debounce hook
function useDebounce(callback, delay) {
  const timer = useRef();
  return useCallback(
    (...args) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

// Function to calculate read time
function getReadTime(html) {
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200); // Assuming 200 words per minute
}

const LOCAL_DRAFT_KEY = "draft:article";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [cover, setCover] = useState(null); // { file, url }
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [isPreview, setIsPreview] = useState(false);
  const [html, setHtml] = useState("<p>Start writing your article here...</p>");
  const [saving, setSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const titleRef = useRef(null);

  const [user, setUser] = useState(null);

  // Force toolbar re-render when editor state changes (cursor move, formatting toggle)
  const [, forceUpdate] = useState(0);

  // Debounced html setter
  const debouncedSetHtml = useDebounce(setHtml, 700);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      NoteNode,
      TipNode,
      WarningNode,
      InfoNode,
    ],
    content: html,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      debouncedSetHtml(editor.getHTML());
    },
    onTransaction: () => {
      // Force re-render so toolbar active states update instantly
      forceUpdate(n => n + 1);
    },
  });
  
  useEffect(() => {
    const fetchUserAndPost = async () => {
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Check for edit parameter
        const searchParams = new URLSearchParams(window.location.search);
        const editSlug = searchParams.get('edit');
        if (editSlug) {
          const { data: post } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', editSlug)
            .eq('author_id', session.user.id)
            .single();
            
          if (post) {
            setEditingPostId(post.id);
            setTitle(post.title);
            setSlug(post.slug);
            setHtml(post.html);
            setTags(post.tags?.join(', ') || "");
            if (post.category_id) setCategoryId(post.category_id);
            if (post.cover_image) setCover({ file: null, url: post.cover_image });
            if (editor) {
              editor.commands.setContent(post.html);
            }
          }
        }
      }
    };
    fetchUserAndPost();
  }, [editor]);

  // Dummy data for preview meta
  const dummyUserName = user?.user_metadata?.full_name || user?.user_metadata?.username || "Your Name";
  const dummyUserImage = user?.user_metadata?.avatar_url || "/user.webp";
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const readTime = getReadTime(html);

  // Fetch categories using our hook (which includes a fallback if the DB is empty)
  const { categories: fetchedCategories } = useCategories();

  useEffect(() => {
    if (fetchedCategories && fetchedCategories.length > 0) {
      setCategories(fetchedCategories);
      if (!categoryId) setCategoryId(fetchedCategories[0].id);
    }
  }, [fetchedCategories, categoryId]);

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('edit')) return; // Do not restore local draft if editing

      const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setTitle(d.title || "");
        setSlug(d.slug || "");
        setHtml(d.html || "<p>Start writing your article here...</p>");
        setTags(d.tags || "");
        if (d.coverUrl) setCover({ file: null, url: d.coverUrl });
        if (editor) {
          editor.commands.setContent(d.html || "<p>Start writing your article here...</p>");
        }
      }
    } catch (e) { }
  }, [editor]);

  useEffect(() => {
    if (editingPostId) return; // Do not auto-save to local draft if editing an existing post
    
    const id = setTimeout(() => {
      const draft = {
        title,
        slug,
        html,
        tags,
        coverUrl: cover?.url,
      };
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(draft));
      setSaving(true);
      setTimeout(() => setSaving(false), 800);
    }, 2000);
    return () => clearTimeout(id);
  }, [title, slug, html, tags, cover, editingPostId]);

  // Auto-resize title textarea
  useEffect(() => {
    const ta = titleRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  }, [title]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    const ta = titleRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setCover({ file, url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleImagePicker = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (editor) {
        editor.chain().focus().setImage({ src: reader.result }).run();
      }
    };
    reader.readAsDataURL(file);
    e.currentTarget.value = "";
  };

  const generateSlug = () => {
    if (!title.trim()) {
      toast.error("Please add a title to generate slug from.");
      return;
    }
    const s = makeSlug(title);
    setSlug(s);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error("Please add a title before publishing.");
      return;
    }
    // Sync latest html before publish
    if (editor && !isPreview) {
      setHtml(editor.getHTML());
    }
    setIsPublishing(true);
    const loadingToast = toast.loading("Publishing article...");

    const formData = new FormData();
    if (editingPostId) formData.append("post_id", editingPostId);
    formData.append("title", title);
    formData.append("slug", slug || makeSlug(title));
    formData.append("html", html);
    // basic text extraction for 'content'
    const contentText = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    formData.append("content", contentText);
    formData.append("tags", tags);
    if (categoryId) formData.append("category_id", categoryId);
    if (cover?.url) formData.append("cover_image", cover.url); // Ideally we upload to storage first

    const { publishPost } = await import('@/app/actions/posts');
    const res = await publishPost(formData);

    setIsPublishing(false);
    if (res?.error) {
      toast.error(res.error, { id: loadingToast });
    } else {
      setPublished(true);
      localStorage.removeItem(LOCAL_DRAFT_KEY);
      toast.success(editingPostId ? "Updated successfully!" : "Published successfully!", { id: loadingToast });
      // Redirect to the post page
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        window.location.href = `/@${user.user_metadata?.username || user.id}/${res.post.slug}`;
      }
    }
  };

  const clearDraft = () => {
    if (!confirm("Clear saved draft?")) return;
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    setTitle("");
    setSlug("");
    setTags("");
    setCover(null);
    setHtml("<p>Start writing your article here...</p>");
    if (editor) {
      editor.commands.setContent("<p>Start writing your article here...</p>");
    }
  };

  // Updated preview toggle to sync html before switching
  const handleTogglePreview = () => {
    if (isPreview) {
      setIsPreview(false);
    } else {
      if (editor) {
        setHtml(editor.getHTML());
      }
      setIsPreview(true);
    }
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row justify-center mt-6 lg:mt-10 mb-16 px-4 sm:px-6 lg:px-12 gap-8 lg:gap-10">
      {/* Main Write Area */}
      <main className="w-full lg:w-3/5 bg-white rounded-xl shadow-md overflow-hidden">
        {/* Cover uploader/preview */}
        <div className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[380px] bg-gray-50 grid place-items-center">
          {cover?.url ? (
            <div className="relative w-full h-full">
              <Image src={cover.url} alt="cover" fill className="object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                <label className="bg-white/90 px-3 py-2 rounded-lg shadow-sm text-sm cursor-pointer border border-gray-100">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
                <button
                  className="bg-white/90 px-3 py-2 rounded-lg shadow-sm text-sm border border-gray-100"
                  onClick={() => setCover(null)}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center px-4">
              <p className="text-gray-500 mb-3">No cover image</p>
              <label className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-medium cursor-pointer">
                Upload cover
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
        <div className="p-5 sm:p-6 md:p-8">
          {/* Title + actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-4">
            <textarea
              ref={titleRef}
              placeholder="Title Here..."
              value={title}
              onChange={handleTitleChange}
              className="w-full text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-extrabold mb-3 sm:mb-0 focus:outline-none resize-none overflow-hidden leading-tight"
              style={{ color: '#37352f', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'" }}
              rows={1}
            />
          </div>
          {/* Meta info (placeholder) */}
          <div className="flex flex-wrap items-center gap-3 text-sm sm:text-xs text-gray-600 mb-5 pt-1">
            <div className="flex items-center gap-1">
              <Image
                width={22}
                height={22}
                src={dummyUserImage}
                alt={dummyUserName}
                className="rounded-full"
              />
              <span>{dummyUserName}</span>
            </div>
            <span>•</span>
            <span>🗓️ Draft</span>
            <span>•</span>
            <span>⏱️ {readTime} min read</span>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
              <span
                key={tag}
                className="text-[#4f4f4f] hover:text-black transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
          {/* Writing tools */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-4 flex flex-wrap items-center gap-2">
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBold().run()}
              label="Bold"
              isActive={editor?.isActive('bold')}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              label="Italic"
              isActive={editor?.isActive('italic')}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              label="Strike"
              isActive={editor?.isActive('strike')}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              label="H2"
              isActive={editor?.isActive('heading', { level: 2 })}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              label="H3"
              isActive={editor?.isActive('heading', { level: 3 })}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              label="UL"
              isActive={editor?.isActive('bulletList')}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              label="OL"
              isActive={editor?.isActive('orderedList')}
            />
            <ToolbarButton
              onClick={() => {
                const url = prompt('Enter link URL');
                if (url) editor?.chain().focus().setLink({ href: url }).run();
              }}
              label="Link"
              isActive={editor?.isActive('link')}
            />
            <label className="px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition-all duration-150 select-none">
              Image
              <input type="file" accept="image/*" onChange={handleImagePicker} className="hidden" />
            </label>
            <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
            <ToolbarButton
              onClick={() => editor?.chain().focus().insertContent({ type: 'note', content: [{ type: 'text', text: 'Your note here' }] }).run()}
              label="Note"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().insertContent({ type: 'tip', content: [{ type: 'text', text: 'Your tip here' }] }).run()}
              label="Tip"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().insertContent({ type: 'warning', content: [{ type: 'text', text: 'Your warning here' }] }).run()}
              label="Warning"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().insertContent({ type: 'info', content: [{ type: 'text', text: 'Your info here' }] }).run()}
              label="Info"
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              label="Blockquote"
              isActive={editor?.isActive('blockquote')}
            />
            <div className="w-[1px] h-6 bg-gray-300 mx-2"></div>
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleCode().run()}
              label="Code"
              isActive={editor?.isActive('code')}
            />
            <ToolbarButton
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
              label="Code Block"
              isActive={editor?.isActive('codeBlock')}
            />
          </div>
          {/* Editor or Preview Content */}
          <div className="prose prose-base sm:prose-lg max-w-none text-gray-800 leading-relaxed min-h-[300px]">
            {isPreview ? (
              <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              <EditorContent editor={editor} />
            )}
          </div>
          {/* Status */}
          <div className="mt-6 text-sm text-gray-500">
            {published ? "Published ✓" : "Not published"} • {saving ? "Saving..." : "Auto-saved"}
          </div>
        </div>
      </main>
      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 space-y-6 order-first lg:order-last lg:sticky lg:top-20 lg:self-start">
        {/* Article settings */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-lg font-bold mb-2">Article settings</h3>
          <label className="text-xs text-gray-500">Slug (URL)</label>
          <div className="flex items-center gap-2 mt-1 mb-3">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug (auto from title)"
              className="flex-1 p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={generateSlug}
              title="Generate from title"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition text-sm"
            >
              <FaMagic />
            </button>
          </div>
          <label className="text-xs text-gray-500">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="tags, comma separated (e.g. aws, terraform)"
            className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 mb-3"
          />

          <label className="text-xs text-gray-500">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-blue-500 mb-3"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <hr className="my-4 border-gray-100" />

          <div className="flex flex-col gap-2">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-2.5 rounded-md text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingPostId ? "Updating..." : "Publishing..."}
                </>
              ) : (editingPostId ? "Update Article" : "Publish")}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleTogglePreview}
                className="w-full py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 transition text-gray-700 font-medium"
              >
                {isPreview ? "Edit Mode" : "Preview"}
              </button>
              <button
                onClick={() => {
                  if (editingPostId) {
                    window.location.href = `/@${user?.user_metadata?.username || user?.id}/${slug}`;
                  } else {
                    clearDraft();
                  }
                }}
                className="w-full py-2 rounded-md text-sm border border-gray-200 hover:bg-gray-50 transition text-red-600 font-medium hover:border-red-200 hover:bg-red-50"
              >
                {editingPostId ? "Cancel Edit" : "Clear Draft"}
              </button>
            </div>
          </div>
        </div>
        {/* Article Mini Preview */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h3 className="text-lg font-bold mb-2">Article preview</h3>
          <div className="text-sm text-gray-600">
            <p className="font-semibold">{title || "Untitled"}</p>
            <p className="text-xs text-gray-400">{slug || "slug not set"}</p>
            <p className="text-xs text-gray-400">{tags || "no tags yet"}</p>
            <div className="mt-3">
              {cover?.url ? (
                <div className="w-full h-28 relative rounded-md overflow-hidden">
                  <Image src={cover.url} alt="cover" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-full h-28 bg-gray-100 rounded-md grid place-items-center text-gray-400">No cover</div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}