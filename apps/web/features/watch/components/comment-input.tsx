"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback,useRef } from "react";
import { Controller,useForm } from "react-hook-form";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { buildMediaUrl } from "@/utils/media-utils";

import { type CommentForm,commentSchema } from "../schemas/comment";

interface CommentInputProps {
  avatar?: { key: string; purpose: string } | null;
  onSubmit: (data: CommentForm) => void;
  isPending?: boolean;
  placeholder?: string;
  compact?: boolean;
}

export function CommentInput({
  avatar,
  onSubmit,
  isPending,
  placeholder = "Your comment",
  compact,
}: CommentInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { register, handleSubmit, control, watch, reset } =
    useForm<CommentForm>({
      resolver: zodResolver(commentSchema),
      defaultValues: { text: "", spoiler: false },
    });

  const text = watch("text");

  const {
    ref: formRef,
    onChange: formOnChange,
    ...textRegister
  } = register("text");

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      formOnChange(e);
      const el = e.target;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    },
    [formOnChange],
  );

  const handleFormSubmit = (data: CommentForm) => {
    onSubmit(data);
    reset();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const avatarSrc = avatar
    ? buildMediaUrl(
        avatar.purpose as Parameters<typeof buildMediaUrl>[0],
        avatar.key,
      )
    : "/images/avatar-placeholder.svg";

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        {!compact && (
          <Avatar
            src={avatarSrc}
            alt="You"
            className="size-10 shrink-0 rounded-lg"
          />
        )}
        <div className="flex min-h-10 flex-1 items-center overflow-hidden rounded-md border border-border bg-input px-2.5 py-2">
          <textarea
            ref={(el) => {
              formRef(el);
              (
                textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
              ).current = el;
            }}
            rows={1}
            placeholder={placeholder}
            onChange={handleTextChange}
            className="w-full resize-none bg-transparent text-sm leading-5 text-foreground outline-none placeholder:text-placeholder"
            {...textRegister}
          />
        </div>
        <Button
          type="submit"
          disabled={!text.trim() || isPending}
          className="disabled:opacity-50"
        >
          {isPending ? "..." : "comment"}
        </Button>
      </div>
      {!compact && (
        <Controller
          control={control}
          name="spoiler"
          render={({ field }) => (
            <label className="ml-13 flex items-center gap-2 text-sm text-foreground-muted">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              Mark as spoiler
            </label>
          )}
        />
      )}
    </form>
  );
}
