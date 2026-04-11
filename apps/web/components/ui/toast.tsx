"use client";

import { Toast as ToastPrimitive } from "@base-ui-components/react/toast";
import { CircleCheck, CircleX, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

const icons = {
  success: <CircleCheck className="size-4 text-success" />,
  error: <CircleX className="size-4 text-danger" />,
  warning: <TriangleAlert className="size-4 text-warning" />,
  info: <Info className="size-4 text-info" />,
} as const;

function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider timeout={5000} limit={3}>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex w-96 flex-col gap-2 p-4 outline-none">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      className={cn(
        "data-[swipe-direction]:data-swiping:transition-none",
        "data-[ending]:animate-out data-[ending]:fade-out-0 data-[ending]:slide-out-to-right-full",
        "data-[starting]:animate-in data-[starting]:fade-in-0 data-[starting]:slide-in-from-right-full",
      )}
    >
      <ToastPrimitive.Content className="flex items-start gap-3 rounded-lg border border-border bg-elevated p-3 shadow-lg">
        {toast.type && toast.type in icons && (
          <span className="mt-0.5 shrink-0">
            {icons[toast.type as keyof typeof icons]}
          </span>
        )}
        <div className="flex-1 space-y-0.5">
          <ToastPrimitive.Title className="text-sm font-medium text-foreground" />
          <ToastPrimitive.Description className="text-xs text-foreground-muted" />
        </div>
        <ToastPrimitive.Close className="shrink-0 rounded-md p-0.5 text-foreground-muted transition-colors hover:text-foreground">
          <X className="size-3.5" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}

export { ToastProvider };

export { ToastPrimitive as Toast };
