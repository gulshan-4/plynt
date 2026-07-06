"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSearch } from "@/app/lib/hooks";
import Card from "@/app/components/Card";
import TopPosts from "@/app/components/TopPosts";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { results, isLoading, error } = useSearch(query);

  return (
    <div className="flex flex-col lg:flex-row justify-center mt-6 lg:mt-10 mb-16 px-4 sm:px-6 lg:px-12 gap-8 lg:gap-10">
      {/* Main Content */}
      <main className="w-full lg:w-[65%]">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
          Search results for: <span className="text-blue-600">"{query}"</span>
        </h1>

        {isLoading && <p className="text-gray-500">Searching...</p>}
        {error && <p className="text-red-500">An error occurred while searching.</p>}
        
        {!isLoading && !error && results?.length === 0 && (
          <p className="text-gray-500">No articles found matching your query.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {!isLoading && results?.map((post, i) => (
            <Card
              key={post.id}
              title={post.title}
              author={post.profiles?.full_name || post.profiles?.username || "Unknown"}
              username={post.profiles?.username || "example-user"}
              date={new Date(post.created_at).toLocaleDateString()}
              image={post.cover_image || "/blog-image.webp"}
              slug={post.slug}
            />
          ))}
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full lg:w-1/4 space-y-6">
        <TopPosts sticky={true} />
      </aside>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
