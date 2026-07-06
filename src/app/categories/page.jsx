import React from "react";
import CategoryCard from "../components/CategoryCard";

const Categories = () => {
    const categories = [
      {
        id: 1,
        name: "Travel",
        slug: "travel",
        featured: true,
        description: "Explore the world and discover new destinations.",
        image: "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg",
        postCount: 24,
        tags: ["budget-travel", "luxury-travel", "solo-travel", "family-vacations"],
      },
      {
        id: 2,
        name: "Food",
        slug: "food",
        featured: false,
        description: "Delicious recipes and culinary adventures.",
        image: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg",
        postCount: 15,
        tags: ["vegan-recipes", "keto-diet", "quick-meals", "desserts"],
      },
    ];

  return (
    <div className="container mx-auto px-10 pb-14 pt-2">
      <h1 className="text-3xl text-center font-bold text-gray-800 mb-6 mt-4">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default Categories;