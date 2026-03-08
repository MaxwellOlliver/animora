"use client";

import { Film, ListVideo } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UploadProgressPopover } from "@/features/videos/components/upload-progress-popover";

import LogoFull from "@/public/logo-full.svg";
import LogoSymbol from "@/public/logo-symbol.svg";

const navItems = [
  {
    title: "Catalog",
    url: "#",
    icon: Film,
    isActive: true,
    items: [
      { title: "Series", url: "/series" },
      { title: "Genres", url: "/genres" },
      { title: "Classifications", url: "/classifications" },
    ],
  },
  {
    title: "Content",
    url: "#",
    icon: ListVideo,
    items: [
      { title: "Playlists", url: "/playlists" },
      { title: "Episodes", url: "/episodes" },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="pt-4">
        <div className="flex items-center justify-between">
          <LogoFull className="shrink-0 h-8 group-data-[state=collapsed]:hidden" />
          <LogoSymbol className="shrink-0 h-6 group-data-[state=expanded]:hidden" />
          <UploadProgressPopover />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
