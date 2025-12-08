# Armenian Marketplace - Complete Project Specification

## Project Overview

**Project Name:** Armenian Marketplace (working title - needs Armenian branding)

**Mission:** Build a modern, fast, Etsy-inspired online marketplace specifically for the Armenian market in Armenia. This platform will compete with list.am by offering superior UX, trust features, and storefront capabilities for sellers.

**Target Market:** Armenia (~3 million population, concentrated in Yerevan)

**Languages:** Armenian (primary), Russian, English

**Currency:** AMD (Armenian Dram), with USD display option

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React framework with SSR |
| Language | TypeScript | Type safety, better IDE support |
| Styling | Tailwind CSS | Utility-first CSS, Etsy-inspired design |
| Database | PostgreSQL via Supabase | Relational database with realtime |
| Authentication | Supabase Auth | Phone/email authentication |
| File Storage | Supabase Storage + Cloudflare R2 | Image and file storage |
| Image CDN | Cloudflare Images | On-the-fly resizing, WebP conversion |
| Hosting | Vercel | Frontend hosting with edge network |
| Search | Supabase full-text search | Initial search (upgrade to Meilisearch later) |
| Realtime | Supabase Realtime | Live messaging updates |
| IDE | Cursor | AI-assisted development |

---

## Design System (Etsy-Inspired)

### Brand Colors

```css
:root {
  /* Primary */
  --color-primary: #F56400;           /* Etsy Orange - CTAs, highlights */
  --color-primary-hover: #D95700;     /* Darker orange for hover states */
  --color-primary-light: #FFF3E0;     /* Light orange background */
  
  /* Neutrals */
  --color-black: #222222;             /* Primary text */
  --color-gray-900: #333333;          /* Secondary text */
  --color-gray-700: #595959;          /* Tertiary text */
  --color-gray-500: #757575;          /* Placeholder text */
  --color-gray-300: #D4D4D4;          /* Borders */
  --color-gray-100: #F5F5F5;          /* Backgrounds */
  --color-white: #FFFFFF;             /* White */
  
  /* Semantic */
  --color-success: #2E7D32;           /* Green - success states */
  --color-success-light: #E8F5E9;     /* Light green background */
  --color-error: #D32F2F;             /* Red - error states */
  --color-error-light: #FFEBEE;       /* Light red background */
  --color-warning: #F57C00;           /* Orange - warning states */
  --color-info: #1976D2;              /* Blue - info states */
  
  /* Trust Badges */
  --color-verified: #1976D2;          /* Blue - verified badge */
  --color-trusted: #2E7D32;           /* Green - trusted badge */
  --color-top-seller: #F56400;        /* Orange - top seller badge */
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F56400',
          hover: '#D95700',
          light: '#FFF3E0',
        },
        gray: {
          900: '#222222',
          800: '#333333',
          700: '#595959',
          500: '#757575',
          300: '#D4D4D4',
          100: '#F5F5F5',
        },
        success: {
          DEFAULT: '#2E7D32',
          light: '#E8F5E9',
        },
        error: {
          DEFAULT: '#D32F2F',
          light: '#FFEBEE',
        },
      },
      fontFamily: {
        sans: ['Graphik', 'system-ui', 'sans-serif'],
        heading: ['Recoleta', 'Georgia', 'serif'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '40px'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.07)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
}
```

### Typography

**Headings:** Use a serif or semi-serif font (like Recoleta or similar) for warmth and personality
**Body:** Clean sans-serif (Graphik, Inter, or system fonts) for readability

```css
/* Typography Scale */
h1 { font-size: 36px; line-height: 40px; font-weight: 700; }
h2 { font-size: 30px; line-height: 36px; font-weight: 700; }
h3 { font-size: 24px; line-height: 32px; font-weight: 600; }
h4 { font-size: 20px; line-height: 28px; font-weight: 600; }
h5 { font-size: 18px; line-height: 28px; font-weight: 600; }
h6 { font-size: 16px; line-height: 24px; font-weight: 600; }
body { font-size: 16px; line-height: 24px; font-weight: 400; }
small { font-size: 14px; line-height: 20px; }
caption { font-size: 12px; line-height: 16px; }
```

