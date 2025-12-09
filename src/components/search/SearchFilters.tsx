'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name_en: string;
  slug: string;
}

interface SearchFiltersProps {
  onApplyFilters: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
  showCategoryFilter?: boolean;
}

export interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  currency: 'AMD' | 'USD';
  conditions: string[];
  country: string;
}

interface Country {
  flag: string;
  name: string;
}

// Same country list as store creation form
const countries: Country[] = [
  // Top 5 countries (shown first)
  { flag: '🇦🇲', name: 'Armenia' },
  { flag: '🇷🇺', name: 'Russia' },
  { flag: '🇺🇸', name: 'USA/Canada' },
  { flag: '🇫🇷', name: 'France' },
  { flag: '🇩🇪', name: 'Germany' },
  // All other countries (alphabetical order)
  { flag: '🇦🇹', name: 'Austria' },
  { flag: '🇧🇾', name: 'Belarus' },
  { flag: '🇧🇪', name: 'Belgium' },
  { flag: '🇧🇬', name: 'Bulgaria' },
  { flag: '🇭🇷', name: 'Croatia' },
  { flag: '🇨🇾', name: 'Cyprus' },
  { flag: '🇨🇿', name: 'Czech Republic' },
  { flag: '🇩🇰', name: 'Denmark' },
  { flag: '🇪🇪', name: 'Estonia' },
  { flag: '🇫🇮', name: 'Finland' },
  { flag: '🇬🇪', name: 'Georgia' },
  { flag: '🇬🇷', name: 'Greece' },
  { flag: '🇭🇺', name: 'Hungary' },
  { flag: '🇮🇸', name: 'Iceland' },
  { flag: '🇮🇷', name: 'Iran' },
  { flag: '🇮🇪', name: 'Ireland' },
  { flag: '🇮🇹', name: 'Italy' },
  { flag: '🇱🇻', name: 'Latvia' },
  { flag: '🇱🇧', name: 'Lebanon' },
  { flag: '🇱🇹', name: 'Lithuania' },
  { flag: '🇱🇺', name: 'Luxembourg' },
  { flag: '🇲🇹', name: 'Malta' },
  { flag: '🇲🇩', name: 'Moldova' },
  { flag: '🇲🇪', name: 'Montenegro' },
  { flag: '🇳🇱', name: 'Netherlands' },
  { flag: '🇲🇰', name: 'North Macedonia' },
  { flag: '🇳🇴', name: 'Norway' },
  { flag: '🇵🇱', name: 'Poland' },
  { flag: '🇵🇹', name: 'Portugal' },
  { flag: '🇷🇴', name: 'Romania' },
  { flag: '🇷🇸', name: 'Serbia' },
  { flag: '🇸🇰', name: 'Slovakia' },
  { flag: '🇸🇮', name: 'Slovenia' },
  { flag: '🇪🇸', name: 'Spain' },
  { flag: '🇸🇪', name: 'Sweden' },
  { flag: '🇨🇭', name: 'Switzerland' },
  { flag: '🇹🇷', name: 'Turkey' },
  { flag: '🇦🇪', name: 'UAE' },
  { flag: '🇺🇦', name: 'Ukraine' },
  { flag: '🇬🇧', name: 'United Kingdom' },
];

const conditionOptions = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'used', label: 'Used' },
  { value: 'parts', label: 'For Parts' },
];

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
}

