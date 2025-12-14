import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function HelpPage() {
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      questions: [
        { q: 'How do I create an account?', a: 'Click "Sign Up" in the top right corner and follow the simple registration process. You can sign up with your email address.' },
        { q: 'How do I browse listings?', a: 'You can browse by category from the homepage, use the search bar, or explore featured listings. No account needed to browse!' },
        { q: 'Is AM Marketplace free to use?', a: 'Yes! Creating an account, browsing listings, and contacting sellers is completely free.' },
      ],
    },
    {
      title: 'Buying',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      questions: [
        { q: 'How do I contact a seller?', a: 'Click the "Contact Seller" button on any listing to send a message. You\'ll need to be logged in to message sellers.' },
        { q: 'How do I make a purchase?', a: 'AM Marketplace connects buyers and sellers. After contacting a seller, you\'ll arrange payment and pickup directly with them.' },
        { q: 'Can I save listings for later?', a: 'Yes! Click the heart icon on any listing to add it to your favorites. Access your favorites from your account page.' },
      ],
    },
    {
      title: 'Selling',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      questions: [
        { q: 'How do I create a listing?', a: 'Go to "Create Listing" from the navigation menu. Add photos, write a description, set your price, and publish!' },
        { q: 'How much does it cost to sell?', a: 'Listing items on AM Marketplace is free. We don\'t charge any fees for selling.' },
        { q: 'How do I edit or delete my listing?', a: 'Go to your account, find the listing you want to change, and click "Edit" or "Delete".' },
      ],
    },
    {
      title: 'Account & Safety',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      questions: [
        { q: 'How do I change my password?', a: 'Go to Account Settings and click "Change Password". You\'ll need to enter your current password to set a new one.' },
        { q: 'How do I report a suspicious listing?', a: 'Click the "Report" button on any listing, or visit our Report an Issue page to submit a detailed report.' },
        { q: 'What if I have a problem with a transaction?', a: 'Contact us immediately through our Contact page. Provide details about the listing and the issue you experienced.' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Help Center
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Find answers to common questions and learn how to get the most out of AM Marketplace.
              </p>
              
              {/* Quick Links */}
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/faqs"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  View All FAQs
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8">
              {helpCategories.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      {category.icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    {category.questions.map((item, qIndex) => (
                      <div key={qIndex} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                        <p className="text-gray-600 text-sm">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Need Help */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still Need Help?
              </h2>
              <p className="text-gray-600 mb-8">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </Link>
                <Link
                  href="/report"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Report an Issue
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