### Component Styles

#### Buttons

```jsx
// Primary Button
<button className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-full transition-colors">
  Add to cart
</button>

// Secondary Button
<button className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-full border border-gray-300 transition-colors">
  Save for later
</button>

// Text Button
<button className="text-primary hover:text-primary-hover font-semibold underline">
  View all
</button>
```

#### Cards

```jsx
// Listing Card
<div className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
  <div className="aspect-square relative">
    <img src="..." className="object-cover w-full h-full" />
    <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform">
      {/* Heart icon */}
    </button>
  </div>
  <div className="p-4">
    <h3 className="font-medium text-gray-900 truncate">Product Title</h3>
    <p className="text-sm text-gray-700 mt-1">Store Name</p>
    <p className="font-semibold text-gray-900 mt-2">֏25,000</p>
  </div>
</div>
```

#### Input Fields

```jsx
// Text Input
<input 
  type="text" 
  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  placeholder="Search for anything"
/>

// Search Bar (Etsy-style)
<div className="flex border-2 border-gray-900 rounded-full overflow-hidden">
  <input 
    type="text" 
    className="flex-1 px-6 py-3 focus:outline-none"
    placeholder="Search for anything"
  />
  <button className="bg-primary hover:bg-primary-hover px-6 text-white">
    {/* Search icon */}
  </button>
</div>
```

### Layout Principles

1. **Maximum content width:** 1400px for main content area
2. **Grid:** 12-column grid with 24px gutters
3. **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96px
4. **Card grid:** 4 columns on desktop, 2 on tablet, 1-2 on mobile
5. **White space:** Generous padding, let content breathe

### Responsive Breakpoints

```javascript
// Tailwind breakpoints
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
}
```

---

## Database Schema

### Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_photo TEXT,
  language_preference VARCHAR(2) DEFAULT 'hy' CHECK (language_preference IN ('hy', 'ru', 'en')),
  location_city VARCHAR(100),
  location_region VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  is_verified BOOLEAN DEFAULT FALSE,
  is_id_verified BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);
```

### Notification Preferences

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  new_message BOOLEAN DEFAULT TRUE,
  listing_sold BOOLEAN DEFAULT TRUE,
  price_drop_on_favorite BOOLEAN DEFAULT TRUE,
  new_listing_from_followed_store BOOLEAN DEFAULT TRUE,
  saved_search_match BOOLEAN DEFAULT TRUE,
  notify_channels TEXT[] DEFAULT ARRAY['push', 'email'],
  telegram_chat_id VARCHAR(100),
  whatsapp_number VARCHAR(20),
  viber_number VARCHAR(20),
  UNIQUE(user_id)
);
```

