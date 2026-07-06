import Card from "./components/Card";
import CategoriesSidebar from "./components/HomeCategories";
import TagsCloud from "./components/PopularTags";
import TopPosts from "./components/TopPosts";

export default function Home() {
  const trendingPosts = [
    {
      id: 1,
      title: "Top 10 Travel Destinations",
      description:
        "Discover the best places to visit in 2023, Discover the best places to visit in 2023. Discover the best places to visit in 2023",
      image:
        "https://images.pexels.com/photos/2583852/pexels-photo-2583852.jpeg",
    },
    {
      id: 2,
      title: "Best Food Trends",
      description: "What's hot in the culinary world",
      image: null,
    },
    {
      id: 3,
      title: "AI Revolution",
      description: "How AI is changing the world",
      image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg",
    },
  ];
  return (
    <main className="flex">
      <aside className="flex-1 mt-15">
        <CategoriesSidebar/>
      </aside>
      <div className="container w-max px-4 pb-14 pt-2">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 mt-5 text-center">
          Featured Articles
        </h1>
        <div className="trending w-max mt-4 flex flex-col gap-4 items-stretch">
          {trendingPosts.map((post) => (
            <Card
              key={post.id}
              title={post.title}
              description={post.description}
              image={post.image}
              featured={post.id == 1? true : false}
            />
          ))}
        </div>
      </div>
      <aside className="flex-1 mt-15">
        <TagsCloud />
        <TopPosts sticky={false} />
      </aside>
    </main>
  );
}