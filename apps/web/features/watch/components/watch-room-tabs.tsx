"use client";

import { MessageCircle, UsersRound } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsPanel,
} from "@/app/components/ui/tabs";
import { CommentsSection } from "./comments-section";

export function WatchRoomTabs() {
  return (
    <Tabs defaultValue="comments">
      <TabsList>
        <TabsTrigger value="comments">
          <MessageCircle className="size-4" />
          comments
        </TabsTrigger>
        <TabsTrigger value="watch-party">
          <UsersRound className="size-4" />
          watch party (2)
        </TabsTrigger>
      </TabsList>

      <TabsPanel value="comments">
        <CommentsSection />
      </TabsPanel>

      <TabsPanel value="watch-party">
        {/* Watch party section placeholder */}
      </TabsPanel>
    </Tabs>
  );
}
