import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useAuth } from '../contexts/AuthContext';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../lib/api';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  title: string;
  start: Date;
  end: Date;
}

const InstructorCalendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await api.get(
          `/calendar/instructor/${id}/availability`
        );
        const availableSlots = response.data.map((slot: any) => ({
          title: 'Available',
          start: new Date(slot.startTime),
          end: new Date(slot.endTime),
        }));
        setEvents(availableSlots);
      } catch (err) {
        setError('Failed to fetch availability.');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchAvailability();
    }
  }, [id]);

  const { user } = useAuth();

  const handleSelectSlot = (event: Event) => {
    setSelectedSlot(event);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !user) return;
    try {
      const stripe = await stripePromise;
      const response = await api.post('/payment/create-checkout-session', {
        serviceId: 1, // Hardcoded for now
      });
      const session = response.data;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      alert('Failed to book appointment.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-center text-gray-900">
        Instructor's Calendar
      </h1>
      <div className="mt-10">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={handleSelectSlot}
        />
      </div>
      {selectedSlot && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold">You have selected:</h2>
          <p className="mt-2">
            {format(selectedSlot.start, 'PPP p')} - {format(selectedSlot.end, 'p')}
          </p>
          <button
            onClick={handleBooking}
            className="mt-4 px-4 py-2 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Book this slot
          </button>
        </div>
      )}
    </div>
  );
};

export default InstructorCalendar;
