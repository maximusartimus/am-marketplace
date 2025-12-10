import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              Press
            </h1>
            <p className="text-lg text-[#595959] max-w-2xl mx-auto">
              Media resources and contact information for journalists.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20">
          <div className="max-w-[800px] mx-auto px-4 md:px-6">
            {/* Press Contact */}
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-bold text-[#222222] mb-4">Press Inquiries</h2>
              <p className="text-[#595959] mb-6">
                For press and media inquiries, please contact our communications team:
              </p>
              <a 
                href="mailto:press@ammarketplace.am" 
                className="inline-flex items-center gap-2 text-[#F56400] font-semibold text-lg hover:underline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                press@ammarketplace.am
              </a>
            </div>

            {/* About AM Marketplace */}
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-bold text-[#222222] mb-4">About AM Marketplace</h2>
              <div className="text-[#595959] space-y-4">
                <p>
                  AM Marketplace is Armenia&apos;s leading online marketplace, connecting buyers and sellers across the country. Founded with the mission to modernize how Armenians trade, we provide a safe, user-friendly platform for buying and selling everything from electronics and vehicles to real estate and fashion.
                </p>
                <p>
                  Our platform serves thousands of active users, with tens of thousands of listings across dozens of categories. We&apos;re committed to building a trustworthy marketplace through verified seller programs, secure messaging, and a dedicated trust and safety team.
                </p>
              </div>
            </div>

            {/* Key Facts */}
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-bold text-[#222222] mb-6">Key Facts</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <div className="text-sm text-[#595959] mb-1">Founded</div>
                  <div className="font-semibold text-[#222222]">2024</div>
                </div>
                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <div className="text-sm text-[#595959] mb-1">Headquarters</div>
                  <div className="font-semibold text-[#222222]">Yerevan, Armenia</div>
                </div>
                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <div className="text-sm text-[#595959] mb-1">Industry</div>
                  <div className="font-semibold text-[#222222]">E-commerce / Marketplace</div>
                </div>
                <div className="bg-[#F5F5F5] p-4 rounded-lg">
                  <div className="text-sm text-[#595959] mb-1">Website</div>
                  <div className="font-semibold text-[#222222]">ammarketplace.am</div>
                </div>
              </div>
            </div>

            {/* Brand Assets Note */}
            <div className="bg-[#222222] p-8 rounded-lg text-center">
              <h2 className="text-lg font-semibold text-white mb-2">Brand Assets</h2>
              <p className="text-[#A0A0A0] text-sm">
                For logos, brand guidelines, and other media assets, please contact press@ammarketplace.am
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

