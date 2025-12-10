import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <FeaturedListings />
        <RecentlyViewed />
      </main>
      <Footer />
    </div>
  );
}
