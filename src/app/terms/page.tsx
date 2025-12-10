import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Terms of Service
              </h1>
              <p className="text-gray-600">
                Last updated: December 2024
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 md:px-6">
            <div className="prose prose-gray max-w-none">
              
              <p className="text-lg text-gray-600 mb-8">
                Welcome to AM Marketplace. By using our platform, you agree to these Terms of Service. 
                Please read them carefully.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-6">
                By accessing or using AM Marketplace, you agree to be bound by these Terms of Service and our 
                Privacy Policy. If you do not agree to these terms, you may not use our services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Eligibility</h2>
              <p className="text-gray-600 mb-6">
                You must be at least 18 years old to use AM Marketplace. By using our platform, you represent 
                that you are at least 18 years of age and have the legal capacity to enter into these Terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Account Responsibilities</h2>
              <p className="text-gray-600 mb-4">
                When you create an account, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Provide accurate and complete information</li>
                <li>Keep your login credentials secure</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. User Conduct</h2>
              <p className="text-gray-600 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Violate any laws or regulations</li>
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, threaten, or intimidate other users</li>
                <li>Use the platform for any illegal purposes</li>
                <li>Attempt to circumvent security measures</li>
                <li>Collect user information without consent</li>
                <li>Spam or send unsolicited communications</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Prohibited Items</h2>
              <p className="text-gray-600 mb-4">
                The following items are prohibited on AM Marketplace:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Illegal drugs and drug paraphernalia</li>
                <li>Weapons and explosives</li>
                <li>Stolen property</li>
                <li>Counterfeit goods</li>
                <li>Hazardous materials</li>
                <li>Adult content and services</li>
                <li>Animals (except pet supplies)</li>
                <li>Items that infringe intellectual property rights</li>
                <li>Any items prohibited by Armenian law</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Listings and Transactions</h2>
              <p className="text-gray-600 mb-6">
                AM Marketplace is a platform that connects buyers and sellers. We do not participate in 
                transactions between users. Sellers are responsible for the accuracy of their listings, and 
                buyers are responsible for verifying items before purchase. All transactions are conducted 
                directly between users.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Fees</h2>
              <p className="text-gray-600 mb-6">
                Creating an account and posting listings on AM Marketplace is currently free. We reserve the 
                right to introduce fees for certain features or services in the future, with appropriate notice.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Content Ownership</h2>
              <p className="text-gray-600 mb-6">
                You retain ownership of content you post on AM Marketplace. By posting content, you grant us a 
                non-exclusive, worldwide, royalty-free license to use, display, and distribute your content in 
                connection with our services.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-gray-600 mb-6">
                AM Marketplace is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the 
                accuracy, completeness, or quality of any listings or user content. We are not responsible for 
                any transactions between users.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Limitation of Liability</h2>
              <p className="text-gray-600 mb-6">
                To the maximum extent permitted by law, AM Marketplace shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of the platform or any 
                transactions with other users.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Termination</h2>
              <p className="text-gray-600 mb-6">
                We reserve the right to suspend or terminate your account at any time for violations of these 
                Terms or for any other reason at our discretion. You may also delete your account at any time 
                through your account settings.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Dispute Resolution</h2>
              <p className="text-gray-600 mb-6">
                Any disputes between users should be resolved directly between the parties involved. If you have 
                a dispute with AM Marketplace, we encourage you to contact us first to seek a resolution. These 
                Terms shall be governed by the laws of the Republic of Armenia.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. Changes to Terms</h2>
              <p className="text-gray-600 mb-6">
                We may modify these Terms at any time. We will notify users of significant changes through the 
                platform or via email. Continued use of AM Marketplace after changes constitutes acceptance of 
                the modified Terms.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">14. Contact</h2>
              <p className="text-gray-600 mb-6">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <p className="text-gray-900 font-medium">AM Marketplace</p>
                <p className="text-gray-600">Email: legal@ammarketplace.am</p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