### Sessions / Devices

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_type VARCHAR(20) CHECK (device_type IN ('web', 'ios', 'android')),
  device_name VARCHAR(255),
  push_token TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Stores

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description_hy TEXT,
  description_ru TEXT,
  description_en TEXT,
  logo TEXT,
  banner_image TEXT,
  banner_type VARCHAR(20) DEFAULT 'single' CHECK (banner_type IN ('single', 'carousel', 'collage')),
  owner_photo TEXT,
  idram_id VARCHAR(100),
  phone VARCHAR(20),
  telegram_handle VARCHAR(100),
  instagram_handle VARCHAR(100),
  whatsapp_number VARCHAR(20),
  viber_number VARCHAR(20),
  location_city VARCHAR(100),
  location_region VARCHAR(100),
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  is_physical_location BOOLEAN DEFAULT FALSE,
  show_address_publicly BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  response_time_minutes INTEGER,
  -- Approval fields
  approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'needs_info', 'rejected')),
  approval_submitted_at TIMESTAMPTZ DEFAULT NOW(),
  approval_reviewed_at TIMESTAMPTZ,
  approval_reviewed_by UUID REFERENCES users(id),
  approval_notes TEXT,
  rejection_reason TEXT,
  info_request_message TEXT,
  UNIQUE(user_id)
);
```

### Store Banner Images

```sql
CREATE TABLE store_banner_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL,
  link_to_listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  link_to_section_id UUID REFERENCES store_sections(id) ON DELETE SET NULL
);
```

### Store Sections

```sql
CREATE TABLE store_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name_hy VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  position INTEGER NOT NULL
);
```

### Store Follows

```sql
CREATE TABLE store_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);
```

### Store Approval Settings (Global Config)

```sql
CREATE TABLE store_approval_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_mode VARCHAR(20) DEFAULT 'manual' CHECK (approval_mode IN ('manual', 'auto')),
  auto_approve_delay_minutes INTEGER DEFAULT 60,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
```

### Store Approval History

```sql
CREATE TABLE store_approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'needs_info', 'rejected')),
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_hy VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  icon TEXT,
  position INTEGER NOT NULL
);
```

### Listings

```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  section_id UUID REFERENCES store_sections(id) ON DELETE SET NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  title_hy VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255),
  title_en VARCHAR(255),
  description_hy TEXT,
  description_ru TEXT,
  description_en TEXT,
  price DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'AMD',
  condition VARCHAR(20) CHECK (condition IN ('new', 'like_new', 'used', 'parts')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'sold', 'removed')),
  location_city VARCHAR(100),
  location_region VARCHAR(100),
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  pickup_instructions TEXT,
  use_store_location BOOLEAN DEFAULT TRUE,
  delivery_methods TEXT[] DEFAULT ARRAY['pickup'],
  shipping_carriers TEXT[],
  shipping_cost DECIMAL(10, 2),
  shipping_cost_type VARCHAR(20) DEFAULT 'contact' CHECK (shipping_cost_type IN ('free', 'flat', 'contact')),
  shipping_time_days INTEGER,
  position INTEGER,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery methods: pickup, local, nationwide, international
-- Shipping carriers: haypost, gg_taxi, yandex, courier, seller_delivers, other
```

### Listing Images

```sql
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  medium_url TEXT,
  position INTEGER NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE
);
```

### Listing Promotions (Sales/Discounts)

```sql
CREATE TABLE listing_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  original_price DECIMAL(12, 2) NOT NULL,
  sale_price DECIMAL(12, 2) NOT NULL,
  discount_percent INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Price History

```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  price DECIMAL(12, 2) NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Favorites

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);
```

### Recently Viewed

```sql
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);
```

### Saved Searches

```sql
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query VARCHAR(255),
  filters JSONB,
  notify_via TEXT[] DEFAULT ARRAY['push'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_notified_at TIMESTAMPTZ
);

-- filters JSONB example:
-- {
--   "category_id": "uuid",
--   "price_min": 10000,
--   "price_max": 50000,
--   "location": "Yerevan",
--   "delivery_methods": ["local", "nationwide"],
--   "condition": ["new", "like_new"]
-- }
```

### Conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'reported'))
);
```

### Messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);
```

### Reviews

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  seller_response TEXT,
  seller_response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Review Photos

```sql
CREATE TABLE review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INTEGER NOT NULL
);
```

### Transaction Confirmations

```sql
CREATE TABLE transaction_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_confirmed BOOLEAN DEFAULT FALSE,
  seller_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ
);
```

### Badges

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('verified', 'trusted', 'established', 'top_seller')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES users(id)
);
```

### Reports / Flags

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reason VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT
);
```

### Safe Meetup Spots

```sql
CREATE TABLE safe_meetup_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_hy VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  name_en VARCHAR(255),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('metro', 'bank', 'police', 'mall', 'other'))
);
```

