"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleLike } from "@/lib/social-utils";
import { useToast } from "@/components/ui/use-toast";

interface LikeButtonProps {
  recipeId: string;
  userId: string;
  initialLikes: number;
  initialLiked: boolean;
  onLikeChange?: (newLikes: number, isLiked: boolean) => void;
  className?: string;
}

export function LikeButton({
  recipeId,
  userId,
  initialLikes,
  initialLiked,
  onLikeChange,
  className,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(Number.isFinite(initialLikes) ? initialLikes : 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsAnimating(true);

    // Call the API
    const { success, error } = await toggleLike(recipeId, userId);

    if (!success) {
      // Revert optimistic update on error
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      toast({
        title: "Error",
        description: error || "Failed to update like",
        variant: "destructive",
      });
    } else {
      // Notify parent component of the change
      onLikeChange?.(likesCount + (isLiked ? -1 : 1), !isLiked);
    }

    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleLike}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors",
        isLiked
          ? "text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-950/50"
          : "text-slate-500 hover:text-slate-600 bg-slate-50 dark:bg-slate-800/50",
        className
      )}
      aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-transform duration-300",
          isLiked && "fill-current",
          isAnimating && "scale-125"
        )}
      />
      <span className="text-sm font-medium">{Number.isFinite(likesCount) ? likesCount : 0}</span>
    </button>
  );
} 