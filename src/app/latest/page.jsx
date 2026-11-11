import React from "react";
import CategoriesSidebar from "../components/HomeCategories";
import TagsCloud from "../components/PopularTags";
import TopPosts from "../components/TopPosts";
import LatestFeed from "../components/LatestFeed";
import { getLatestFeed } from "@/app/actions/posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Latest Posts | Plynt.space",
  description: "Browse the newest articles published on Plynt.space.",
};

export default async function Latest() {
  const { posts } = await getLatestFeed(1, 20);

  return (
    <div className="layout">
      <aside className="sidebar-left">
        <CategoriesSidebar />
      </aside>

      <LatestFeed initialPosts={posts} />

      <aside className="sidebar-right">
        <TopPosts>
          <TagsCloud />
        </TopPosts>
      </aside>
    </div>
  );
}