import Link from 'next/link';
import React from 'react';

const CategoryCard = ({ category }) => {
  return (
    <Link href={`/category/${category.slug}`} className="category-tile">
      <img className="tile-img" src={`/category-thumbs/covers/${category.slug}.jpg`} alt="" />
      {category.featured && <span className="tile-badge">FEATURED</span>}
      <div className="tile-body">
        <span className="tile-name">{category.name}</span>
        <p className="tile-desc">{category.description}</p>
        <span className="tile-link">Explore Section &rarr;</span>
      </div>
    </Link>
  );
};

export default CategoryCard;