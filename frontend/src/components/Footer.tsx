import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Tajweed. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
