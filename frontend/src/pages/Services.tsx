import React from 'react';

const dummyServices = [
  {
    id: 1,
    name: 'Tajweed for Beginners',
    description: 'Learn the basics of Tajweed and improve your Quranic recitation.',
    price: 50,
  },
  {
    id: 2,
    name: 'Advanced Tajweed',
    description: 'Master the advanced rules of Tajweed and perfect your recitation.',
    price: 75,
  },
  {
    id: 3,
    name: 'Quran Memorization (Hifz)',
    description: 'Memorize the Quran with a certified instructor.',
    price: 100,
  },
  {
    id: 4,
    name: 'Arabic Language for Quran',
    description: 'Learn the Arabic language to better understand the Quran.',
    price: 60,
  },
];

const Services: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center text-gray-900">
        Our Services
      </h1>
      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {dummyServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {service.name}
              </h2>
              <p className="mt-2 text-gray-600">{service.description}</p>
              <p className="mt-4 text-3xl font-bold text-gray-900">
                ${service.price}
              </p>
              <button className="mt-6 w-full px-4 py-2 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