### Collections (Admin Curated)

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_hy VARCHAR(255) NOT NULL,
  title_ru VARCHAR(255),
  title_en VARCHAR(255),
  slug VARCHAR(255) NOT NULL UNIQUE,
  description_hy TEXT,
  description_ru TEXT,
  description_en TEXT,
  banner_image TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  position INTEGER NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Collection Items

```sql
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Featured Stores

```sql
CREATE TABLE featured_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  added_by UUID NOT NULL REFERENCES users(id)
);
```

### Featured Listings

```sql
CREATE TABLE featured_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL CHECK (section IN ('hero', 'trending', 'new_arrivals', 'deals')),
  position INTEGER NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  added_by UUID REFERENCES users(id)
);
```

### Listing Bumps / Paid Promotions

```sql
CREATE TABLE listing_bumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bump_12h', 'bump_24h', 'bump_3d', 'bump_7d', 'bump_14d', 'bump_30d', 'featured_store', 'top_of_category')),
  paid_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'AMD',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Pricing Config

```sql
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_type VARCHAR(50) NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'AMD',
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- feature_type values:
-- bump_12h, bump_24h, bump_3d, bump_7d, bump_14d, bump_30d
-- featured_store, top_of_category
-- tier_50_listings, tier_unlimited
```

### Store Subscriptions

```sql
CREATE TABLE store_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'unlimited')),
  listing_limit INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT FALSE
);
```

### Admin Action Log

