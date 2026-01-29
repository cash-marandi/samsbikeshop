'use client';
import React, { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Service & Repair');
  const [message, setMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject: selectedSubject,
          message,
          appointmentDate: appointmentDate || undefined,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setFormSuccess(true);
        // Clear form
        setName('');
        setEmail('');
        setAppointmentDate('');
        setSelectedSubject('Service & Repair');
        setMessage('');
      } else {
        alert(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setFormSubmitted(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={e => handleContactSubmit(e)}>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Your Name</label>
          <input type="text" className="w-full bg-white border-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-orange-500" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
          <input type="email" className="w-full bg-white border-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-orange-500" placeholder="john@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-500">Appointment Date</label>
        <input type="date" className="w-full bg-white border-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-orange-500" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-500">Subject</label>
        <select className="w-full bg-white border-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-orange-500" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
          <option value="Select an inquiry type">Select an inquiry type</option>
          <option value="Bike Sales">Bike Sales</option>
          <option value="Rental Booking">Rental Booking</option>
          <option value="Auction Question">Auction Question</option>
          <option value="Service & Repair">Service & Repair</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-500">Your Message</label>
        <textarea className="w-full bg-white border-2 border-gray-300 px-4 py-3 focus:outline-none focus:border-orange-500 min-h-[200px]" placeholder="How can we help you get back on the road?" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
      </div>
      <button type="submit" className="w-full py-4 bg-orange-500 text-white font-bold hover:bg-orange-600" disabled={formSubmitted}>
        {formSubmitted ? 'Sending...' : 'Send Message'}
      </button>
      {formSuccess && <p className="text-green-600 text-center mt-4 font-medium">Message sent successfully!</p>}
    </form>
  );
}