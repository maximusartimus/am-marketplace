import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Privacy Policy
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
                At AM Marketplace, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our platform.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Personal Information</h3>
              <p className="text-gray-600 mb-4">
                When you create an account or use our services, we may collect:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Name and email address</li>
                <li>Phone number (optional)</li>
                <li>Profile information you choose to provide</li>
                <li>Location data for local listings</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Usage Information</h3>
              <p className="text-gray-600 mb-4">
                We automatically collect certain information when you use our platform:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and general location</li>
                <li>Pages visited and features used</li>
                <li>Search queries and browsing patterns</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related notifications</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Detect and prevent fraud and abuse</li>
                <li>Personalize your experience and show relevant listings</li>
                <li>Send promotional communications (with your consent)</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li><strong>With other users:</strong> Your profile information and listings are visible to other users</li>
                <li><strong>With service providers:</strong> Who help us operate our platform</li>
                <li><strong>For legal reasons:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In connection with a merger or acquisition</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Data Security</h2>
              <p className="text-gray-600 mb-6">
                We implement appropriate technical and organizational measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure, and we cannot guarantee 
                absolute security.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-6">
                We use cookies and similar tracking technologies to collect information about your browsing 
                activities. You can control cookies through your browser settings, but disabling them may 
                affect your experience on our platform.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Children&apos;s Privacy</h2>
              <p className="text-gray-600 mb-6">
                Our services are not intended for users under 18 years of age. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-600 mb-6">
                We may update this Privacy Policy from time to time. We will notify you of any changes by 
                posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Contact Us</h2>
              <p className="text-gray-600 mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <p className="text-gray-900 font-medium">AM Marketplace</p>
                <p className="text-gray-600">Email: privacy@ammarketplace.am</p>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