```sql
CREATE TABLE admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) CHECK (target_type IN ('user', 'listing', 'store', 'review')),
  target_id UUID,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Quick Relist Templates

```sql
CREATE TABLE quick_relist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  source_listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Homepage
│   ├── globals.css                   # Global styles
│   │
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login page
│   │   ├── register/page.tsx         # Registration page
│   │   └── verify/page.tsx           # Phone verification
│   │
│   ├── (main)/
│   │   ├── layout.tsx                # Main layout with header/footer
│   │   ├── search/page.tsx           # Search results
│   │   ├── category/[slug]/page.tsx  # Category listing
│   │   ├── listing/[id]/page.tsx     # Individual listing
│   │   ├── store/[slug]/page.tsx     # Store page
│   │   └── collections/[slug]/page.tsx # Collection page
│   │
│   ├── dashboard/
│   │   ├── layout.tsx                # Dashboard layout
│   │   ├── page.tsx                  # Dashboard overview
│   │   ├── listings/
│   │   │   ├── page.tsx              # Manage listings
│   │   │   ├── new/page.tsx          # Create listing
│   │   │   └── [id]/edit/page.tsx    # Edit listing
│   │   ├── store/
│   │   │   ├── page.tsx              # Store settings
│   │   │   └── sections/page.tsx     # Manage sections
│   │   ├── messages/page.tsx         # Conversations
│   │   ├── orders/page.tsx           # Transaction history
│   │   ├── analytics/page.tsx        # Store analytics
│   │   └── settings/page.tsx         # Account settings
│   │
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout
│   │   ├── page.tsx                  # Admin dashboard
│   │   ├── approvals/page.tsx        # Store approvals
│   │   ├── users/page.tsx            # User management
│   │   ├── listings/page.tsx         # Listing moderation
│   │   ├── reports/page.tsx          # Reports/flags
│   │   ├── collections/page.tsx      # Manage collections
│   │   ├── featured/page.tsx         # Featured content
│   │   ├── categories/page.tsx       # Manage categories
│   │   ├── meetup-spots/page.tsx     # Safe meetup spots
│   │   ├── pricing/page.tsx          # Pricing config
│   │   └── settings/page.tsx         # System settings
│   │
│   └── api/
│       ├── auth/[...supabase]/route.ts
│       ├── listings/route.ts
│       ├── stores/route.ts
│       ├── messages/route.ts
│       ├── upload/route.ts
│       └── webhooks/route.ts
│
├── components/
│   ├── ui/                           # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── Skeleton.tsx
│   │   └── Toast.tsx
│   │
│   ├── layout/                       # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── SearchBar.tsx
│   │   ├── MobileNav.tsx
│   │   └── LanguageSwitcher.tsx
│   │
│   ├── listings/                     # Listing components
│   │   ├── ListingCard.tsx
│   │   ├── ListingGrid.tsx
│   │   ├── ListingGallery.tsx
│   │   ├── ListingDetails.tsx
│   │   ├── ListingForm.tsx
│   │   ├── PriceDisplay.tsx
│   │   ├── ConditionBadge.tsx
│   │   └── ShareButtons.tsx
│   │
│   ├── stores/                       # Store components
│   │   ├── StoreCard.tsx
│   │   ├── StoreHeader.tsx
│   │   ├── StoreBanner.tsx
│   │   ├── StoreGrid.tsx
│   │   ├── StoreStats.tsx
│   │   └── FollowButton.tsx
│   │
│   ├── search/                       # Search components
│   │   ├── SearchFilters.tsx
│   │   ├── CategoryNav.tsx
│   │   ├── SortDropdown.tsx
│   │   └── SearchResults.tsx
│   │
│   ├── messages/                     # Messaging components
│   │   ├── ConversationList.tsx
│   │   ├── MessageThread.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageBubble.tsx
│   │
│   ├── reviews/                      # Review components
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewList.tsx
│   │   ├── ReviewForm.tsx
│   │   ├── StarRating.tsx
│   │   └── ReviewPhotos.tsx
│   │
│   ├── home/                         # Homepage components
│   │   ├── Hero.tsx
│   │   ├── FeaturedListings.tsx
│   │   ├── FeaturedStores.tsx
│   │   ├── TrendingNow.tsx
│   │   ├── Collections.tsx
│   │   ├── CategoryGrid.tsx
│   │   ├── RecentReviews.tsx
│   │   └── NewArrivals.tsx
│   │
│   └── admin/                        # Admin components
│       ├── ApprovalQueue.tsx
│       ├── StatsCards.tsx
│       ├── DataTable.tsx
│       └── ActionLog.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client
│   │   └── middleware.ts             # Auth middleware
│   │
│   ├── utils/
│   │   ├── formatters.ts             # Price, date formatting
│   │   ├── validators.ts             # Form validation
│   │   ├── helpers.ts                # General helpers
│   │   └── constants.ts              # App constants
│   │
│   └── hooks/
│       ├── useAuth.ts
│       ├── useListings.ts
│       ├── useStore.ts
│       ├── useMessages.ts
│       ├── useFavorites.ts
│       └── useSearch.ts
│
├── locales/
│   ├── hy.json                       # Armenian translations
│   ├── ru.json                       # Russian translations
│   └── en.json                       # English translations
│
├── types/
│   ├── database.ts                   # Database types (generated)
│   ├── api.ts                        # API types
│   └── index.ts                      # Shared types
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── middleware.ts                     # Next.js middleware
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Features by Priority

### Phase 1: MVP Core

1. **User Authentication**
   - Phone number registration with SMS verification
   - Email as optional
   - Login/logout
   - Password reset

2. **Store Creation**
   - Basic store setup (name, description, logo)
   - Store approval workflow (manual/auto)
   - Store public page

3. **Listings**
   - Create/edit/delete listings
   - Multiple image upload with compression
   - Category selection
   - Price, condition, delivery options
   - Basic search and filtering

4. **Messaging**
   - Conversations between buyers and sellers
   - Real-time updates
   - Notification on new messages

5. **Homepage**
   - Category navigation
   - Featured listings (manual for now)
   - New arrivals
   - Search bar

6. **Admin Panel**
   - Store approval queue
   - User management (ban/unban)
   - Listing moderation
   - Basic reports handling

