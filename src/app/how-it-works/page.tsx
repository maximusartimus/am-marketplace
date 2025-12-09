import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              How AM Marketplace Works
            </h1>
            <p className="text-lg text-[#595959] max-w-2xl mx-auto">
              Whether you&apos;re buying or selling, we make it simple and safe to connect with others in Armenia.
            </p>
          </div>
        </section>

        {/* For Buyers Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#222222] mb-12 text-center">
              For Buyers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-[#F56400] mb-2">Step 1</div>
                <h3 className="text-xl font-semibold text-[#222222] mb-3">Browse & Discover</h3>
                <p className="text-[#595959]">
                  Search for items or browse categories. Use filters to find exactly what you&apos;re looking for.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-[#F56400] mb-2">Step 2</div>
                <h3 className="text-xl font-semibold text-[#222222] mb-3">Contact Seller</h3>
                <p className="text-[#595959]">
                  Found something you like? Message the seller directly to ask questions or negotiate.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-[#F56400] mb-2">Step 3</div>
                <h3 className="text-xl font-semibold text-[#222222] mb-3">Meet & Purchase</h3>
                <p className="text-[#595959]">
                  Arrange a safe meetup, inspect the item, and complete your purchase. Simple as that!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* For Sellers Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#222222] mb-12 text-center">
              For Sellers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-[#F5F5F5] p-8 rounded-lg text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-[#F56400] mb-2">Step 1</div>
                <h3 className="text-xl font-semibold text-[#222222] mb-3">Create Your Store</h3>
                <p className="text-[#595959]">
                  Sign up for free and create your seller profile. Add your store details and build credibility.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#F5F5F5] p-8 rounded-lg text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-[#F56400] mb-2">Step 2</div>
                <h3 className="text-xl font-semibold text-[#222222] mb-3">List Your Items</h3>
                <p className="text-[#595959]">
                  Add photos, write descriptions, and set your price. Your listings go live instantly.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#F5F5F5] p-8 rounded-lg text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <svg className="w-8 h-8 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-[#F56400] mb-2">Step 3</div>
                <h3 className="text-xl font-semibold text-[#222222] mb-3">Connect with Buyers</h3>
                <p className="text-[#595959]">
                  Respond to inquiries, arrange meetups, and make sales. Grow your business with AM Marketplace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-[800px] mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#222222] mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-[#595959] mb-8">
              Join thousands of Armenians already buying and selling on AM Marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-3 bg-[#F56400] text-white font-semibold rounded-lg hover:bg-[#D95700] transition-colors"
              >
                Create Account
              </a>
              <a
                href="/search"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-[#222222] text-[#222222] font-semibold rounded-lg hover:bg-[#222222] hover:text-white transition-colors"
              >
                Browse Listings
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
