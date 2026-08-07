import React from 'react';
import Navbar from '../common/Navbar/Navbar';
import Footer from '../common/Footer/Footer';
import ScrollToTopOnMount from '../common/ScrollToTopOnMount';

const PrivacyPolicy = () => {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          }
        `}
      </style>
      <Navbar/>
      <ScrollToTopOnMount/>
    <div className="max-w-4xl mx-auto p-6 bg-white text-gray-800 font-inter px-3 mt-5">
      <div className="mb-8 py-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-600">Last updated: 04/05/2025</p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <p>
            This Privacy Policy describes how <strong>Karikku store</strong> (the "Site", "we", "us", or "our") 
            collects, uses, and discloses your personal information when you visit, use our services, or make a 
            purchase from <strong>karikku.co</strong> (the "Site") or otherwise communicate with us (collectively, 
            the "Services"). For purposes of this Privacy Policy, "you" and "your" means you as the user of the 
            Services, whether you are a customer, website visitor, or another individual whose information we have 
            collected pursuant to this Privacy Policy.
          </p>
          <p className="mt-4">
            Please read this Privacy Policy carefully. By using and accessing any of the Services, you agree to 
            the collection, use, and disclosure of your information as described in this Privacy Policy. If you 
            do not agree to this Privacy Policy, please do not use or access any of the Services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time, including to reflect changes to our practices 
            or for other operational, legal, or regulatory reasons. We will post the revised Privacy Policy on 
            the Site, update the "Last updated" date and take any other steps required by applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Collect and Use Your Personal Information</h2>
          <p>
            To provide the Services, we collect and have collected over the past 12 months personal information 
            about you from a variety of sources, as set out below. The information that we collect and use varies 
            depending on how you interact with us.
          </p>
          <p className="mt-4">
            In addition to the specific uses set out below, we may use information we collect about you to 
            communicate with you, provide the Services, comply with any applicable legal obligations, enforce 
            any applicable terms of service, and to protect or defend the Services, our rights, and the rights 
            of our users or others.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">What Personal Information We Collect</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Information We Collect Directly from You</h3>
            <p className="mb-2">This includes:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
              <li>Name, address, phone number, email</li>
              <li>Order details including billing/shipping address, payment confirmation</li>
              <li>Account login credentials</li>
              <li>Wishlist and cart data</li>
              <li>Customer support messages</li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Information We Collect through Cookies</h3>
            <p>
              We collect usage data through cookies, pixels, and similar tracking technologies to understand 
              your interactions with our Services.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Information We Obtain from Third Parties</h3>
            <p className="mb-2">We may receive information from:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
              <li>Payment processors</li>
              <li>Marketing or analytics vendors</li>
              <li>Customer service and fulfillment providers</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Personal Information</h2>
          <p className="mb-2">We use your personal information for the following purposes:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
            <li>To provide and manage the Services and orders</li>
            <li>To communicate order updates or customer support</li>
            <li>For marketing and promotional messages (with opt-out)</li>
            <li>For fraud detection and account protection</li>
            <li>To improve and personalize your experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies</h2>
          <p>
            We use cookies and similar technologies to operate our Site, understand user behavior, and deliver 
            better services. You may disable cookies via your browser, though some site features may be affected.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How We Disclose Personal Information</h2>
          <p className="mb-2">We may share your personal information with:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
            <li>Service providers who support our business (e.g., IT, payment processing, logistics)</li>
            <li>Marketing and advertising partners</li>
            <li>Affiliates or within our corporate group</li>
            <li>Legal authorities when required</li>
            <li>In connection with business transfers like mergers or acquisitions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">User Generated Content</h2>
          <p>
            If you post reviews or content in public areas of the Services, they may be publicly accessible. 
            We are not responsible for how others use that information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Third Party Websites and Links</h2>
          <p>
            Our Site may contain links to external websites. These sites are not controlled by us, and their 
            privacy practices are not covered by this Policy. Please review their privacy terms independently.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Children's Data</h2>
          <p>
            We do not knowingly collect or solicit personal data from children. If you believe a child has 
            provided us with personal data, please contact us for deletion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Security and Retention of Your Information</h2>
          <p>
            We use reasonable measures to protect your data but cannot guarantee absolute security. We retain 
            your information as long as needed for the purposes described, including legal and contractual obligations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Your Rights and Choices</h2>
          <p className="mb-2">You may have rights depending on your location, including:</p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
            <li>Right to access, delete, or correct personal data</li>
            <li>Right to data portability or to restrict processing</li>
            <li>Right to withdraw consent at any time</li>
            <li>Right to opt out of marketing communications</li>
          </ul>
          <p className="mt-3">You may exercise your rights by contacting us directly.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Complaints</h2>
          <p>
            You may contact us to raise concerns or lodge complaints. If you are not satisfied, you may contact 
            your local data protection authority.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">International Users</h2>
          <p>
            Your data may be transferred and processed outside your home country. Where required, we use legal 
            mechanisms to safeguard such transfers.
          </p>
        </section>

        <section className="border-t pt-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
          <p className="mb-4">If you have questions or wish to exercise your data rights, contact:</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div>
                <strong>Address:</strong> Karikku ventures private limited, Perinthalmanna, Kerala, India, 679322
              </div>
              <div>
                <strong>Email:</strong> <a href="mailto:care@karikku.co" className="text-blue-600 hover:underline">care@karikku.co</a>
              </div>
              <div>
                <strong>Phone:</strong> (+91) 8589 8585 22/44/88
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default PrivacyPolicy;