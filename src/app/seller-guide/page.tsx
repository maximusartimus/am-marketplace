import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function SellerGuidePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              Seller Guide
            </h1>
            <p className="text-lg text-[#595959] max-w-2xl mx-auto">
              Everything you need to know to sell successfully on AM Marketplace.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1000px] mx-auto px-4 md:px-6">
            <div className="space-y-12">
              {/* Creating Great Listings */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                    <span className="text-[#F56400] font-bold">1</span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#222222]">How to Create a Great Listing</h2>
                </div>
                <div className="space-y-4 text-[#595959]">
                  <p>
                    A great listing is the key to attracting buyers and making sales. Here&apos;s what makes listings stand out:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#2E7D32] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong className="text-[#222222]">Write clear, descriptive titles</strong> – Include brand, model, size, or key features</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#2E7D32] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong className="text-[#222222]">Be detailed in descriptions</strong> – Include condition, measurements, and any flaws</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#2E7D32] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong className="text-[#222222]">Choose the right category</strong> – Makes it easier for buyers to find your item</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#2E7D32] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span><strong className="text-[#222222]">Be honest about condition</strong> – Builds trust and avoids disputes</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Pricing Tips */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                    <span className="text-[#F56400] font-bold">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#222222]">Pricing Tips</h2>
                </div>
                <div className="space-y-4 text-[#595959]">
                  <p>
                    Pricing your items right helps you sell faster while getting fair value:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-[#F56400] font-semibold">•</span>
                      <span><strong className="text-[#222222]">Research the market</strong> – Check similar listings to see what others are charging</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F56400] font-semibold">•</span>
                      <span><strong className="text-[#222222]">Consider condition</strong> – Adjust price based on wear, age, and completeness</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F56400] font-semibold">•</span>
                      <span><strong className="text-[#222222]">Leave room for negotiation</strong> – Many buyers expect to negotiate, so factor that in</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#F56400] font-semibold">•</span>
                      <span><strong className="text-[#222222]">Be willing to adjust</strong> – If no interest after a week, consider lowering the price</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Photo Best Practices */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                    <span className="text-[#F56400] font-bold">3</span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#222222]">Photo Best Practices</h2>
                </div>
                <div className="space-y-4 text-[#595959]">
                  <p>
                    Great photos make all the difference. Follow these tips for photos that sell:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-[#F5F5F5] p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-[#2E7D32] font-medium mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Do
                      </div>
                      <ul className="text-sm space-y-1">
                        <li>• Use natural lighting</li>
                        <li>• Show multiple angles</li>
                        <li>• Include close-ups of details</li>
                        <li>• Use a clean background</li>
                        <li>• Photograph any damage</li>
                      </ul>
                    </div>
                    <div className="bg-[#F5F5F5] p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-[#D32F2F] font-medium mb-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Don&apos;t
                      </div>
                      <ul className="text-sm space-y-1">
                        <li>• Use blurry photos</li>
                        <li>• Use stock images</li>
                        <li>• Over-edit or filter</li>
                        <li>• Hide flaws or damage</li>
                        <li>• Include only one photo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Tips */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#FFF3E0] rounded-lg flex items-center justify-center">
                    <span className="text-[#F56400] font-bold">4</span>
                  </div>
                  <h2 className="text-xl font-semibold text-[#222222]">Communication Tips</h2>
                </div>
                <div className="space-y-4 text-[#595959]">
                  <p>
                    Good communication leads to successful sales and positive reviews:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#F56400] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span><strong className="text-[#222222]">Respond promptly</strong> – Quick responses show you&apos;re serious and build trust</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#F56400] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span><strong className="text-[#222222]">Be friendly and professional</strong> – A good attitude goes a long way</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#F56400] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span><strong className="text-[#222222]">Answer questions honestly</strong> – If you don&apos;t know, say so</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#F56400] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span><strong className="text-[#222222]">Stay on the platform</strong> – Keep messages within AM Marketplace for your protection</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-[#222222] p-8 rounded-lg text-center">
                <h2 className="text-xl font-semibold text-white mb-3">Ready to Start Selling?</h2>
                <p className="text-[#A0A0A0] mb-6">
                  Create your first listing and reach thousands of buyers in Armenia.
                </p>
                <a
                  href="/listing/create"
                  className="inline-flex items-center justify-center px-8 py-3 bg-[#F56400] text-white font-semibold rounded-lg hover:bg-[#D95700] transition-colors"
                >
                  Create a Listing
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

