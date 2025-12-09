import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              About AM Marketplace
            </h1>
            <p className="text-lg text-[#595959] max-w-2xl mx-auto">
              Armenia&apos;s modern marketplace for buying and selling.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-[800px] mx-auto px-4 md:px-6">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-[#222222] mb-6">Our Story</h2>
              <div className="space-y-4 text-[#595959] leading-relaxed">
                <p>
                  AM Marketplace was born from a simple idea: Armenia deserves a modern, trustworthy platform for buying and selling. A place where locals can easily connect, discover unique finds, and build a thriving community of commerce.
                </p>
                <p>
                  We noticed that existing platforms didn&apos;t meet the needs of today&apos;s Armenian consumers and sellers. So we set out to build something better – a marketplace that&apos;s beautiful, easy to use, and designed with safety in mind.
                </p>
                <p>
                  Today, AM Marketplace is proud to serve thousands of users across Armenia, from Yerevan to Gyumri and everywhere in between. Whether you&apos;re looking for electronics, vehicles, real estate, or everyday items, we&apos;re here to help you find what you need.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-[#222222] mb-4">Our Mission</h2>
              <p className="text-lg text-[#595959] max-w-2xl mx-auto">
                Connecting Armenian buyers and sellers through a safe, modern marketplace.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#222222] mb-2">Community First</h3>
                <p className="text-[#595959]">
                  We&apos;re building more than a marketplace – we&apos;re creating a community where Armenians can connect and trade with confidence.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#222222] mb-2">Trust & Safety</h3>
                <p className="text-[#595959]">
                  Your safety matters. We verify sellers, provide secure messaging, and actively work to prevent fraud.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#1976D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#222222] mb-2">Modern Experience</h3>
                <p className="text-[#595959]">
                  We believe buying and selling should be simple. That&apos;s why we&apos;ve built a platform that&apos;s fast, intuitive, and works on any device.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="bg-[#222222] rounded-lg p-8 md:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">10K+</div>
                  <div className="text-[#A0A0A0] text-sm">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">25K+</div>
                  <div className="text-[#A0A0A0] text-sm">Listings</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">50+</div>
                  <div className="text-[#A0A0A0] text-sm">Categories</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">4.8</div>
                  <div className="text-[#A0A0A0] text-sm">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
