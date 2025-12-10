import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              Trust & Safety
            </h1>
            <p className="text-lg text-[#595959] max-w-2xl mx-auto">
              Your safety is our priority. Learn how we keep AM Marketplace secure and what you can do to protect yourself.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1000px] mx-auto px-4 md:px-6">
            <div className="space-y-12">
              {/* Verified Sellers */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E3F2FD] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#1976D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#222222] mb-3">Verified Sellers Program</h2>
                    <p className="text-[#595959] mb-4">
                      Look for the blue verification badge on seller profiles. Verified sellers have confirmed their identity and have a track record of successful transactions.
                    </p>
                    <ul className="text-[#595959] space-y-2">
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Identity verification completed
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Phone number confirmed
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Positive transaction history
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Safe Meetup Tips */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FFF3E0] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#222222] mb-3">Safe Meetup Tips</h2>
                    <p className="text-[#595959] mb-4">
                      When meeting in person to complete a transaction, follow these guidelines:
                    </p>
                    <ul className="text-[#595959] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#F56400] font-semibold">•</span>
                        Meet in public, well-lit locations (cafes, malls, bank lobbies)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F56400] font-semibold">•</span>
                        Bring a friend or let someone know your plans
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F56400] font-semibold">•</span>
                        Inspect items thoroughly before paying
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F56400] font-semibold">•</span>
                        Use cash or secure payment methods
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F56400] font-semibold">•</span>
                        Trust your instincts – if something feels wrong, walk away
                      </li>
                    </ul>
                    <Link 
                      href="/safe-meetup" 
                      className="inline-flex items-center text-[#F56400] font-medium mt-4 hover:underline"
                    >
                      View Safe Meetup Spots →
                    </Link>
                  </div>
                </div>
              </div>

              {/* How to Spot Scams */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#FFEBEE] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#D32F2F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#222222] mb-3">How to Spot Scams</h2>
                    <p className="text-[#595959] mb-4">
                      Be cautious of these red flags:
                    </p>
                    <ul className="text-[#595959] space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#D32F2F] font-semibold">⚠</span>
                        Prices that seem too good to be true
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#D32F2F] font-semibold">⚠</span>
                        Sellers requesting payment before meeting
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#D32F2F] font-semibold">⚠</span>
                        Pressure to complete the transaction quickly
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#D32F2F] font-semibold">⚠</span>
                        Requests to communicate outside the platform
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#D32F2F] font-semibold">⚠</span>
                        Stock photos or images copied from other websites
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Report Suspicious Activity */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#2E7D32]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#222222] mb-3">Report Suspicious Activity</h2>
                    <p className="text-[#595959] mb-4">
                      Help us keep AM Marketplace safe. If you encounter something suspicious, report it immediately. Our team reviews all reports within 24 hours.
                    </p>
                    <Link 
                      href="/report" 
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#F56400] text-white font-semibold rounded-lg hover:bg-[#D95700] transition-colors"
                    >
                      Report an Issue
                    </Link>
                  </div>
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

