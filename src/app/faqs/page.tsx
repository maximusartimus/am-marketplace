'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'What is AM Marketplace?',
    answer: 'AM Marketplace is Armenia\'s premier online marketplace where you can buy and sell a wide variety of items. We connect local buyers and sellers, making it easy to find great deals and reach customers in your community.',
  },
  {
    question: 'Is it free to use AM Marketplace?',
    answer: 'Yes! Creating an account, browsing listings, and posting items for sale is completely free. We believe in making local commerce accessible to everyone.',
  },
  {
    question: 'How do I create a listing?',
    answer: 'Simply sign in to your account, click "Create Listing" in the navigation menu, add clear photos of your item, write a detailed description, set your price, and publish. Your listing will be visible to buyers immediately.',
  },
  {
    question: 'How do I contact a seller?',
    answer: 'On any listing page, click the "Contact Seller" button to send a message. You\'ll need to be signed in to message sellers. Once connected, you can discuss details, ask questions, and arrange a meetup.',
  },
  {
    question: 'How do payments work?',
    answer: 'AM Marketplace connects buyers and sellers, but payments are handled directly between you and the other party. We recommend meeting in person and using cash for most transactions, or a secure payment method you both agree on.',
  },
  {
    question: 'Is it safe to buy and sell on AM Marketplace?',
    answer: 'We take safety seriously. We recommend meeting in public places, bringing a friend for larger transactions, and trusting your instincts. Check out our Trust & Safety page and Safe Meetup Spots guide for detailed tips.',
  },
  {
    question: 'How do I report a suspicious listing or user?',
    answer: 'If you see something suspicious, click the "Report" button on the listing or user profile, or visit our Report an Issue page. Our team reviews all reports and takes appropriate action to keep the marketplace safe.',
  },
  {
    question: 'Can I edit or delete my listing after posting?',
    answer: 'Yes! Go to your account page, find the listing you want to modify, and click "Edit" to update details or "Delete" to remove it entirely. Changes take effect immediately.',
  },
  {
    question: 'How do I change my account settings?',
    answer: 'Sign in to your account and navigate to Account Settings. From there, you can update your profile information, change your password, manage notification preferences, and more.',
  },
  {
    question: 'What should I do if I have a problem with a transaction?',
    answer: 'If something goes wrong, first try to resolve it directly with the other party. If that doesn\'t work, contact our support team through the Contact page with details about the issue. We\'re here to help.',
  },
];

function FAQItem({ faq, isOpen, onClick }: { faq: FAQ; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left hover:text-blue-600 transition-colors"
      >
        <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-6">
          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600">
                Quick answers to the most common questions about using AM Marketplace.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="bg-white rounded-2xl border border-gray-200 px-8">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  isOpen={openIndex === index}
                  onClick={() => handleClick(index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Still Have Questions */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Still Have Questions?
              </h2>
              <p className="text-gray-600 mb-8">
                Can&apos;t find the answer you&apos;re looking for? Our support team is happy to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help Center
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
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

