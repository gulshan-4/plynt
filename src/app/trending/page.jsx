import React from "react";
import FeedLayout from "../components/FeedLayout";

import Card from "../components/Card";

const Trending = () => {
  const trendingPosts = [
    { id: 1, title: "Top 10 Travel Destinations", description: "Discover the best places to visit in 2023", image: "https://images.pexels.com/photos/2583852/pexels-photo-2583852.jpeg", slug: "top-10-travel", featured: true, tags: ["travel", "holidays"], likes: 320, comments: 76 },
    { id: 2, title: "Best Food Trends", description: "What's hot in the culinary world", image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg", slug: "best-food-trends", tags: ["food", "trends"], likes: 210, comments: 45 },
    { id: 3, title: "AI Revolution", description: "How AI is changing the world", image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg", slug: "ai-revolution", tags: ["ai", "tech"], likes: 150, comments: 32 },
  ];

  return (
    <FeedLayout title="Trending">
      <div className="flex flex-col gap-6 items-center">
        {trendingPosts.map((post) => (
          <Card
            key={post.id}
            title={post.title}
            description={post.description}
            image={post.image}
            slug={post.slug}
            author={post.author || "Daniel Kraszewski"}
            tags={post.tags || []}
            likes={post.likes || 0}
            comments={post.comments || 0}
            featured={post.featured}
          />
        ))}
      </div>
    </FeedLayout>
  );
};

export default Trending;