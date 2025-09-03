import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PaymentSuccess: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Here you would typically create the appointment in your database
    // since the payment was successful.
    // For now, we'll just log a message.
    console.log('Payment was successful, creating appointment for user:', user?.id);
  }, [user]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-green-600">
          Payment Successful!
        </h1>
        <p>Your appointment has been booked.</p>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
