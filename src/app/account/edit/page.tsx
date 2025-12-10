'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';

interface CountryCode {
  code: string;
  flag: string;
  name: string;
}

interface Country {
  flag: string;
  name: string;
}

// Top 5 countries first, then rest alphabetically
const topCountryCodes: CountryCode[] = [
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
];

const otherCountryCodes: CountryCode[] = [
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
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
].sort((a, b) => a.name.localeCompare(b.name));

const countryCodes = [...topCountryCodes, ...otherCountryCodes];

// Top 5 countries first, then rest alphabetically
const topCountries: Country[] = [
  { flag: '🇦🇲', name: 'Armenia' },
  { flag: '🇷🇺', name: 'Russia' },
  { flag: '🇺🇸', name: 'USA' },
  { flag: '🇫🇷', name: 'France' },
  { flag: '🇩🇪', name: 'Germany' },
];

const otherCountries: Country[] = [
  { flag: '🇦🇹', name: 'Austria' },
  { flag: '🇧🇾', name: 'Belarus' },
  { flag: '🇧🇪', name: 'Belgium' },
  { flag: '🇧🇬', name: 'Bulgaria' },
  { flag: '🇨🇦', name: 'Canada' },
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
].sort((a, b) => a.name.localeCompare(b.name));

const countries = [...topCountries, ...otherCountries];

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

const languageOptions = [
  { value: 'Armenian', label: 'Armenian' },
  { value: 'Russian', label: 'Russian' },
  { value: 'English', label: 'English' },
];

interface FormData {
  name: string;
  phone: string;
  phone_country_code: string;
  country: string;
  location_region: string;
  address: string;
  language_preference: string;
  profile_photo: string | null;
}

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
              filteredCountries.map((country, index) => (
                <button
                  key={`${country.code}-${index}`}
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

function EditProfileForm() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    phone_country_code: '+374',
    country: 'Armenia',
    location_region: '',
    address: '',
    language_preference: 'English',
    profile_photo: null,
  });

  // Fetch current user data
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, phone, phone_country_code, country, location_region, address, language_preference, profile_photo')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setError('Failed to load profile');
        } else if (data) {
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
            phone_country_code: data.phone_country_code || '+374',
            country: data.country || 'Armenia',
            location_region: data.location_region || '',
            address: data.address || '',
            language_preference: data.language_preference || 'English',
            profile_photo: data.profile_photo || null,
          });
          if (data.profile_photo) {
            setPhotoPreview(data.profile_photo);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase storage
      const filePath = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError('Failed to upload photo');
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update form state (NOT database yet)
      setFormData(prev => ({
        ...prev,
        profile_photo: publicUrl,
      }));
    } catch (err) {
      console.error('Photo upload failed:', err);
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          phone_country_code: formData.phone_country_code,
          country: formData.country,
          location_region: formData.country === 'Armenia' ? formData.location_region : null,
          address: formData.address,
          language_preference: formData.language_preference,
          profile_photo: formData.profile_photo,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Update error:', error);
        setError(error.message);
      } else {
        router.push('/account');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#222222] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-[#757575]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link 
            href="/account" 
            className="text-[#757575] hover:text-[#222222] text-sm mb-4 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to account
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#222222]">Edit Profile</h1>
          <p className="text-[#757575] mt-1">Update your profile information</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#FFEBEE] border border-[#D32F2F] text-[#D32F2F] text-sm">
            {error}
          </div>
        )}

        {/* Profile Photo */}
        <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-[#222222] mb-6">Profile Photo</h2>
          
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Profile preview"
                  fill
                  className="object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-[#F5F5F5] rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#757575]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-[#E5E5E5] text-[#222222] hover:bg-[#F5F5F5] transition-colors text-sm disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <p className="text-xs text-[#757575] mt-2">
                Max size: 5MB. JPG, PNG, WebP supported.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-[#222222] mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#222222] mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#222222] mb-2">
                Phone Number
              </label>
              <div className="flex">
                <CountryCodeSelector
                  id="phoneCountryCode"
                  value={formData.phone_country_code}
                  onChange={(code) => setFormData(prev => ({ ...prev, phone_country_code: code }))}
                />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Phone number"
                  className="flex-1 px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575]"
                  maxLength={15}
                />
              </div>
              <p className="text-xs text-[#757575] mt-1">
                Enter phone number without country code
              </p>
            </div>

            {/* Language Preference */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-[#222222] mb-2">
                Language Preference
              </label>
              <select
                id="language"
                value={formData.language_preference}
                onChange={(e) => setFormData(prev => ({ ...prev, language_preference: e.target.value }))}
                className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] bg-white"
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white border border-[#E5E5E5] p-6 md:p-8 mb-6">
          <h2 className="text-lg font-semibold text-[#222222] mb-6">Location</h2>
          
          <div className="space-y-6">
            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-[#222222] mb-2">
                Country
              </label>
              <CountrySelector
                id="country"
                value={formData.country}
                onChange={(country) => {
                  setFormData(prev => ({
                    ...prev,
                    country,
                    location_region: country !== 'Armenia' ? '' : prev.location_region,
                  }));
                }}
              />
            </div>

            {/* Region (only for Armenia) */}
            {formData.country === 'Armenia' && (
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-[#222222] mb-2">
                  Region
                </label>
                <select
                  id="region"
                  value={formData.location_region}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_region: e.target.value }))}
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

            {/* Address (shown when country is NOT Armenia) */}
            {formData.country !== 'Armenia' && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-[#222222] mb-2">
                  Address
                </label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Your address"
                  rows={3}
                  className="w-full px-4 py-3 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-[#222222] placeholder-[#757575] resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href="/account"
            className="flex-1 py-3 border border-[#E5E5E5] text-[#222222] text-center hover:bg-[#F5F5F5] transition-colors font-medium"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-[#F56400] hover:bg-[#D95700] disabled:bg-[#E5E5E5] disabled:text-[#757575] text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileForm />
    </ProtectedRoute>
  );
}


