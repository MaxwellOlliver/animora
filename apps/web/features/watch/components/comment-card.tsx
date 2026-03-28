import { Heart, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface CommentCardProps {
  name: string;
  avatar: string;
  text: string;
  likes: number;
  dislikes: number;
  liked?: boolean;
  replies?: CommentCardProps[];
}

export function CommentCard({
  name,
  avatar,
  text,
  likes,
  dislikes,
  liked,
  replies,
}: CommentCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2.5">
        <Avatar
          src={avatar}
          alt={name}
          className="size-10 shrink-0 rounded-lg"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm font-normal text-white">{name}</span>
          <p className="text-sm leading-5 text-foreground">{text}</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className={cn(
                "flex items-center gap-2.5 text-sm transition-colors",
                liked
                  ? "text-primary"
                  : "text-foreground-muted hover:text-primary",
              )}
            >
              <Heart className={cn("size-4", liked && "fill-primary")} />
              {likes}
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              <ChevronDown className="size-4" />
              {dislikes}
            </button>
          </div>
        </div>
      </div>

      {replies && replies.length > 0 && (
        <div className="flex flex-col gap-4 pl-13">
          {replies.map((reply, i) => (
            <div key={i} className="flex gap-2.5">
              <Avatar
                src={reply.avatar}
                alt={reply.name}
                className="size-8 shrink-0 rounded-lg"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-sm font-normal text-white">
                  {reply.name}
                </span>
                <p className="text-sm leading-5 text-foreground">
                  {reply.text}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    className="flex items-center gap-2.5 text-sm text-foreground-muted transition-colors hover:text-primary"
                  >
                    <Heart className="size-4" />
                    {reply.likes}
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 text-sm text-foreground-muted transition-colors hover:text-foreground"
                  >
                    <ChevronDown className="size-4" />
                    {reply.dislikes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