function CountrySelector({ value, onChange }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = value ? countries.find(c => c.name === value) : null;

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-[#E5E5E5] bg-white text-[#222222] text-sm text-left flex items-center justify-between hover:border-[#222222] transition-colors focus:outline-none focus:border-[#222222]"
      >
        <span className="flex items-center gap-2">
          {selectedCountry ? (
            <>
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-[#757575]">All Countries</span>
          )}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E5E5] shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-2 border-b border-[#E5E5E5]">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full px-3 py-2 border border-[#E5E5E5] text-sm focus:border-[#222222] focus:outline-none"
            />
          </div>
          <div className="overflow-y-auto max-h-48">
            {/* All Countries option */}
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
                setSearch('');
              }}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-[#F5F5F5] flex items-center gap-2 ${
                !value ? 'bg-[#F5F5F5] font-medium' : ''
              }`}
            >
              <span className="text-[#757575]">🌍</span>
              <span className="flex-1">All Countries</span>
            </button>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.name}
                  type="button"
                  onClick={() => {
                    onChange(country.name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#F5F5F5] flex items-center gap-2 ${
                    country.name === value ? 'bg-[#F5F5F5] font-medium' : ''
                  }`}
                >
                  <span>{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-[#757575] text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchFilters({ onApplyFilters, initialFilters, showCategoryFilter = true }: SearchFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: initialFilters?.category || '',
    minPrice: initialFilters?.minPrice || '',
    maxPrice: initialFilters?.maxPrice || '',
    currency: initialFilters?.currency || 'AMD',
    conditions: initialFilters?.conditions || [],
    country: initialFilters?.country || '',
  });
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch categories from Supabase
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name_en, slug')
        .order('position', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    }

    if (showCategoryFilter) {
      fetchCategories();
    }
  }, [showCategoryFilter]);

  // Update filters when initialFilters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
      }));
    }
  }, [initialFilters]);

  const handleConditionChange = (condition: string) => {
    setFilters(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition],
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      category: showCategoryFilter ? '' : filters.category,
      minPrice: '',
      maxPrice: '',
      currency: 'AMD',
      conditions: [],
      country: '',
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div className="bg-white border border-[#E5E5E5]">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 border-b border-[#E5E5E5] md:cursor-default"
      >
        <h3 className="font-medium text-[#222222]">Filters</h3>
        <svg
          className={`w-5 h-5 text-[#757575] md:hidden transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
        {/* Category */}
        {showCategoryFilter && (
          <div className="p-4 border-b border-[#E5E5E5]">
            <label className="block text-sm font-medium text-[#222222] mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#222222]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name_en}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range with Currency Toggle */}
        <div className="p-4 border-b border-[#E5E5E5]">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[#222222]">Price Range</label>
            {/* Currency Toggle */}
            <div className="flex items-center bg-[#F5F5F5] rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, currency: 'AMD' }))}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  filters.currency === 'AMD'
                    ? 'bg-[#222222] text-white'
                    : 'text-[#757575] hover:text-[#222222]'
                }`}
              >
                AMD
              </button>
              <button
                type="button"
                onClick={() => setFilters(prev => ({ ...prev, currency: 'USD' }))}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  filters.currency === 'USD'
                    ? 'bg-[#222222] text-white'
                    : 'text-[#757575] hover:text-[#222222]'
                }`}
              >
                USD
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] text-sm">
                {filters.currency === 'AMD' ? '֏' : '$'}
              </span>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full pl-7 pr-3 py-2 border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#222222]"
                min="0"
              />
            </div>
            <span className="text-[#757575]">—</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575] text-sm">
                {filters.currency === 'AMD' ? '֏' : '$'}
              </span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full pl-7 pr-3 py-2 border border-[#E5E5E5] text-sm focus:outline-none focus:border-[#222222]"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Condition */}
        <div className="p-4 border-b border-[#E5E5E5]">
          <label className="block text-sm font-medium text-[#222222] mb-2">Condition</label>
          <div className="space-y-2">
            {conditionOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.conditions.includes(option.value)}
                  onChange={() => handleConditionChange(option.value)}
                  className="w-4 h-4 text-[#222222] border-[#E5E5E5] rounded focus:ring-[#222222]"
                />
                <span className="text-sm text-[#222222]">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Country */}
        <div className="p-4 border-b border-[#E5E5E5]">
          <label className="block text-sm font-medium text-[#222222] mb-2">Country</label>
          <CountrySelector
            value={filters.country}
            onChange={(country) => setFilters(prev => ({ ...prev, country }))}
          />
        </div>

        {/* Buttons */}
        <div className="p-4 space-y-2">
          <button
            onClick={handleApply}
            className="w-full py-2.5 bg-[#222222] hover:bg-[#333333] text-white text-sm font-medium transition-colors"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="w-full py-2.5 border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#222222] text-sm font-medium transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
