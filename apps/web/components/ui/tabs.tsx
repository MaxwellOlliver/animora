"use client";

import { Tabs as TabsPrimitive } from "@base-ui-components/react/tabs";

import { cn } from "@/lib/utils";

function Tabs(props: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-full border border-transparent px-6 py-2 text-sm text-foreground-muted transition-colors aria-selected:bg-foreground aria-selected:text-background",
        className,
      )}
      {...props}
    />
  );
}

function TabsPanel({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("pt-6", className)}
      {...props}
    />
  );
}

function TabsIndicator({
  className,
  ...props
}: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsPanel, TabsIndicator };
