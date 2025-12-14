import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function BuyerProtectionPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <div className="w-20 h-20 bg-[#E3F2FD] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#1976D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              Buyer Protection
            </h1>
            <p className="text-lg text-[#595959] max-w-2xl mx-auto">
              Shop with confidence. Learn how we help protect you when buying on AM Marketplace.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1000px] mx-auto px-4 md:px-6">
            <div className="space-y-12">
              {/* What Protections Exist */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-[#222222] mb-6">What Protections Exist</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Verified Sellers</h3>
                      <p className="text-sm text-[#595959]">Look for the blue badge to find sellers who have verified their identity.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Secure Messaging</h3>
                      <p className="text-sm text-[#595959]">All conversations are logged on our platform for your protection.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Report System</h3>
                      <p className="text-sm text-[#595959]">Easily report suspicious listings or users, reviewed within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Seller Reviews</h3>
                      <p className="text-sm text-[#595959]">Read reviews from other buyers before making a purchase.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Stay Safe */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-[#222222] mb-6">How to Stay Safe</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="w-8 h-8 bg-[#F56400] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Check the seller&apos;s profile</h3>
                      <p className="text-sm text-[#595959]">Look at their verification status, reviews, and how long they&apos;ve been on the platform.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="w-8 h-8 bg-[#F56400] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Ask questions before meeting</h3>
                      <p className="text-sm text-[#595959]">Request additional photos or information about the item. Genuine sellers are happy to help.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="w-8 h-8 bg-[#F56400] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Meet in safe locations</h3>
                      <p className="text-sm text-[#595959]">Choose public places like shopping centers, cafes, or designated safe meetup spots.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="w-8 h-8 bg-[#F56400] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Inspect before paying</h3>
                      <p className="text-sm text-[#595959]">Always check the item thoroughly before completing the transaction. Never pay upfront.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-[#F5F5F5] rounded-lg">
                    <div className="w-8 h-8 bg-[#F56400] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-medium text-[#222222] mb-1">Trust your instincts</h3>
                      <p className="text-sm text-[#595959]">If something feels off, don&apos;t proceed. It&apos;s better to walk away than risk a bad transaction.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* What to Do If Something Goes Wrong */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-[#222222] mb-6">What to Do If Something Goes Wrong</h2>
                <div className="space-y-4 text-[#595959]">
                  <p>
                    If you encounter a problem with a transaction, take these steps:
                  </p>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li><strong className="text-[#222222]">Document everything</strong> – Save screenshots of messages, listing details, and any relevant information.</li>
                    <li><strong className="text-[#222222]">Contact the seller</strong> – Sometimes issues can be resolved through direct communication.</li>
                    <li><strong className="text-[#222222]">Report to AM Marketplace</strong> – Use our report system to flag the issue. Our team reviews reports within 24 hours.</li>
                    <li><strong className="text-[#222222]">Contact authorities if needed</strong> – For serious issues like fraud, consider filing a report with local police.</li>
                  </ol>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/report"
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#F56400] text-white font-semibold rounded-lg hover:bg-[#D95700] transition-colors"
                  >
                    Report an Issue
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#222222] text-[#222222] font-semibold rounded-lg hover:bg-[#222222] hover:text-white transition-colors"
                  >
                    Contact Support
                  </Link>
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


