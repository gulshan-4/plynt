

import Link from 'next/link';

// Mock data - replace with fetch (e.g., getPopularTags sorted by count desc)
const popularTags = [
  { name: '#travel', count: 12, slug: 'travel' },
  { name: '#food', count: 15, slug: 'food' },
  { name: '#ai', count: 10, slug: 'ai' },
  { name: '#holidays', count: 8, slug: 'holidays' },
  { name: '#tech', count: 7, slug: 'tech' },
  // Add more; sort by count for natural flow
];

export default async function TagsCloud() {
  // In real: const tags = await getPopularTags({ limit: 8, sortBy: 'count_desc' });
  // Enhanced sizing: Font (0.75-1.125rem), padding (0.5-1), weight (400-600) based on relative popularity
  const minCount = Math.min(...popularTags.map(t => t.count));
  const maxCount = Math.max(...popularTags.map(t => t.count));
  const getStyle = (count) => {
    const ratio = (count - minCount) / (maxCount - minCount);
    const fontSize = 0.75 + ratio * 0.375; // 0.75rem to 1.125rem
    const paddingX = 0.5 + ratio * 0.5; // 0.5 to 1 (units: rem)
    const fontWeight = 400 + ratio * 200; // 400 to 600
    return { fontSize: `${fontSize}rem`, padding: `${0.25}rem ${paddingX}rem`, fontWeight };
  };

  return (
    <div className="popular-tags bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100"> {/* Matches featured cards: white, subtle shadow/border */}
      <h3 className="text-base font-semibold mb-4 text-gray-900">Popular Tags</h3> {/* Bolder header to match post titles */}
      <div className="flex flex-wrap gap-2"> {/* Slightly looser gap for breathing room */}
        {popularTags.map((tag) => {
          const style = getStyle(tag.count);
          return (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="inline-flex items-center rounded-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 ease-in-out border border-gray-200"
              style={style} // Dynamic: Larger/more padded for popular tags
            >
              <span className="text-inherit font-medium" style={{ fontWeight: style.fontWeight }}>
                {tag.name}
              </span>
              <span className="ml-1 text-xs opacity-60" style={{ fontSize: `${parseFloat(style.fontSize) * 0.8}rem` }}>
                ({tag.count})
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}