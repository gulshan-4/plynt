"use client";
import { notFound } from "next/navigation";
import TopPosts from "@/app/components/TopPosts";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { TbMessageCirclePlus } from "react-icons/tb";
import { AiOutlineRetweet } from "react-icons/ai";
import { BiReply } from "react-icons/bi";
import { HiPaperAirplane, HiOutlineDotsHorizontal } from "react-icons/hi";
import { useArticle } from "@/app/lib/hooks";
import { toast } from "react-hot-toast";

function CommentSection({ articleId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [replyInput, setReplyInput] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState("/user.webp");

  const totalCommentsCount = comments.reduce((total, c) => total + 1 + c.replies.length, 0);

  React.useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(totalCommentsCount);
    }
  }, [totalCommentsCount]);

  React.useEffect(() => {
    import('@/utils/supabase/client').then(async ({ createClient }) => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.from('comments')
        .select(`
          id, content, created_at, parent_id, likes,
          profiles!comments_author_id_fkey ( username, avatar_url )
        `)
        .eq('post_id', articleId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
      }

      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single();
        if (profile?.avatar_url) {
          setCurrentUserAvatar(profile.avatar_url);
        }
      }

      let userLikes = [];
      if (session?.user && data?.length) {
        const commentIds = data.map(c => c.id);
        const { data: likesData } = await supabase.from('comment_likes')
          .select('comment_id')
          .eq('user_id', session.user.id)
          .in('comment_id', commentIds);
        userLikes = likesData?.map(l => l.comment_id) || [];
      }

      if (data) {
        const commentsMap = new Map();
        const topLevel = [];

        data.forEach(c => {
          const formatted = {
            id: c.id,
            name: c.profiles?.username || 'Unknown',
            avatar: c.profiles?.avatar_url || '/user.webp',
            text: c.content,
            date: new Date(c.created_at).toLocaleDateString(),
            likes: c.likes || 0,
            hasLiked: userLikes.includes(c.id),
            replies: []
          };
          commentsMap.set(c.id, formatted);
        });

        data.forEach(c => {
          if (c.parent_id) {
            const parent = commentsMap.get(c.parent_id);
            if (parent) parent.replies.push(commentsMap.get(c.id));
          } else {
            topLevel.push(commentsMap.get(c.id));
          }
        });

        setComments(topLevel.reverse());
      }
    });
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !articleId) return;
    const currentInput = input;
    setInput("");

    // Optimistic UI update
    const tempId = Date.now();
    setComments([{
      id: tempId,
      name: "You",
      avatar: currentUserAvatar,
      text: currentInput,
      date: "Just now",
      likes: 0,
      hasLiked: false,
      replies: [],
    }, ...comments]);

    const { addComment } = await import('@/app/actions/posts');
    const res = await addComment(articleId, currentInput);
    if (res.error) {
      alert(res.error);
      setComments(prev => prev.filter(c => c.id !== tempId)); // revert
    } else {
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, id: res.comment.id } : c));
    }
  };

  const handleLike = async (commentId, replyId = null) => {
    const targetId = replyId || commentId;

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          if (replyId) {
            const updatedReplies = c.replies.map((r) =>
              r.id === replyId ? { ...r, likes: r.hasLiked ? r.likes - 1 : r.likes + 1, hasLiked: !r.hasLiked } : r
            );
            return { ...c, replies: updatedReplies };
          }
          return { ...c, likes: c.hasLiked ? c.likes - 1 : c.likes + 1, hasLiked: !c.hasLiked };
        }
        return c;
      })
    );

    const { toggleCommentLike } = await import('@/app/actions/posts');
    await toggleCommentLike(targetId);
  };

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!replyInput[commentId]?.trim()) return;
    const currentReply = replyInput[commentId];

    const tempId = Date.now();
    const newReply = {
      id: tempId,
      name: "You",
      avatar: currentUserAvatar,
      text: currentReply,
      date: "Just now",
      likes: 0,
      hasLiked: false,
    };

    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c
      )
    );
    setReplyInput({ ...replyInput, [commentId]: "" });
    setReplyingTo(null);

    const { addReply } = await import('@/app/actions/posts');
    const res = await addReply(articleId, commentId, currentReply);
    if (res.error) {
      alert(res.error);
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== tempId) } : c
        )
      );
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, replies: c.replies.map(r => r.id === tempId ? { ...r, id: res.comment.id } : r) } : c
        )
      );
    }
  };

  // Helper to render text with @mentions highlighted
  const renderTextWithMentions = (text) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('@') && word.length > 1) {
        const username = word.slice(1).replace(/[^a-zA-Z0-9_-]/g, '');
        return (
          <React.Fragment key={index}>
            <Link href={`/@${username}`} className="text-blue-600 font-medium hover:underline">@{username}</Link>
            {word.slice(1 + username.length)}{' '}
          </React.Fragment>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div id="comments" className="comments p-5 sm:p-6 md:p-8 border-t border-[#ddd] mt-6 bg-white rounded-b-lg">
      <h2 className="text-[#242424] text-[24px] font-bold mb-5">
        Comments ({totalCommentsCount})
      </h2>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-start gap-3">
          <Image
            src={currentUserAvatar}
            alt="Your avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div className="flex-1 relative">
            <textarea
              rows="2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write your comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
            />
            <button
              type="submit"
              aria-label="Submit comment"
              className="bg-blue-600 text-white text-sm font-semibold px-3 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 absolute bottom-3 right-2"
              disabled={!input.trim()}
            >
              <HiPaperAirplane size={14} className=" rotate-90 scale-[1.1]" />
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-8">
        {comments.map((comment) => (
          <div key={comment.id}>
            {/* Main Comment */}
            <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
              <Image
                src={comment.avatar}
                alt={comment.name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{comment.name}</p>
                  <span className="text-xs text-gray-400">{comment.date}</span>
                </div>
                <p className="text-gray-700 mt-1 text-[15px] leading-snug whitespace-pre-wrap">
                  {renderTextWithMentions(comment.text)}
                </p>

                {/* Like + Reply actions */}
                <div className="flex gap-5 mt-2 text-sm">
                  <button
                    type="button"
                    aria-label="Like comment"
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 transition ${comment.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-blue-600'}`}
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth="0"
                      viewBox="0 0 16 16"
                      className="transition-colors duration-300"
                      height="14"
                      width="14"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        <linearGradient
                          id={`gradient-hover-comment-${comment.id}`}
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" style={{ stopColor: "#f7b35b" }} />
                          <stop
                            offset="100%"
                            style={{ stopColor: "#f3645b" }}
                          />
                        </linearGradient>
                      </defs>
                      {/* fill icon */}
                      <path
                        id="fill"
                        style={{ opacity: comment.hasLiked ? 1 : 0 }}
                        fill={comment.hasLiked ? `url(#gradient-hover-comment-${comment.id})` : "currentColor"}
                        d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z"
                      ></path>
                      {/* Outline icon */}
                      <path
                        id="outline"
                        style={{ opacity: comment.hasLiked ? 0 : 1 }}
                        d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641zM6.374 1 4.168 8.5H7.5a.5.5 0 0 1 .478.647L6.78 13.04 11.478 7H8a.5.5 0 0 1-.474-.658L9.306 1z"
                      ></path>
                    </svg>
                    <span>{comment.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (replyingTo === comment.id) {
                        setReplyingTo(null);
                      } else {
                        setReplyingTo(comment.id);
                        setReplyInput(prev => ({
                          ...prev,
                          [comment.id]: prev[comment.id] ? prev[comment.id] : `@${comment.name} `
                        }));
                      }
                    }}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition"
                  >
                    <BiReply size={16} />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="mt-4 pl-6 border-l border-gray-200 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <Image
                          src={reply.avatar}
                          alt={reply.name}
                          width={34}
                          height={34}
                          className="rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 text-sm">
                              {reply.name}
                            </p>
                            <span className="text-xs text-gray-400">
                              {reply.date}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1 text-[14px] leading-snug whitespace-pre-wrap">
                            {renderTextWithMentions(reply.text)}
                          </p>
                          <div className="flex gap-4 mt-1 text-xs">
                            <button
                              type="button"
                              onClick={() => handleLike(comment.id, reply.id)}
                              className={`flex items-center gap-1 transition ${reply.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-blue-600'}`}
                            >
                              <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 16 16"
                                className="transition-colors duration-300"
                                height="12"
                                width="12"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <defs>
                                  <linearGradient
                                    id={`gradient-hover-reply-${reply.id}`}
                                    x1="0%"
                                    y1="0%"
                                    x2="0%"
                                    y2="100%"
                                  >
                                    <stop
                                      offset="0%"
                                      style={{ stopColor: "#f7b35b" }}
                                    />
                                    <stop
                                      offset="100%"
                                      style={{ stopColor: "#f3645b" }}
                                    />
                                  </linearGradient>
                                </defs>
                                {/* fill icon */}
                                <path
                                  id="fill"
                                  style={{ opacity: reply.hasLiked ? 1 : 0 }}
                                  fill={reply.hasLiked ? `url(#gradient-hover-reply-${reply.id})` : "currentColor"}
                                  d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z"
                                ></path>
                                {/* Outline icon */}
                                <path
                                  id="outline"
                                  style={{ opacity: reply.hasLiked ? 0 : 1 }}
                                  d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641zM6.374 1 4.168 8.5H7.5a.5.5 0 0 1 .478.647L6.78 13.04 11.478 7H8a.5.5 0 0 1-.474-.658L9.306 1z"
                                ></path>
                              </svg>
                              <span>{reply.likes}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(comment.id);
                                setReplyInput(prev => ({
                                  ...prev,
                                  [comment.id]: `@${reply.name} `
                                }));
                              }}
                              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition"
                            >
                              <BiReply size={14} />
                              <span>Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Reply Box */}
                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="mt-4 flex gap-3 items-start pl-11">
                    <Image
                      src={currentUserAvatar}
                      alt="Your avatar"
                      width={32}
                      height={32}
                      className="rounded-full flex-shrink-0 object-cover w-[32px] h-[32px]"
                    />
                    <div className="flex-1">
                      <textarea
                        autoFocus
                        onFocus={(e) => {
                          const length = e.target.value.length;
                          e.target.setSelectionRange(length, length);
                        }}
                        rows="2"
                        value={replyInput[comment.id] || ""}
                        onChange={(e) =>
                          setReplyInput({
                            ...replyInput,
                            [comment.id]: e.target.value,
                          })
                        }
                        placeholder="Write a reply..."
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                          disabled={!replyInput[comment.id]?.trim()}
                        >
                          Post Reply
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Sidebar = ({ article, initialInteraction, isAuthor, commentsCount }) => {
  const [likes, setLikes] = useState(article?.likes || 0);
  const [saves, setSaves] = useState(0); // We don't track save count on the article object yet, defaulting to 0
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  React.useEffect(() => {
    setIsLiked(initialInteraction?.isLiked || false);
    setIsSaved(initialInteraction?.isSaved || false);
    // If they previously saved it, give them at least 1 count to show locally
    if (initialInteraction?.isSaved) setSaves(1);
  }, [initialInteraction]);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? Math.max(likes - 1, 0) : likes + 1);
    if (article?.id) {
      const { toggleLike } = await import('@/app/actions/posts');
      await toggleLike(article.id);
    }
  };

  const handleSave = async () => {
    setIsSaved(!isSaved);
    setSaves(isSaved ? Math.max(saves - 1, 0) : saves + 1);
    if (article?.id) {
      const { toggleBookmark } = await import('@/app/actions/posts');
      await toggleBookmark(article.id);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error("Failed to share article");
      }
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    const { deletePost } = await import('@/app/actions/posts');
    const res = await deletePost(article.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Article deleted!");
      import('@/utils/supabase/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            window.location.href = `/@${user.user_metadata?.username || user.id}`;
          } else {
            window.location.href = `/`;
          }
        });
      });
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) return;
    const { reportPost } = await import('@/app/actions/posts');
    const res = await reportPost(article.id, reportReason);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Article reported. Thank you.");
      setShowReportModal(false);
      setShowMenu(false);
    }
  };

  return (
    <>
      <div className="sticky top-28 py-[10px] pt-10 flex flex-col items-cente gap-6 text-[#3d3d3d] text-[15px] translate-x-[4px]">
        <button
          aria-label="Like post"
          onClick={handleLike}
          className={`like flex flex-col gap-0.5 ${isLiked ? 'liked text-[#f3645b]' : ''}`}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 16 16"
            className="transition-colors duration-300"
            height="25"
            width="25"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="gradient-hover"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" style={{ stopColor: "#f7b35b" }} />
                <stop offset="100%" style={{ stopColor: "#f3645b" }} />
              </linearGradient>
            </defs>
            {/* fill icon */}
            <path
              id="fill"
              d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641z"
            ></path>
            {/* Outline icon */}
            <path
              id="outline"
              d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641zM6.374 1 4.168 8.5H7.5a.5.5 0 0 1 .478.647L6.78 13.04 11.478 7H8a.5.5 0 0 1-.474-.658L9.306 1z"
            ></path>
          </svg>
          <span className="count">{likes}</span>
        </button>
        <button aria-label="Jump to comments" className=" hover:text-red-500">
          <Link href="#comments" className="flex flex-col gap-0.5">
            <TbMessageCirclePlus size={24} />
            <span className="count">{commentsCount}</span>
          </Link>
        </button>
        <button
          aria-label="Save post"
          onClick={handleSave}
          className={`save-btn flex flex-col gap-0.5 hover:text-blue-600 ${isSaved ? 'saved text-blue-600' : ''}`}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fill */}
            <path
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32"
              d="M352 48H160a48 48 0 0 0-48 48v368l144-128 144 128V96a48 48 0 0 0-48-48z"
            ></path>
          </svg>
          <span className="count">{saves}</span>
        </button>
        <button aria-label="Share post" onClick={handleShare} className="flex flex-col gap-0.5 hover:text-green-500">
          <AiOutlineRetweet size={24} />
          <span className="count">0</span>
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="flex flex-col gap-0.5 hover:text-blue-500">
            <HiOutlineDotsHorizontal size={24} />
          </button>

          {showMenu && (
            <div className="absolute left-10 top-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10 text-sm">
              {isAuthor && (
                <>
                  <Link
                    href={`/@${article.profiles.username}/write?edit=${article.slug}`}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition border-b border-gray-100"
                  >
                    Edit Article
                  </Link>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition border-b border-gray-100"
                  >
                    Delete Article
                  </button>
                </>
              )}
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
              >
                Report Article
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Delete Article</h3>
              <p className="text-gray-600 text-sm">
                Are you sure you want to delete this article? This action is permanent and cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Report Article</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="space-y-3 mb-6">
                {["Spam", "Inappropriate content", "Plagiarism", "Other"].map(reason => (
                  <label key={reason} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!reportReason}
                  className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .like svg {
          fill: #3d3d3d; /* Default color */
        }
        .like.liked .count,
        .like:hover .count {
          background-image: linear-gradient(to bottom, #f7b35b, #f3645b);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .like svg #fill {
          opacity: 0;
          transition: all 0.12s;
        }
        .like.liked .transition-colors,
        .like:hover .transition-colors {
          fill: url(#gradient-hover);
        }
        .like.liked svg #fill,
        .like:hover svg #fill {
          opacity: 1;
        }
        .like defs {
          display: none; /* Ensure defs are not rendered unless needed */
        }
        .save-btn.saved svg path,
        .save-btn:hover svg path {
          fill: #155dfc;
        }
        .save-btn.saved svg,
        .save-btn:hover svg {
          stroke: #155dfc;
        }
        @supports (fill: url(#gradient-hover)) {
          .like defs {
            display: block;
          }
          .like defs #gradient-hover {
            stop-color: #f7b35b;
            stop-color: #f3645b;
          }
        }
      `}</style>
    </>
  );
};

function Page({ params }) {
  const { user, article: slug } = React.use(params);
  const decodedUser = decodeURIComponent(user || "");
  if (!decodedUser.startsWith('@')) {
    notFound();
  }
  const username = decodedUser.slice(1);
  const { article, isLoading } = useArticle(username, slug);
  const [initialInteraction, setInitialInteraction] = React.useState({ isLiked: false, isSaved: false, userId: null });
  const [isAuthor, setIsAuthor] = React.useState(false);
  const [clientCommentCount, setClientCommentCount] = React.useState(null);

  const displayCommentCount = clientCommentCount !== null ? clientCommentCount : (article?.comments_count || 0);

  React.useEffect(() => {
    if (article?.id) {
      import('@/app/actions/posts').then(({ getUserInteraction }) => {
        getUserInteraction(article.id).then(interaction => {
          setInitialInteraction(interaction);
          setIsAuthor(interaction.userId === article.author_id);
        });
      });

      // View Tracker: 20 seconds dwell time
      const viewTimer = setTimeout(() => {
        import('@/app/actions/posts').then(({ incrementPostView }) => {
          incrementPostView(article.id).catch(err => console.error("Failed to track view", err));
        });
      }, 20000);

      return () => clearTimeout(viewTimer);
    }
  }, [article?.id, article?.author_id]);

  if (isLoading) return <div className="p-10 text-center">Loading article...</div>;
  if (!article) return <div className="p-10 text-center">Article not found</div>;

  return (
    <div className="flex flex-col-reverse lg:flex-row justify-center mt-6 lg:mt-10 mb-16 px-4 sm:px-6 lg:px-12 gap-8 lg:gap-10">
      <div className=" z-50">
        <Sidebar article={article} initialInteraction={initialInteraction} isAuthor={isAuthor} commentsCount={displayCommentCount} />
      </div>
      {/* Main Article Section */}
      <article className="w-full lg:w-3/5 bg-white rounded-xl shadow-md overflow-hidden">
        {/* Cover Image */}
        {article.cover_image && (
          <div className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[380px]">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Article Body */}
        <div className="p-5 sm:p-6 md:p-8">
          <h1 className="text-[28px] sm:text-[36px] md:text-[42px] lg:text-[48px] font-extrabold mb-4 text-gray-900 leading-tight">
            {article.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm sm:text-xs text-gray-600 mb-5 pt-1">
            <Link
              href="#"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <Image
                width={22}
                height={22}
                src={article.profiles?.avatar_url || "/user.webp"}
                alt="Author"
                className="rounded-full flex-shrink-0 object-cover w-[22px] h-[22px]"
              />
              <span>{article.profiles?.full_name || article.profiles?.username || "Author"}</span>
            </Link>
            <span>•</span>
            <span>🗓️ {new Date(article.created_at).toLocaleDateString()}</span>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="text-[#4f4f4f] hover:text-black transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Article Content */}
          <div
            className="ProseMirror prose prose-base sm:prose-lg max-w-none text-gray-800 leading-relaxed mt-4"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
        </div>
        {/* Comments */}
        <CommentSection articleId={article.id} onCommentCountChange={setClientCommentCount} />
      </article>

      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 space-y-6 order-first lg:order-last">
        <TopPosts sticky={true} />
      </aside>
    </div>
  );
}

export default Page;