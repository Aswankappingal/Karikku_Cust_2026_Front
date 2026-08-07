import React from 'react';
import Navbar from '../common/Navbar/Navbar';
import Footer from '../common/Footer/Footer';
import ScrollToTopOnMount from '../common/ScrollToTopOnMount';

const RefundPolicy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <p>
              We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.
            </p>
            <p className="mt-4">
              To be eligible for a return, your item must be in the same condition that you received it—unworn or unused, with tags, and in its original packaging. You'll also need the receipt or proof of purchase.
            </p>
          </section>

          <section>
            <p>
              To start a return, you can contact us at <a href="mailto:sales@karikku.co" className="text-blue-600 hover:underline">sales@karikku.co</a>
            </p>
            <p className="mt-4">
              <strong>Please note that returns will need to be sent to the following address:</strong>
            </p>
            <p className="mt-2">
              <strong>KARIKKU VENTURES PRIVATE LIMITED, PERINTHALMANNA, KERALA, INDIA, 679322</strong>
            </p>
            <p className="mt-4">
              If your return is accepted, we'll send you a return shipping label, as well as instructions on how and where to send your package. <strong>Items sent back to us without first requesting a return will not be accepted.</strong>
            </p>
            <p className="mt-4">
              You can always contact us for any return question at <a href="mailto:care@karikku.co" className="text-blue-600 hover:underline">care@karikku.co</a> or call us on <a href="tel:+918589858588" className="text-blue-600 hover:underline">+91 8589858588/22/44</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Damages and Issues</h2>
            <p>
              Please inspect your order upon reception and contact us immediately if the item is defective, damaged, or if you receive the wrong item, so that we can evaluate the issue and make it right.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Exceptions / Non-returnable Items</h2>
            <p className="mb-2">Certain types of items cannot be returned, such as:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
              <li>Perishable goods (e.g., food, flowers, or plants)</li>
              <li>Custom products (e.g., special orders or personalized items)</li>
              <li>Personal care goods (e.g., beauty products)</li>
              <li>Hazardous materials, flammable liquids, or gases</li>
            </ul>
            <p className="mt-4">
              Please get in touch if you have questions or concerns about your specific item.
            </p>
            <p className="mt-4">
              <strong>Unfortunately, we cannot accept returns on sale items or gift cards.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Exchanges</h2>
            <p>
              The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Refunds</h2>
            <p>
              We will notify you once we've received and inspected your return and let you know if the refund was approved or not. If approved, you'll be automatically refunded on your original payment method within 10 business days.
            </p>
            <p className="mt-4">
              Please remember it can take some time for your bank or credit card company to process and post the refund too.
            </p>
            <p className="mt-4">
              If more than 15 business days have passed since we've approved your return, please contact us at <a href="mailto:care@karikku.co" className="text-blue-600 hover:underline">care@karikku.co</a> or call us on: <a href="tel:+918589858588" className="text-blue-600 hover:underline">+91 8589858588/22/44</a>
            </p>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="mb-4">If you have questions about returns or refunds, contact:</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div>
                  <strong>Address:</strong> Karikku ventures private limited, Perinthalmanna, Kerala, India, 679322
                </div>
                <div>
                  <strong>Email:</strong> <a href="mailto:care@karikku.co" className="text-blue-600 hover:underline">care@karikku.co</a>
                </div>
                <div>
                  <strong>Phone:</strong> <a href="tel:+918589858588" className="text-blue-600 hover:underline">(+91) 8589 8585 22/44/88</a>
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

export default RefundPolicy;