'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name_en: string;
  slug: string;
}

export function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name_en, slug')
        .order('position', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-6 bg-white border-b border-[#E5E5E5]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-10 w-24 bg-[#F5F5F5] animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        {/* Category pills - horizontal scrollable on mobile */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            href="/search"
            className="flex-shrink-0 px-4 py-2 border border-[#222222] text-[#222222] text-sm font-medium hover:bg-[#222222] hover:text-white transition-colors whitespace-nowrap"
          >
            All Categories
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 px-4 py-2 border border-[#222222] text-[#222222] text-sm font-medium hover:bg-[#222222] hover:text-white transition-colors whitespace-nowrap"
            >
              {category.name_en}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
