import React from "react";
import FeedLayout from "../components/FeedLayout";
import InfiniteFeed from "../components/InfiniteFeed";
import { getLatestFeed } from "@/app/actions/posts";

export const dynamic = "force-dynamic";

export default async function Latest() {
  const { featuredPost, posts } = await getLatestFeed(1, 20);

  return (
    <FeedLayout title="Latest Posts">
      <InfiniteFeed initialPosts={posts} initialFeaturedPost={featuredPost} />
    </FeedLayout>
  );
}