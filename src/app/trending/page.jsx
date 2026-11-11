import React from "react";
import CategoriesSidebar from "../components/HomeCategories";
import TagsCloud from "../components/PopularTags";
import TopPosts from "../components/TopPosts";
import TrendingFeed from "../components/TrendingFeed";
import { getTrendingPosts } from "@/app/actions/posts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trending | Plynt.space",
  description: "The most popular and talked-about articles on Plynt.space right now.",
};

export default async function Trending() {
  const { posts } = await getTrendingPosts(1, 20);

  return (
    <div className="layout">
      <aside className="sidebar-left">
        <CategoriesSidebar />
      </aside>

      <TrendingFeed initialPosts={posts} />

      <aside className="sidebar-right">
        <TopPosts>
          <TagsCloud />
        </TopPosts>
      </aside>
    </div>
  );
}