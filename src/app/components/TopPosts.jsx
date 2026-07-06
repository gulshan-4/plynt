import Link from "next/link";
import Image from "next/image";
import { BiCommentDetail } from "react-icons/bi";
import { FaHeart } from "react-icons/fa";

const topPosts = [
  {
    id: 1,
    title: "Top 10 Travel Destinations",
    image: "https://images.pexels.com/photos/2583852/pexels-photo-2583852.jpeg",
    reviews: 76,
    likes: 320,
    slug: "top-10-travel-destinations",
  },
  {
    id: 2,
    title: "Best Food Trends",
    image: null,
    reviews: 45,
    likes: 210,
    slug: "best-food-trends",
  },
  {
    id: 3,
    title: "AI Revolution",
    image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg",
    reviews: 32,
    likes: 150,
    slug: "ai-revolution",
  }
];

export default function TopPosts({sticky}) {
  return (
    <section className={`popular-posts sidebar-scroll bg-white rounded-lg shadow-md p-5 mb-8 ${sticky? ' sticky top-20' : ''} max-h-full overflow-auto`}>
      <h3 className="text-xl font-bold mb-5 text-gray-800">Popular Posts</h3>

      <ul className="space-y-5">
        {topPosts.map((post, index) => (
          <li
            key={post.id}
            className={`transition-all duration-200 hover:shadow-md overflow-hidden ${
              topPosts.length !== index + 1 ? "pb-4 border-b border-[#000000]/16" : ""
            }`}
          >
            <Link href={`/@danielk/${post.slug}`} className="group block">
              {post.image ? (
                <div className="relative w-full h-[150px] sm:h-[180px] overflow-hidden rounded-md">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                ""
                // <div className="bg-gray-100 h-[150px] sm:h-[180px] flex items-center justify-center text-gray-400 text-sm italic rounded-md">
                //   No image available
                // </div>
              )}

              <div className="pt-3">
                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 leading-snug line-clamp-2">
                  {post.title}
                </h4>

                <div className="flex items-center gap-4 text-xs text-blue-500 mt-2">
                  <div className="flex items-center">
                    <BiCommentDetail className="w-3.5 h-3.5 mr-1" />
                    <span>{post.reviews}</span>
                  </div>
                  <div className="flex items-center">
                    <FaHeart className="w-3.5 h-3.5 mr-1" />
                    <span>{post.likes}</span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}