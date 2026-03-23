"use client";

import * as React from "react";
import { Tabs } from "radix-ui";
import { cn } from "@/lib/utils";

function TabsRoot(props: React.ComponentProps<typeof Tabs.Root>) {
  return <Tabs.Root data-slot="tabs" {...props} />;
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.List>) {
  return (
    <Tabs.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-auto rounded-full border border-border bg-card/90 p-1 shadow-sm backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Trigger>) {
  return (
    <Tabs.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex min-w-[8.5rem] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof Tabs.Content>) {
  return (
    <Tabs.Content
      data-slot="tabs-content"
      className={cn("mt-8 outline-none", className)}
      {...props}
    />
  );
}

export { TabsRoot as Tabs, TabsList, TabsTrigger, TabsContent };
