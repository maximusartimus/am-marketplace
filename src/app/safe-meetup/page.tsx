import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function SafeMeetupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-50 to-white py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Safe Meetup Spots
              </h1>
              <p className="text-xl text-gray-600">
                Tips and recommendations for meeting buyers and sellers safely in person.
              </p>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              
              {/* Why Public Places */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why Meet in Public?
                </h2>
                <p className="text-gray-600 mb-6">
                  Meeting in a public place protects both buyers and sellers. Public locations have 
                  witnesses, security cameras, and provide a safe environment for completing transactions.
                </p>
              </div>

              {/* Recommended Spots */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Recommended Meeting Spots
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      ),
                      title: 'Shopping Malls',
                      desc: 'Well-lit, security cameras, lots of people',
                      examples: 'Yerevan Mall, Dalma Garden Mall, Rossia Mall',
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      ),
                      title: 'Coffee Shops & Cafes',
                      desc: 'Relaxed atmosphere, easy to inspect items',
                      examples: 'Jazzve, Green Bean, The Club',
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                      ),
                      title: 'Bank Lobbies',
                      desc: '24/7 security, cameras, safe for cash transactions',
                      examples: 'Any major bank branch',
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                      ),
                      title: 'Police Station Parking',
                      desc: 'Maximum security for high-value items',
                      examples: 'Any local police station',
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ),
                      title: 'Metro Stations',
                      desc: 'Busy, well-lit, easy to access',
                      examples: 'Republic Square, Barekamutyan',
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      title: 'During Daytime',
                      desc: 'Always prefer meeting during daylight hours',
                      examples: '9 AM - 6 PM recommended',
                    },
                  ].map((spot, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                          {spot.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{spot.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{spot.desc}</p>
                          <p className="text-gray-500 text-xs">{spot.examples}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Checklist */}
              <div className="bg-blue-50 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Safety Checklist
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    'Meet in a public, well-lit place',
                    'Tell a friend or family member where you\'re going',
                    'Bring someone with you for valuable items',
                    'Inspect the item before paying',
                    'Use cash or secure payment methods',
                    'Don\'t share personal information unnecessarily',
                    'Trust your instincts – if something feels wrong, leave',
                    'Keep your phone charged and accessible',
                    'Avoid inviting strangers to your home',
                    'For electronics, test them before completing the transaction',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What to Avoid */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  What to Avoid
                </h2>
                <div className="bg-red-50 rounded-2xl p-8">
                  <div className="space-y-4">
                    {[
                      'Meeting at your home or the other person\'s home',
                      'Meeting late at night in isolated areas',
                      'Sharing your home address or personal details',
                      'Wiring money or paying before seeing the item',
                      'Going alone for high-value transactions',
                      'Rushing through the transaction without proper inspection',
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Report Issues */}
              <div className="text-center py-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Had a Bad Experience?</h3>
                <p className="text-gray-600 mb-4">
                  If something went wrong during a transaction, please let us know.
                </p>
                <Link
                  href="/report"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Report an Issue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


