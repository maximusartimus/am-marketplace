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
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+1', flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
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
  { flag: '🇦🇲', name: 'Armenia' },
  { flag: '🇷🇺', name: 'Russia' },
  { flag: '🇺🇸', name: 'USA/Canada' },
  { flag: '🇫🇷', name: 'France' },
  { flag: '🇩🇪', name: 'Germany' },
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

interface Store {
  id: string;
  slug: string;
  name: string;
  description_en: string | null;
  logo: string | null;
  banner_image: string | null;
  phone: string | null;
  telegram_handle: string | null;
  instagram_handle: string | null;
  whatsapp_number: string | null;
  location_country: string | null;
  location_region: string | null;
  location_address: string | null;
}

function parsePhoneNumber(fullNumber: string | null): { code: string; number: string } {
  if (!fullNumber) return { code: '+374', number: '' };
  
  // Try to match known country codes
  for (const cc of countryCodes) {
    if (fullNumber.startsWith(cc.code)) {
      return { code: cc.code, number: fullNumber.slice(cc.code.length) };
    }
  }
  
  return { code: '+374', number: fullNumber };
}

function EditStoreForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Delete store state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+374');
  const [telegram, setTelegram] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappCountryCode, setWhatsappCountryCode] = useState('+374');
  const [country, setCountry] = useState('Armenia');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');

  // Fetch store data
  useEffect(() => {
    async function fetchStore() {
      if (!user) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            // No active store found - redirect to create
            router.push('/store/create');
            return;
          }
          throw fetchError;
        }

        setStore(data);
        
        // Populate form fields
        setName(data.name || '');
        setDescription(data.description_en || '');
        setTelegram(data.telegram_handle || '');
        setInstagram(data.instagram_handle || '');
        setCountry(data.location_country || 'Armenia');
        setRegion(data.location_region || '');
        setAddress(data.location_address || '');
        
        // Parse phone numbers
        const parsedPhone = parsePhoneNumber(data.phone);
        setPhoneCountryCode(parsedPhone.code);
        setPhone(parsedPhone.number);
        
        const parsedWhatsapp = parsePhoneNumber(data.whatsapp_number);
        setWhatsappCountryCode(parsedWhatsapp.code);
        setWhatsapp(parsedWhatsapp.number);
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Failed to load store data');
      } finally {
        setLoading(false);
      }
    }

    fetchStore();
  }, [user, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !store) {
      setError('You must be logged in to edit your store');
      return;
    }

    // Validation
    if (!name.trim()) {
      setError('Store name is required');
      return;
    }
    if (name.trim().length < 3) {
      setError('Store name must be at least 3 characters');
      return;
    }
    if (!description.trim()) {
      setError('Store description is required');
      return;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }
    if (!phone && !telegram && !instagram && !whatsapp) {
      setError('Please provide at least one contact method');
      return;
    }
    if (!country) {
      setError('Country is required');
      return;
    }
    if (country === 'Armenia' && !region) {
      setError('Region is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Upload new images if provided
      let logoUrl = store.logo;
      let bannerUrl = store.banner_image;

      if (logoFile) {
        logoUrl = await uploadImage(logoFile, 'logos', store.slug);
      }

      if (bannerFile) {
        bannerUrl = await uploadImage(bannerFile, 'banners', store.slug);
      }

      // Combine country code with phone number
      const fullPhone = phone.trim() 
        ? `${phoneCountryCode}${phone.trim()}`
        : null;
      const fullWhatsapp = whatsapp.trim()
        ? `${whatsappCountryCode}${whatsapp.trim()}`
        : null;

      const { error: updateError } = await supabase
        .from('stores')
        .update({
          name: name.trim(),
          description_en: description.trim(),
          logo: logoUrl,
          banner_image: bannerUrl,
          phone: fullPhone,
          telegram_handle: telegram.trim() || null,
          instagram_handle: instagram.trim() || null,
          whatsapp_number: fullWhatsapp,
          location_country: country,
          location_region: country === 'Armenia' ? region : null,
          location_address: address.trim() || null,
        })
        .eq('id', store.id);

      if (updateError) {
        console.error('Error updating store:', updateError);
        setError(updateError.message || 'Failed to update store. Please try again.');
        return;
      }

      setSuccess(true);
      
      // Redirect to store page after short delay
      setTimeout(() => {
        router.push(`/store/${store.slug}`);
      }, 1500);
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStore = async () => {
    if (!user || !store) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const { error: deleteError } = await supabase
        .from('stores')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: user.id 
        })
        .eq('id', store.id);

      if (deleteError) {
        console.error('Error deleting store:', deleteError);
        setDeleteError('Failed to delete store. Please try again.');
        return;
      }

      // Redirect to account page with success message
      router.push('/account?store_deleted=true');
    } catch (err) {
      console.error('Unexpected error:', err);
      setDeleteError('An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-[#757575]">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link 
            href={`/store/${store.slug}`} 
            className="text-[#757575] hover:text-[#222222] text-sm mb-4 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to store
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Edit Store</h1>
          <p className="text-[#757575] mt-2">Update your store information</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-[#E8F5E9] border border-[#2E7D32] text-[#2E7D32] text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Store updated successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Store Basics */}
          <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-[#222222] mb-6">Store Basics</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#222222] mb-2">
                  Store Name <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ararat Handmade Crafts"
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                  maxLength={100}
                />
                <p className="text-xs text-[#757575] mt-1">
                  {name.length}/100 characters
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[#222222] mb-2">
                  Store Description <span className="text-[#D32F2F]">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your store..."
                  rows={5}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575] resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-[#757575] mt-1">
                  Minimum 20 characters ({description.length}/1000)
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
                    value={logoFile}
                    previewUrl={store.logo}
                    onChange={setLogoFile}
                  />
                  <div>
                    <ImageUpload
                      label="Store Banner"
                      description="Wide image at the top of your store page"
                      recommendedSize="1200 × 300px"
                      aspectRatio="banner"
                      value={bannerFile}
                      previewUrl={store.banner_image}
                      onChange={setBannerFile}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#757575] mt-3">
                  Max file size: 5MB. Supported formats: JPG, PNG, WebP
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-[#222222] mb-6">Contact Information</h2>
            <p className="text-sm text-[#757575] mb-4">
              At least one contact method is required.
            </p>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#222222] mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <CountryCodeSelector
                    id="phoneCountryCode"
                    value={phoneCountryCode}
                    onChange={setPhoneCountryCode}
                  />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value.replace(/^@/, ''))}
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
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
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
                    value={whatsappCountryCode}
                    onChange={setWhatsappCountryCode}
                  />
                  <input
                    type="tel"
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Phone number"
                    className="flex-1 px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-6">
            <h2 className="text-lg font-semibold text-[#222222] mb-6">Location</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-[#222222] mb-2">
                  Country <span className="text-[#D32F2F]">*</span>
                </label>
                <CountrySelector
                  id="country"
                  value={country}
                  onChange={(c) => {
                    setCountry(c);
                    if (c !== 'Armenia') setRegion('');
                  }}
                />
              </div>

              {country === 'Armenia' && (
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-[#222222] mb-2">
                    Region <span className="text-[#D32F2F]">*</span>
                  </label>
                  <select
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] bg-white"
                  >
                    <option value="">Select a region</option>
                    {armenianRegions.map((r) => (
                      <option key={r} value={r}>
                        {r}
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
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={country === 'Armenia' ? "e.g., Yerevan, Northern Avenue 5" : "e.g., 123 Main Street, City"}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/store/${store.slug}`}
              className="px-6 py-3 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#E5E5E5] disabled:text-[#757575] text-white font-medium transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

        {/* Danger Zone - Delete Store */}
        <div className="bg-white border border-[#D32F2F] p-6 md:p-8 mt-6">
          <h2 className="text-lg font-semibold text-[#D32F2F] mb-4">Danger Zone</h2>
          <p className="text-sm text-[#757575] mb-4">
            Deleting your store will remove it from the marketplace. All your listings will also be hidden. This action can be reversed by contacting support.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-6 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-medium transition-colors"
          >
            Delete Store
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-[#222222] mb-4">Delete Store</h3>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 p-4 bg-[#FFEBEE] border border-[#D32F2F] mb-4">
                  <svg className="w-6 h-6 text-[#D32F2F] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#D32F2F]">Warning</p>
                    <p className="text-sm text-[#D32F2F]">This will remove your store and all listings from the marketplace.</p>
                  </div>
                </div>
                
                <p className="text-sm text-[#595959]">
                  Are you sure you want to delete <strong>{store.name}</strong>? 
                </p>
              </div>

              {deleteError && (
                <div className="mb-4 p-3 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStore}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete Store'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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

export default function EditStorePage() {
  return (
    <ProtectedRoute>
      <EditStoreForm />
    </ProtectedRoute>
  );
}





