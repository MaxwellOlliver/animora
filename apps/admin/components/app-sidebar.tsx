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
        <LogoFull className="shrink-0 h-8 group-data-[state=collapsed]:hidden" />
        <LogoSymbol className="shrink-0 h-6 group-data-[state=expanded]:hidden" />
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
