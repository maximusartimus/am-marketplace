import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F5F5]">
        {/* Hero Section */}
        <section className="bg-white border-b border-[#E5E5E5]">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#222222] mb-4">
              Careers at AM Marketplace
            </h1>
            <p className="text-lg text-[#595959] max-w-2xl mx-auto">
              Join us in building Armenia&apos;s leading marketplace.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20">
          <div className="max-w-[800px] mx-auto px-4 md:px-6">
            <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm text-center">
              <div className="w-20 h-20 bg-[#FFF3E0] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[#F56400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#222222] mb-4">We&apos;re Growing</h2>
              <p className="text-[#595959] mb-6 leading-relaxed">
                AM Marketplace is on a mission to revolutionize how Armenians buy and sell. We&apos;re a small but ambitious team working on big challenges, and we&apos;re always looking for talented people who share our vision.
              </p>
              <div className="bg-[#F5F5F5] p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-[#222222] mb-2">No Open Positions Right Now</h3>
                <p className="text-[#595959] text-sm">
                  We don&apos;t have any open positions at the moment, but we&apos;re always interested in hearing from talented individuals.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-[#595959]">
                  Interested in joining our team? Send your resume to:
                </p>
                <a 
                  href="mailto:careers@ammarketplace.am" 
                  className="inline-flex items-center gap-2 text-[#F56400] font-semibold text-lg hover:underline"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  careers@ammarketplace.am
                </a>
              </div>
            </div>

            {/* What We Look For */}
            <div className="mt-12 bg-white p-8 md:p-12 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold text-[#222222] mb-6">What We Look For</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#F56400] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-[#222222]">Passion for Armenia</h3>
                    <p className="text-sm text-[#595959]">You care about building something meaningful for our country.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#F56400] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-[#222222]">Problem Solvers</h3>
                    <p className="text-sm text-[#595959]">You enjoy tackling challenges and finding creative solutions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#F56400] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-[#222222]">Team Players</h3>
                    <p className="text-sm text-[#595959]">You thrive in collaborative environments and value feedback.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#F56400] mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-[#222222]">Self-Starters</h3>
                    <p className="text-sm text-[#595959]">You take initiative and own your work from start to finish.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
