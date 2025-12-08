import Link from 'next/link';

const categories = [
  {
    id: 'electronics',
    name: 'Electronics',
    nameHy: 'Էdelays',
    icon: '📱',
    color: 'bg-blue-50',
    borderColor: 'hover:border-blue-400',
    count: '12,450',
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    nameHy: 'Մdelays',
    icon: '🚗',
    color: 'bg-red-50',
    borderColor: 'hover:border-red-400',
    count: '8,320',
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    nameHy: 'Անdelays',
    icon: '🏠',
    color: 'bg-green-50',
    borderColor: 'hover:border-green-400',
    count: '5,890',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    nameHy: 'Նdelays',
    icon: '👗',
    color: 'bg-pink-50',
    borderColor: 'hover:border-pink-400',
    count: '15,670',
  },
  {
    id: 'home-garden',
    name: 'Home & Garden',
    nameHy: 'Տdelays',
    icon: '🏡',
    color: 'bg-amber-50',
    borderColor: 'hover:border-amber-400',
    count: '9,120',
  },
  {
    id: 'jobs',
    name: 'Jobs',
    nameHy: 'Delays',
    icon: '💼',
    color: 'bg-violet-50',
    borderColor: 'hover:border-violet-400',
    count: '3,450',
  },
  {
    id: 'services',
    name: 'Services',
    nameHy: 'Delays',
    icon: '🔧',
    color: 'bg-orange-50',
    borderColor: 'hover:border-orange-400',
    count: '6,780',
  },
  {
    id: 'kids',
    name: 'Kids & Baby',
    nameHy: 'Delays',
    icon: '🧸',
    color: 'bg-cyan-50',
    borderColor: 'hover:border-cyan-400',
    count: '4,230',
  },
  {
    id: 'sports',
    name: 'Sports',
    nameHy: 'Delays',
    icon: '⚽',
    color: 'bg-lime-50',
    borderColor: 'hover:border-lime-400',
    count: '2,890',
  },
  {
    id: 'pets',
    name: 'Pets',
    nameHy: 'Delays',
    icon: '🐕',
    color: 'bg-yellow-50',
    borderColor: 'hover:border-yellow-400',
    count: '1,560',
  },
  {
    id: 'art',
    name: 'Art & Crafts',
    nameHy: 'Delays',
    icon: '🎨',
    color: 'bg-purple-50',
    borderColor: 'hover:border-purple-400',
    count: '3,120',
  },
  {
    id: 'other',
    name: 'Other',
    nameHy: 'Delays',
    icon: '📦',
    color: 'bg-gray-50',
    borderColor: 'hover:border-gray-400',
    count: '7,890',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Section header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#222222]">
              Browse Categories
            </h2>
            <p className="text-[#595959] mt-1">
              Find what you&apos;re looking for
            </p>
          </div>
          <Link
            href="/categories"
            className="text-[#F56400] hover:text-[#D95700] font-semibold flex items-center gap-1 transition-colors"
          >
            View All
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className={`group p-4 md:p-6 ${category.color} rounded-xl border-2 border-transparent ${category.borderColor} transition-all hover:shadow-md hover:-translate-y-1`}
            >
              <div className="text-center">
                <span className="text-4xl md:text-5xl block mb-3">
                  {category.icon}
                </span>
                <h3 className="font-semibold text-[#222222] text-sm md:text-base mb-1">
                  {category.name}
                </h3>
                <p className="text-xs text-[#757575]">
                  {category.count} listings
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

