import React from "react";
import Card from "./Card";
import CategoriesSidebar from "./HomeCategories";
import TagsCloud from "./PopularTags";
import TopPosts from "./TopPosts";

const FeedLayout = ({ title, children }) => {
  return (
    <main className="flex flex-col lg:flex-row justify-center mt-6 lg:mt-10 mb-16 px-4 sm:px-6 lg:px-12 gap-8 lg:gap-10">
      <aside className="hidden xl:block w-1/4 max-w-[280px]">
        <div className="sticky top-20">
          <CategoriesSidebar />
        </div>
      </aside>

      <div className="w-full lg:w-3/5 xl:w-2/4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {title}
        </h1>
        {children}
      </div>

      <aside className="w-full lg:w-1/4 max-w-[320px] space-y-6">
        <div className="sticky top-20 space-y-6">
          <TagsCloud />
          <TopPosts sticky={false} />
        </div>
      </aside>
    </main>
  );
};

export default FeedLayout;
