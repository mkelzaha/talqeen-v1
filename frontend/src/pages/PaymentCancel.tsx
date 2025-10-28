import React from 'react';
import { Link } from 'react-router-dom';

const PaymentCancel: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-red-600">
          Payment Canceled
        </h1>
        <p>Your payment was not processed. Please try again.</p>
        <Link
          to="/services"
          className="inline-block mt-4 px-4 py-2 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back to Services
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
