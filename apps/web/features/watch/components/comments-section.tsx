"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectPopup,
  SelectItem,
} from "@/app/components/ui/select";
import { CommentInput } from "./comment-input";
import { CommentCard } from "./comment-card";

const MOCK_COMMENTS = [
  {
    name: "Profile Name",
    avatar: "/images/avatar-placeholder.svg",
    text: "Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, oid creatures who devour humans seemingly without reason.",
    likes: 246,
    dislikes: 246,
    liked: false,
    replies: [
      {
        name: "Profile Name",
        avatar: "/images/avatar-placeholder.svg",
        text: "Attack on Titan is set in a world where humanity lives inside cities surrounded",
        likes: 248,
        dislikes: 246,
        liked: false,
      },
    ],
  },
  {
    name: "Profile Name",
    avatar: "/images/avatar-placeholder.svg",
    text: "Attack on Titan is set in a world where humanity lives inside cities surrounded by enormous Walls that protect them from Titans, oid creatures who devour humans seemingly without reason.",
    likes: 246,
    dislikes: 246,
    liked: false,
  },
];

export function CommentsSection() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl font-medium leading-7">
          136.234 comments
        </h3>
        <Select defaultValue={{ label: "Most relevant", value: "relevant" }}>
          <SelectTrigger className="border-none bg-transparent" />
          <SelectPopup>
            <SelectItem value={{ label: "Most relevant", value: "relevant" }}>
              Most relevant
            </SelectItem>
            <SelectItem value={{ label: "Newest", value: "newest" }}>
              Newest
            </SelectItem>
          </SelectPopup>
        </Select>
      </div>

      <CommentInput />

      <div className="flex flex-col gap-4 pt-6">
        {MOCK_COMMENTS.map((comment, i) => (
          <CommentCard key={i} {...comment} />
        ))}
      </div>
    </div>
  );
}
