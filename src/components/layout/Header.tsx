'use client';

import { useState } from 'react';
import Link from 'next/link';

const languages = [
  { code: 'hy', label: 'Հայ', flag: '🇦🇲' },
  { code: 'ru', label: 'Рус', flag: '🇷🇺' },
  { code: 'en', label: 'Eng', flag: '🇬🇧' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D4D4D4]">
      {/* Top bar - hidden on mobile */}
      <div className="hidden md:block bg-[#F5F5F5] py-2">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-sm text-[#595959]">
          <div className="flex gap-4">
            <span>🇦🇲 Armenia&apos;s Marketplace</span>
          </div>
          <div className="flex gap-4">
            <Link href="/sell" className="hover:text-[#F56400] transition-colors">
              Start Selling
            </Link>
            <span>•</span>
            <Link href="/help" className="hover:text-[#F56400] transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -ml-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#F56400] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AM</span>
              </div>
              <span className="hidden sm:block text-xl font-bold text-[#222222]">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Search bar - desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full border-2 border-[#222222] rounded-full overflow-hidden focus-within:border-[#F56400] transition-colors">
              <input
                type="text"
                placeholder="Search for anything..."
                className="flex-1 px-6 py-3 focus:outline-none text-[#222222] placeholder-[#757575]"
              />
              <button className="bg-[#F56400] hover:bg-[#D95700] px-6 text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-[#F5F5F5] transition-colors text-sm font-medium"
              >
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline">{currentLang.label}</span>
                <svg className="w-4 h-4 text-[#595959]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-[#D4D4D4] py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-[#F5F5F5] flex items-center gap-2 ${
                        currentLang.code === lang.code ? 'text-[#F56400] font-medium' : 'text-[#222222]'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorites - desktop */}
            <Link
              href="/favorites"
              className="hidden md:flex items-center gap-1 px-3 py-2 rounded-full hover:bg-[#F5F5F5] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </Link>

            {/* Login button */}
            <Link
              href="/login"
              className="bg-[#F56400] hover:bg-[#D95700] text-white font-semibold py-2.5 px-5 rounded-full transition-colors text-sm md:text-base"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="md:hidden mt-4">
          <div className="flex w-full border-2 border-[#222222] rounded-full overflow-hidden focus-within:border-[#F56400] transition-colors">
            <input
              type="text"
              placeholder="Search for anything..."
              className="flex-1 px-4 py-2.5 focus:outline-none text-[#222222] placeholder-[#757575] text-sm"
            />
            <button className="bg-[#F56400] hover:bg-[#D95700] px-4 text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#D4D4D4] bg-white">
          <nav className="max-w-[1400px] mx-auto px-4 py-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/categories"
                  className="block py-3 px-4 rounded-lg hover:bg-[#F5F5F5] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  All Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="block py-3 px-4 rounded-lg hover:bg-[#F5F5F5] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Start Selling
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="block py-3 px-4 rounded-lg hover:bg-[#F5F5F5] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Favorites
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="block py-3 px-4 rounded-lg hover:bg-[#F5F5F5] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Help & Support
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

