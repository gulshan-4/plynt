import Link from 'next/link';

const categories = [
  { name: 'Travel',           slug: 'travel',          icon: '🌍', accent: '#3b82f6', count: 12 },
  { name: 'Food & Drink',     slug: 'food-drink',      icon: '🍴', accent: '#f97316', count: 8  },
  { name: 'Technology',       slug: 'technology',      icon: '🤖', accent: '#8b5cf6', count: 6  },
  { name: 'Lifestyle',        slug: 'lifestyle',       icon: '⭐', accent: '#10b981', count: 5  },
  { name: 'Health & Wellness',slug: 'health-wellness', icon: '💪', accent: '#14b8a6', count: 4  },
  { name: 'Business',         slug: 'business',        icon: '💼', accent: '#64748b', count: 3  },
];

const CategoriesMenu = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">Categories</h2>
        <Link
          href="/categories"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          See all
        </Link>
      </div>

      {/* List */}
      <ul className="flex flex-col divide-y divide-gray-50">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/category/${cat.slug}`}
              className="flex items-center gap-3 py-2.5 group"
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 transition-transform duration-200 group-hover:scale-110"
                style={{ backgroundColor: `${cat.accent}15` }}
              >
                {cat.icon}
              </div>

              {/* Label */}
              <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                {cat.name}
              </span>

              {/* Count badge */}
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ color: cat.accent, backgroundColor: `${cat.accent}15` }}
              >
                {cat.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesMenu;