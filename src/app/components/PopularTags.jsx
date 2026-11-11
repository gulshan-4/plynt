

import Link from 'next/link';

const popularTags = [
  { name: 'Design', slug: 'design' },
  { name: 'Programming', slug: 'programming' },
  { name: 'Startups', slug: 'startups' },
  { name: 'Remote Work', slug: 'remote-work' },
  { name: 'Web3', slug: 'web3' },
  { name: 'Productivity', slug: 'productivity' },
  { name: 'UX/UI', slug: 'ux-ui' },
];

export default async function TagsCloud() {
  return (
    <div>
      <div className="sidebar-title">Popular Tags</div>
      <div className="tags-cloud">
        {popularTags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${tag.slug}`}
            className="tag-chip"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}