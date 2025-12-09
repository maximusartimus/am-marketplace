'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface CountryCode {
  code: string;
  flag: string;
  name: string;
}

interface Country {
  flag: string;
  name: string;
}

const countryCodes: CountryCode[] = [
  // Top 5 countries (shown first)
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  // All other countries (alphabetical order)
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+36', flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+98', flag: '🇮🇷', name: 'Iran' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+48', flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+40', flag: '🇷🇴', name: 'Romania' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
];

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

interface CountryCodeSelectorProps {
  value: string;
  onChange: (code: string) => void;
  id: string;
}

function CountryCodeSelector({ value, onChange, id }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countryCodes.find(c => c.code === value) || countryCodes[0];

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.code.includes(search)
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
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-3 py-3 border border-r-0 border-[#E5E5E5] bg-[#F5F5F5] text-[#222222] text-sm hover:bg-[#E5E5E5] transition-colors min-w-[100px] justify-between"
      >
        <span className="flex items-center gap-1">
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.code}</span>
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-[#E5E5E5] shadow-lg z-50 max-h-64 overflow-hidden">
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
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-[#F5F5F5] flex items-center gap-2 ${
                    country.code === value ? 'bg-[#F5F5F5] font-medium' : ''
                  }`}
                >
                  <span>{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  <span className="text-[#757575]">{country.code}</span>
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

interface CountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
  id: string;
}

function CountrySelector({ value, onChange, id }: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countries.find(c => c.name === value) || countries[0];

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
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-[#E5E5E5] bg-white text-[#222222] text-left flex items-center justify-between hover:border-[#222222] transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{selectedCountry.flag}</span>
          <span>{selectedCountry.name}</span>
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

interface StoreFormData {
  // Step 1: Store basics
  name: string;
  description: string;
  logoFile: File | null;
  bannerFile: File | null;
  
  // Step 2: Contact info
  phone: string;
  phoneCountryCode: string;
  telegram: string;
  instagram: string;
  whatsapp: string;
  whatsappCountryCode: string;
  
  // Step 3: Location
  country: string;
  region: string;
  address: string;
}

const initialFormData: StoreFormData = {
  name: '',
  description: '',
  logoFile: null,
  bannerFile: null,
  phone: '',
  phoneCountryCode: '+374',
  telegram: '',
  instagram: '',
  whatsapp: '',
  whatsappCountryCode: '+374',
  country: 'Armenia',
  region: '',
  address: '',
};

const armenianRegions = [
  'Yerevan',
  'Aragatsotn',
  'Ararat',
  'Armavir',
  'Gegharkunik',
  'Kotayk',
  'Lori',
  'Shirak',
  'Syunik',
  'Tavush',
  'Vayots Dzor',
];

const steps = [
  { number: 1, title: 'Store Basics', description: 'Name and description' },
  { number: 2, title: 'Contact Info', description: 'How buyers can reach you' },
  { number: 3, title: 'Location', description: 'Where you\'re based' },
  { number: 4, title: 'Review', description: 'Confirm your details' },
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function CreateStoreForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const updateField = (field: keyof StoreFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          setError('Store name is required');
          return false;
        }
        if (formData.name.trim().length < 3) {
          setError('Store name must be at least 3 characters');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Store description is required');
          return false;
        }
        if (formData.description.trim().length < 20) {
          setError('Description must be at least 20 characters');
          return false;
        }
        break;
      case 2:
        // At least one contact method required
        if (!formData.phone && !formData.telegram && !formData.instagram && !formData.whatsapp) {
          setError('Please provide at least one contact method');
          return false;
        }
        break;
      case 3:
        if (!formData.country) {
          setError('Country is required');
          return false;
        }
        if (formData.country === 'Armenia' && !formData.region) {
          setError('Region is required');
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const uploadImage = async (file: File, folder: string, storeSlug: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${storeSlug}-${folder}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('store-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error(`Error uploading ${folder}:`, uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('store-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to create a store');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const slug = generateSlug(formData.name);
      
      // Check if slug already exists
      const { data: existingStore } = await supabase
        .from('stores')
        .select('slug')
        .eq('slug', slug)
        .single();

      const finalSlug = existingStore 
        ? `${slug}-${Date.now().toString(36)}`
        : slug;

      // Upload images if provided
      let logoUrl: string | null = null;
      let bannerUrl: string | null = null;

      if (formData.logoFile) {
        logoUrl = await uploadImage(formData.logoFile, 'logos', finalSlug);
      }

      if (formData.bannerFile) {
        bannerUrl = await uploadImage(formData.bannerFile, 'banners', finalSlug);
      }

      // Combine country code with phone number for storage
      const fullPhone = formData.phone.trim() 
        ? `${formData.phoneCountryCode}${formData.phone.trim()}`
        : null;
      const fullWhatsapp = formData.whatsapp.trim()
        ? `${formData.whatsappCountryCode}${formData.whatsapp.trim()}`
        : null;

      const { data, error: insertError } = await supabase
        .from('stores')
        .insert({
          user_id: user.id,
          name: formData.name.trim(),
          slug: finalSlug,
          description_en: formData.description.trim(),
          logo: logoUrl,
          banner_image: bannerUrl,
          phone: fullPhone,
          telegram_handle: formData.telegram.trim() || null,
          instagram_handle: formData.instagram.trim() || null,
          whatsapp_number: fullWhatsapp,
          location_country: formData.country,
          location_region: formData.country === 'Armenia' ? formData.region : null,
          location_address: formData.address.trim() || null,
          approval_status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating store:', insertError);
        if (insertError.code === '23505') {
          setError('You already have a store. Each user can only have one store.');
        } else {
          setError(insertError.message || 'Failed to create store. Please try again.');
        }
        return;
      }

      // Redirect to the store page
      router.push(`/store/${finalSlug}?created=true`);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link href="/" className="text-[#757575] hover:text-[#222222] text-sm mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to marketplace
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Create Your Store</h1>
          <p className="text-[#757575] mt-2">Set up your store and start selling on AM Marketplace</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.number
                        ? 'bg-[#2E7D32] text-white'
                        : currentStep === step.number
                        ? 'bg-[#222222] text-white'
                        : 'bg-[#E5E5E5] text-[#757575]'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="hidden md:block text-center mt-2">
                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-[#222222]' : 'text-[#757575]'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-[#757575]">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-[#2E7D32]' : 'bg-[#E5E5E5]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="md:hidden text-center mt-4">
            <p className="text-sm font-medium text-[#222222]">{steps[currentStep - 1].title}</p>
            <p className="text-xs text-[#757575]">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-[#E5E5E5] p-6 md:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Store Basics */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#222222] mb-2">
                  Store Name <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Ararat Handmade Crafts"
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                  maxLength={100}
                />
                <p className="text-xs text-[#757575] mt-1">
                  Choose a unique name that represents your brand ({formData.name.length}/100)
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#222222] mb-2">
                  Store Description <span className="text-[#D32F2F]">*</span>
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Tell customers about your store, what you sell, and what makes your products special..."
                  rows={5}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575] resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-[#757575] mt-1">
                  Minimum 20 characters ({formData.description.length}/1000)
                </p>
              </div>

              {/* Store Images */}
              <div className="pt-4 border-t border-[#E5E5E5]">
                <h3 className="text-sm font-medium text-[#222222] mb-4">Store Images</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ImageUpload
                    label="Store Logo"
                    description="Displayed in a circle on your store page"
                    recommendedSize="400 × 400px"
                    aspectRatio="square"
                    value={formData.logoFile}
                    onChange={(file) => updateField('logoFile', file)}
                  />
                  <div>
                    <ImageUpload
                      label="Store Banner"
                      description="Wide image at the top of your store page"
                      recommendedSize="1200 × 300px"
                      aspectRatio="banner"
                      value={formData.bannerFile}
                      onChange={(file) => updateField('bannerFile', file)}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#757575] mt-3">
                  Images are optional but recommended. Max file size: 5MB. Supported formats: JPG, PNG, WebP
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-sm text-[#757575] mb-4">
                Add at least one way for buyers to contact you. All fields are optional but at least one is required.
              </p>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#222222] mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <CountryCodeSelector
                    id="phoneCountryCode"
                    value={formData.phoneCountryCode}
                    onChange={(code) => updateField('phoneCountryCode', code)}
                  />
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                    placeholder="Phone number"
                    className="flex-1 px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telegram" className="block text-sm font-medium text-[#222222] mb-2">
                  Telegram
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 border border-r-0 border-[#E5E5E5] bg-[#F5F5F5] text-[#757575] text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => updateField('telegram', e.target.value.replace(/^@/, ''))}
                    placeholder="username"
                    className="flex-1 px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-[#222222] mb-2">
                  Instagram
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 border border-r-0 border-[#E5E5E5] bg-[#F5F5F5] text-[#757575] text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => updateField('instagram', e.target.value.replace(/^@/, ''))}
                    placeholder="username"
                    className="flex-1 px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-[#222222] mb-2">
                  WhatsApp
                </label>
                <div className="flex">
                  <CountryCodeSelector
                    id="whatsappCountryCode"
                    value={formData.whatsappCountryCode}
                    onChange={(code) => updateField('whatsappCountryCode', code)}
                  />
                  <input
                    type="tel"
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => updateField('whatsapp', e.target.value.replace(/\D/g, ''))}
                    placeholder="Phone number"
                    className="flex-1 px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-[#222222] mb-2">
                  Country <span className="text-[#D32F2F]">*</span>
                </label>
                <CountrySelector
                  id="country"
                  value={formData.country}
                  onChange={(country) => {
                    updateField('country', country);
                    // Reset Armenia-specific fields when switching countries
                    if (country !== 'Armenia') {
                      updateField('region', '');
                    }
                  }}
                />
              </div>

              {formData.country === 'Armenia' && (
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-[#222222] mb-2">
                    Region <span className="text-[#D32F2F]">*</span>
                  </label>
                  <select
                    id="region"
                    value={formData.region}
                    onChange={(e) => updateField('region', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] bg-white"
                  >
                    <option value="">Select a region</option>
                    {armenianRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-[#222222] mb-2">
                  Address <span className="text-[#757575] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder={formData.country === 'Armenia' ? "e.g., Yerevan, Northern Avenue 5" : "e.g., 123 Main Street, City, State"}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                />
                <p className="text-xs text-[#757575] mt-1">
                  {formData.country === 'Armenia' 
                    ? "Include city, street, and any other details"
                    : "Only the country name will be displayed on your storefront"}
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-[#F5F5F5] p-6">
                <h3 className="font-semibold text-[#222222] mb-4">Store Details</h3>
                
                <div className="space-y-4">
                  {/* Image Previews */}
                  {(formData.logoFile || formData.bannerFile) && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {formData.logoFile && (
                        <div>
                          <p className="text-xs text-[#757575] uppercase tracking-wide mb-2">Logo</p>
                          <div className="w-16 h-16 rounded-full overflow-hidden border border-[#E5E5E5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(formData.logoFile)}
                              alt="Logo preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                      {formData.bannerFile && (
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-xs text-[#757575] uppercase tracking-wide mb-2">Banner</p>
                          <div className="h-16 overflow-hidden border border-[#E5E5E5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={URL.createObjectURL(formData.bannerFile)}
                              alt="Banner preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-[#757575] uppercase tracking-wide">Store Name</p>
                    <p className="text-[#222222] font-medium">{formData.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-[#757575] uppercase tracking-wide">Description</p>
                    <p className="text-[#222222]">{formData.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-[#757575] uppercase tracking-wide">Location</p>
                    <p className="text-[#222222]">
                      {formData.country === 'Armenia' ? (
                        <>
                          {formData.region}, {formData.country}
                          {formData.address && ` • ${formData.address}`}
                        </>
                      ) : (
                        <>
                          {countries.find(c => c.name === formData.country)?.flag} {formData.country}
                        </>
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-[#757575] uppercase tracking-wide">Contact Methods</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.phone && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-sm text-[#222222]">
                          📞 {formData.phoneCountryCode}{formData.phone}
                        </span>
                      )}
                      {formData.telegram && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-sm text-[#222222]">
                          ✈️ @{formData.telegram}
                        </span>
                      )}
                      {formData.instagram && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-sm text-[#222222]">
                          📷 @{formData.instagram}
                        </span>
                      )}
                      {formData.whatsapp && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white text-sm text-[#222222]">
                          💬 {formData.whatsappCountryCode}{formData.whatsapp}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF3E0] border border-[#F56400] p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-[#F56400] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-[#222222] font-medium">Store Approval Required</p>
                    <p className="text-sm text-[#757575] mt-1">
                      Your store will be reviewed by our team before it goes live. This usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[#E5E5E5]">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-6 py-3 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-[#222222] hover:bg-[#333333] text-white font-medium transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#E5E5E5] disabled:text-[#757575] text-white font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Store...
                  </>
                ) : (
                  'Create Store'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#757575]">
            Need help? <Link href="/help" className="text-[#222222] hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CreateStorePage() {
  return (
    <ProtectedRoute>
      <CreateStoreForm />
    </ProtectedRoute>
  );
}
