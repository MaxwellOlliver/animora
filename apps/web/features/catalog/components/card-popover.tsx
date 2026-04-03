"use client";

import { Popover } from "@base-ui-components/react/popover";
import { useRef, useCallback, useState, useEffect } from "react";

interface CardPopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function CardPopover({
  children,
  content,
  onOpenChange,
}: CardPopoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(open);
    }

    if (!open) return;

    const handleScroll = () => setOpen(false);
    window.addEventListener("scroll", handleScroll, { capture: true });

    return () =>
      window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [open, onOpenChange]);

  const centerAnchor = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return {
      getBoundingClientRect: () => ({
        x: cx,
        y: cy,
        width: 0,
        height: 0,
        top: cy,
        right: cx,
        bottom: cy,
        left: cx,
        toJSON: () => {},
      }),
    };
  }, []);

  return (
    <Popover.Root
      open={open}
      onOpenChange={(nextOpen, { reason }) => {
        if (reason === "trigger-press") return;
        setOpen(nextOpen);
      }}
    >
      <Popover.Trigger
        ref={triggerRef}
        openOnHover
        nativeButton={false}
        delay={500}
        closeDelay={200}
      >
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className="z-50"
          anchor={centerAnchor}
          sideOffset={({ positioner }) => -positioner.height / 2}
          collisionPadding={16}
          positionMethod="fixed"
          onMouseLeave={() => setOpen(false)}
        >
          <Popover.Popup
            initialFocus={false}
            finalFocus={false}
            className="z-50 origin-(--transform-origin) overflow-clip rounded-lg bg-elevated shadow-[0px_0px_20px_6px_rgba(0,0,0,0.5)] transition-[transform,scale,opacity] data-starting-style:scale-90 data-starting-style:opacity-0 data-ending-style:scale-90 data-ending-style:opacity-0"
          >
            {content}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
