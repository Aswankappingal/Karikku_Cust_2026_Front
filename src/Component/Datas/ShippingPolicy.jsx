import React from 'react';
import Navbar from '../common/Navbar/Navbar';
import Footer from '../common/Footer/Footer';
import ScrollToTopOnMount from '../common/ScrollToTopOnMount';

const ShippingPolicy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Terms of Shipping and Delivery</h2>
          </section>

          <section>
            <p>
              We partner with third-party logistics service providers ("Logistics Partners") to facilitate the shipping and delivery of products purchased on <strong>Karikku</strong>. Once your product is processed and successfully handed over to the Logistics Partner, we will provide you with their details. Products are typically dispatched within <strong>2 to 4 days</strong> of receiving the order on <a href="https://karikku.co" className="text-blue-600 hover:underline">karikku.co</a>.
            </p>
            <p className="mt-4">
              You will be notified with an estimated delivery timeline on the order confirmation page and via your registered email ID and/or mobile number. While we aim to ship across India, we may designate certain areas as unserviceable. In such cases, you will be notified at the time of placing your order or you may check delivery availability by entering the relevant pin code on <a href="https://karikku.co" className="text-blue-600 hover:underline">karikku.co</a>.
            </p>
          </section>

          <section>
            <p>
              To ensure accurate delivery, we may request specific details such as name, shipping address, billing address, landmarks, and contact details. You are responsible for providing complete and accurate information. Karikku will not be held liable for failed deliveries resulting from incorrect or insufficient address details provided by you.
            </p>
          </section>

          <section>
            <p>
              Our Logistics Partners will make up to <strong>three (3)</strong> delivery attempts. If delivery fails after the third attempt due to unavailability, we reserve the right to cancel the order and return the product. In such cases, shipping charges may be deducted from the refund.
            </p>
          </section>

          <section>
            <p className="mb-2">
              Delivery may be delayed due to reasons beyond our control, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
              <li>Logistics partner delays</li>
              <li>Weather disturbances</li>
              <li>Political unrest, strikes, or lockdowns</li>
              <li>Acts of God (e.g., floods, earthquakes)</li>
              <li>Other unforeseeable events</li>
            </ul>
            <p className="mt-4">
              We will attempt to notify you in such cases via your registered email or mobile number. Karikku disclaims any liability for delivery delays or the consequences thereof.
            </p>
          </section>

          <section>
            <p>
              While we work with logistics partners who uphold professional conduct, we are not liable for any misconduct, mishandling, delays, or service issues by third-party delivery personnel. Any such concerns must be resolved directly with the delivery agent or the logistics company.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Order Tracking</h2>
            <p>
              Once your order is processed, you will receive a <strong>tracking number</strong>. You may track your shipment via <a href="https://karikku.co" className="text-blue-600 hover:underline">karikku.co</a> or the logistics partner's platform. Please note that tracking data may experience delays or inaccuracies outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Shipping Fees</h2>
            <p>
              <strong>Shipping fees</strong> may apply depending on product type, order value, delivery location, and payment method. These fees are non-refundable except in cases where a defective, damaged, or incorrect item was delivered (after verification and at our sole discretion).
            </p>
            <p className="mt-4">
              Title and risk of products pass to you upon delivery. For Cash on Delivery orders, logistics partners are authorized to collect payment on our behalf and are governed by our Fees and Payment Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Returns and Reverse Logistics</h2>
            <p>
              Return of purchased products is facilitated through our <strong>reverse logistics partners</strong>. Upon initiating a return request on <a href="https://karikku.co" className="text-blue-600 hover:underline">karikku.co</a> and our approval, our reverse logistics partner will contact you for pickup.
            </p>
            <p className="mt-4">
              Returns will be handled in accordance with our <strong>Cancellation, Return and Refund Policy</strong>.
            </p>
          </section>

          <section className="border-t pt-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h2>
            <p className="mb-4">If you have questions about shipping or delivery, contact:</p>
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

export default ShippingPolicy;