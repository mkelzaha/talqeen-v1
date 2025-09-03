import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div
      className="bg-cover bg-center h-screen"
      style={{ backgroundImage: "url('https://picsum.photos/seed/tajweed/1920/1080')" }}
    >
      <div className="flex items-center justify-center h-full bg-black bg-opacity-50">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold">Learn the Quran with Tajweed</h1>
          <p className="mt-4 text-xl">
            Master the art of Quranic recitation with our expert instructors.
          </p>
          <Link
            to="/services"
            className="mt-8 inline-block bg-blue-500 text-white px-8 py-3 rounded-md text-lg font-medium"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