### Phase 2: Trust & Engagement

7. **Reviews System**
   - Buyer reviews with photos
   - Seller responses
   - Star ratings

8. **Trust Badges**
   - Verified badge (phone confirmed)
   - Manual trusted/established badges

9. **Favorites & Follows**
   - Save listings to favorites
   - Follow stores
   - Price drop notifications

10. **Store Enhancements**
    - Store sections/collections
    - Banner carousel/collage options
    - Store statistics

### Phase 3: Discovery & Monetization

11. **Advanced Search**
    - Full-text search
    - Filters (price, location, condition, delivery)
    - Saved searches with alerts

12. **Collections**
    - Admin-curated collections
    - Seasonal/themed groupings
    - Featured on homepage

13. **Paid Features**
    - Listing bumps
    - Featured store placement
    - Store subscription tiers

14. **Sharing**
    - Share to Telegram, WhatsApp, Viber
    - Share to Instagram, Facebook
    - SMS sharing
    - QR codes for stores

### Phase 4: Advanced Features

15. **Transaction Confirmations**
    - Both parties confirm deal
    - Build reputation data

16. **Safe Meetup Spots**
    - Curated list of safe locations
    - Map integration

17. **Analytics Dashboard**
    - Store views
    - Listing performance
    - Message response time

18. **Localization Complete**
    - Full Armenian translation
    - Full Russian translation
    - RTL considerations if needed

---

## API Endpoints Structure

### Authentication
```
POST   /api/auth/register          # Register with phone
POST   /api/auth/verify            # Verify SMS code
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
```

### Users
```
GET    /api/users/me               # Get current user
PATCH  /api/users/me               # Update profile
GET    /api/users/:id              # Get public user profile
```

### Stores
```
GET    /api/stores                 # List stores (with filters)
POST   /api/stores                 # Create store
GET    /api/stores/:slug           # Get store by slug
PATCH  /api/stores/:slug           # Update store
GET    /api/stores/:slug/listings  # Get store listings
GET    /api/stores/:slug/reviews   # Get store reviews
POST   /api/stores/:slug/follow    # Follow store
DELETE /api/stores/:slug/follow    # Unfollow store
```

### Listings
```
GET    /api/listings               # List/search listings
POST   /api/listings               # Create listing
GET    /api/listings/:id           # Get listing
PATCH  /api/listings/:id           # Update listing
DELETE /api/listings/:id           # Delete listing
POST   /api/listings/:id/favorite  # Add to favorites
DELETE /api/listings/:id/favorite  # Remove from favorites
POST   /api/listings/:id/view      # Record view
```

### Categories
```
GET    /api/categories             # List all categories
GET    /api/categories/:slug       # Get category with listings
```

### Messages
```
GET    /api/conversations          # List conversations
POST   /api/conversations          # Start conversation
GET    /api/conversations/:id      # Get conversation messages
POST   /api/conversations/:id      # Send message
```

### Reviews
```
POST   /api/reviews                # Create review
PATCH  /api/reviews/:id            # Update review
POST   /api/reviews/:id/respond    # Seller response
```

### Search
```
GET    /api/search                 # Search listings
GET    /api/search/suggestions     # Search suggestions
POST   /api/saved-searches         # Save search
GET    /api/saved-searches         # Get saved searches
DELETE /api/saved-searches/:id     # Delete saved search
```

### Uploads
```
POST   /api/upload/image           # Upload image
DELETE /api/upload/:id             # Delete upload
```

### Admin
```
GET    /api/admin/stores/pending   # Pending store approvals
POST   /api/admin/stores/:id/approve
POST   /api/admin/stores/:id/reject
POST   /api/admin/stores/:id/request-info
GET    /api/admin/users            # List users
POST   /api/admin/users/:id/ban
POST   /api/admin/users/:id/unban
GET    /api/admin/reports          # List reports
PATCH  /api/admin/reports/:id      # Update report status
GET    /api/admin/settings         # Get system settings
PATCH  /api/admin/settings         # Update settings
```

