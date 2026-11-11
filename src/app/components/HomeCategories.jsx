import Link from 'next/link';

export default function CategoriesMenu() {
  const displayCategories = [
    { name: 'Technology', slug: 'technology' },
    { name: 'Finance', slug: 'finance' },
    { name: 'Health', slug: 'health' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Business', slug: 'business' },
    { name: 'Science', slug: 'science' },
    { name: 'Sports', slug: 'sports' }
  ];

  return (
    <>
      <div className="section-label" >Browse Categories</div>

      {/* "All Articles" fixed top link */}
      <Link href="/" className="cat-item active" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src="/favicon.webp"
          alt="All"
          style={{ width: '24px', height: '24px', border: '1px solid #111', flexShrink: 0, objectFit: 'cover' }}
        />
        <span>All Articles</span>
      </Link>

      {displayCategories.map((cat) => {
        let imgSrc = `/category-thumbs/${cat.slug}.jpg`;
        if (cat.slug === 'health') imgSrc = '/category-thumbs/bicep.jpg';
        if (cat.slug === 'finance') imgSrc = '/category-thumbs/business.jpg';

        return (
          <Link
            key={cat.id || cat.name}
            href={`/category/${cat.slug}`}
            className="cat-item"
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <img
              src={imgSrc}
              alt={cat.name}
              style={{ width: '24px', height: '24px', border: '1px solid #111', flexShrink: 0, objectFit: 'cover' }}
            />
            <span>{cat.name}</span>
          </Link>
        );
      })}

      <Link
        href="/categories"
        style={{
          display: 'block',
          marginTop: '24px',
          padding: '12px',
          background: '#111',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '12px',
          textTransform: 'uppercase',
          textAlign: 'center',
          border: '1px solid #111',
          textDecoration: 'none',
          letterSpacing: '1px'
        }}
      >
        View All Categories →
      </Link>
    </>
  );
}