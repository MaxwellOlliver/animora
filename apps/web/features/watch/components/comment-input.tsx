"use client";

import { useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { commentSchema, type CommentForm } from "../schemas/comment";

export function CommentInput() {
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

  const onSubmit = (data: CommentForm) => {
    console.log(data);
    reset();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <Avatar
          src="/images/avatar-placeholder.svg"
          alt="You"
          className="size-10 shrink-0 rounded-lg"
        />
        <div className="flex min-h-10 flex-1 items-center overflow-hidden rounded-md border border-border bg-input px-2.5 py-2">
          <textarea
            ref={(el) => {
              formRef(el);
              (
                textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
              ).current = el;
            }}
            rows={1}
            placeholder="Your comment"
            onChange={handleTextChange}
            className="w-full resize-none bg-transparent text-sm leading-5 text-foreground outline-none placeholder:text-placeholder"
            {...textRegister}
          />
        </div>
        <Button
          type="submit"
          disabled={!text.trim()}
          className="mt-0.5 disabled:opacity-50"
        >
          comment
        </Button>
      </div>
      <Controller
        control={control}
        name="spoiler"
        render={({ field }) => (
          <label className="flex items-center gap-2 text-sm text-foreground-muted ml-13">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            Mark as spoiler
          </label>
        )}
      />
    </form>
  );
}