---

## Image Handling

### Upload Flow
1. User selects image(s)
2. Client-side validation (file type, max 10MB)
3. Upload to `/api/upload/image`
4. Server processes with Sharp:
   - Resize to max 1200px width
   - Create thumbnail (300px)
   - Create medium (600px)
   - Convert to WebP
   - Compress (80% quality)
5. Store in Cloudflare R2
6. Return URLs for all sizes

### Image Sizes
- Original: max 1200px width
- Medium: 600px width (listing page)
- Thumbnail: 300px width (cards, grids)

### Supported Formats
- Input: JPEG, PNG, WebP, HEIC
- Output: WebP (with JPEG fallback)

---

## Localization (i18n)

### Implementation
Using `next-intl` for internationalization.

### Language Detection Priority
1. User preference (if logged in)
2. URL parameter (?lang=hy)
3. Cookie
4. Browser language
5. Default to Armenian (hy)

### Translation Structure
```json
// locales/hy.json
{
  "common": {
    "search": "Որոնել",
    "login": "Մուdelays",
    "register": "Գրանdelays"
  },
  "listing": {
    "price": "Գին",
    "condition": "Վdelays"
  }
}
```

### Currency Formatting
```typescript
// AMD formatting
formatPrice(25000, 'AMD') // "֏25,000"
formatPrice(25000, 'USD') // "$25"
```

---

## Performance Requirements

### Target Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s
- Cumulative Layout Shift: < 0.1

### Optimization Strategies
1. **Server-Side Rendering** for initial page loads
2. **Static Generation** for category pages
3. **Image Optimization** with next/image and Cloudflare
4. **Code Splitting** per route
5. **Edge Caching** for static assets
6. **Database Indexing** on frequently queried columns
7. **Lazy Loading** for below-fold content

---

## Security Considerations

### Authentication
- JWT tokens with short expiry (15 min access, 7 day refresh)
- Phone verification required
- Rate limiting on auth endpoints

### Data Protection
- Row Level Security (RLS) in Supabase
- Input sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping + CSP headers)

### File Uploads
- File type validation (magic bytes)
- Size limits (10MB images)
- Virus scanning (optional, via Cloudflare)
- Private bucket with signed URLs

---

## Deployment

### Environments
- **Development**: Local + Supabase local
- **Staging**: Vercel preview + Supabase staging project
- **Production**: Vercel production + Supabase production

### CI/CD
- GitHub Actions for automated testing
- Preview deployments on PR
- Auto-deploy main to production

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase account
- Cloudflare account
- Vercel account

### Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd armenian-marketplace

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start Supabase locally (optional)
npx supabase start

# Run database migrations
npx supabase db push

# Start development server
npm run dev
```

### Database Setup
1. Create Supabase project
2. Run SQL migrations (copy from schema above)
3. Enable Row Level Security
4. Set up authentication providers

---

## Notes for AI Assistant (Cursor)

### Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use async/await over .then()
- Destructure props and state
- Use meaningful variable names
- Add comments for complex logic

### Component Patterns
```tsx
// Standard component structure
interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {}, [])
  
  // Handlers
  const handleClick = () => {}
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Database Queries
```typescript
// Use Supabase client
const { data, error } = await supabase
  .from('listings')
  .select('*, store:stores(*)')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .limit(20)
```

### Error Handling
```typescript
try {
  const result = await someAsyncOperation()
  return { data: result, error: null }
} catch (error) {
  console.error('Operation failed:', error)
  return { data: null, error: 'Something went wrong' }
}
```

### Translations
```tsx
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations('listing')
  return <h1>{t('title')}</h1>
}
```

---

This document serves as the complete specification for building the Armenian Marketplace. Refer to specific sections as needed during development.
