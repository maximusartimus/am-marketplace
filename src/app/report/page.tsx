'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ReportPage() {
  const [category, setCategory] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Report an Issue
              </h1>
              <p className="text-xl text-gray-600">
                Help us keep AM Marketplace safe by reporting problems you encounter.
              </p>
            </div>
          </div>
        </section>

        {/* Report Form Section */}
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">What would you like to report?</h2>
                <p className="text-gray-600">
                  Select a category and provide details so we can investigate and take appropriate action.
                </p>
              </div>

              <form className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Issue Category
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'listing', label: 'Listing Issue', icon: '📋', desc: 'Fake, inappropriate, or misleading listing' },
                      { value: 'user', label: 'User Issue', icon: '👤', desc: 'Suspicious or problematic user behavior' },
                      { value: 'technical', label: 'Technical Issue', icon: '🔧', desc: 'Bug, error, or site malfunction' },
                      { value: 'other', label: 'Other', icon: '💬', desc: 'Something else not listed above' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCategory(option.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          category === option.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">{option.icon}</div>
                        <div className="font-semibold text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listing URL (conditional) */}
                {category === 'listing' && (
                  <div>
                    <label htmlFor="listingUrl" className="block text-sm font-medium text-gray-700 mb-2">
                      Listing URL (if applicable)
                    </label>
                    <input
                      type="url"
                      id="listingUrl"
                      name="listingUrl"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="https://ammarketplace.am/listing/..."
                    />
                  </div>
                )}

                {/* Username (conditional) */}
                {category === 'user' && (
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username or Profile URL
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Username or profile link"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">So we can follow up if needed</p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the Issue
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Please provide as much detail as possible about what you experienced..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Submit Report
                </button>
              </form>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Our team will review your report within 24-48 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    We&apos;ll take appropriate action based on our community guidelines
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    You may receive a follow-up email if we need more information
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

