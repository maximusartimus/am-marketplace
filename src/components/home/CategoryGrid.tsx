import Link from 'next/link';

const categories = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'real-estate', name: 'Real Estate' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home-garden', name: 'Home & Garden' },
  { id: 'jobs', name: 'Jobs' },
  { id: 'services', name: 'Services' },
];

export function CategoryGrid() {
  return (
    <section className="py-6 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Category pills - horizontal scrollable on mobile */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.id}`}
              className="flex-shrink-0 px-4 py-2 border border-[#222222] text-[#222222] text-sm font-medium hover:bg-[#222222] hover:text-white transition-colors whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
