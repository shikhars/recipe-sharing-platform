"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { CommentWithUser } from "@/types/social";
import { addComment, deleteComment, updateComment } from "@/lib/social-utils";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
  recipeId: string;
  comments: CommentWithUser[];
  onCommentChange: () => void;
}

export function CommentSection({ recipeId, comments, onCommentChange }: CommentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    const { success, error } = await addComment(recipeId, user.id, newComment.trim());

    if (success) {
      setNewComment("");
      onCommentChange();
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: error || "Failed to add comment",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    const { success, error } = await deleteComment(commentId, user.id);

    if (success) {
      onCommentChange();
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed.",
      });
    } else {
      toast({
        title: "Error",
        description: error || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!user || !editContent.trim()) return;

    const { success, error } = await updateComment(commentId, user.id, editContent.trim());

    if (success) {
      setEditingCommentId(null);
      setEditContent("");
      onCommentChange();
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    } else {
      toast({
        title: "Error",
        description: error || "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {comment.user.full_name}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </div>
              </div>
              {user && user.id === comment.user_id && (
                <div className="flex gap-2">
                  {editingCommentId === comment.id ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(comment.id)}
                        className="text-emerald-600"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditContent("");
                        }}
                        className="text-slate-600"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-slate-600"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            {editingCommentId === comment.id ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full mt-2 p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            ) : (
              <p className="mt-2 text-slate-700 dark:text-slate-300">{comment.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 