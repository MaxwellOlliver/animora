"use client";

import { Popover } from "@base-ui-components/react/popover";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const openTimeoutRef = useRef<number | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const suppressHoverRef = useRef(false);
  const [open, setOpen] = useState(false);

  const clearOpenTimeout = useCallback(() => {
    if (openTimeoutRef.current !== null) {
      window.clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  }, []);

  const clearCloseTimeout = useCallback(() => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearCloseTimeout();
    clearOpenTimeout();
    openTimeoutRef.current = window.setTimeout(() => {
      setOpen(true);
      openTimeoutRef.current = null;
    }, 500);
  }, [clearCloseTimeout, clearOpenTimeout]);

  const scheduleClose = useCallback(() => {
    clearOpenTimeout();
    clearCloseTimeout();
    closeTimeoutRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimeoutRef.current = null;
    }, 200);
  }, [clearCloseTimeout, clearOpenTimeout]);

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

  useEffect(() => {
    return () => {
      clearOpenTimeout();
      clearCloseTimeout();
    };
  }, [clearCloseTimeout, clearOpenTimeout]);

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

  const handleTriggerPointerEnter = useCallback<
    React.PointerEventHandler<HTMLDivElement>
  >(
    (event) => {
      if (event.pointerType !== "mouse" || suppressHoverRef.current) return;
      scheduleOpen();
    },
    [scheduleOpen],
  );

  const handleTriggerPointerLeave = useCallback<
    React.PointerEventHandler<HTMLDivElement>
  >(() => {
    suppressHoverRef.current = false;
    scheduleClose();
  }, [scheduleClose]);

  const handleTriggerPointerDown = useCallback<
    React.PointerEventHandler<HTMLDivElement>
  >(() => {
    suppressHoverRef.current = true;
    clearOpenTimeout();
    setOpen(false);
  }, [clearOpenTimeout]);

  return (
    <Popover.Root open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
      <div
        ref={triggerRef}
        onPointerEnter={handleTriggerPointerEnter}
        onPointerLeave={handleTriggerPointerLeave}
        onPointerDown={handleTriggerPointerDown}
      >
        {children}
      </div>
      <Popover.Portal>
        <Popover.Positioner
          className="z-50"
          anchor={centerAnchor}
          sideOffset={({ positioner }) => -positioner.height / 2}
          collisionPadding={16}
          positionMethod="fixed"
          onMouseEnter={clearCloseTimeout}
          onMouseLeave={scheduleClose}
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
