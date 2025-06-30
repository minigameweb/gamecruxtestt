import React from 'react';

const Contact = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Contact Us</h1>

        <div className="bg-gray-900 p-8 rounded-lg shadow border border-gray-800">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Contact Information</h2>
            <div className="text-gray-300 space-y-2">
              <p>Email: gamecrux3005@gmail.com</p>
              <p>Phone: +9315126696</p>
              <p>Address: New Delhi, 110012</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">Business Hours</h2>
            <p className="text-gray-300">
              Monday - Friday: 9:00 AM - 6:00 PM IST<br />
              Saturday - Sunday: Closed
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            We typically respond within 24 business hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
