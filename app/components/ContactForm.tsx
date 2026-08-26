'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
    <form className="space-y-5" onSubmit={e => handleContactSubmit(e)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-500">Your Name</label>
          <input 
            type="text" 
            className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all" 
            placeholder="John Doe" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-ink-500">Email Address</label>
          <input 
            type="email" 
            className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all" 
            placeholder="john@domain.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-500">Appointment Date</label>
        <input 
          type="date" 
          className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all" 
          value={appointmentDate} 
          onChange={(e) => setAppointmentDate(e.target.value)} 
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-500">Subject</label>
        <select 
          className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all appearance-none" 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="Select an inquiry type">Select an inquiry type</option>
          <option value="Bike Sales">Bike Sales</option>
          <option value="Rental Booking">Rental Booking</option>
          <option value="Auction Question">Auction Question</option>
          <option value="Service & Repair">Service & Repair</option>
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-500">Your Message</label>
        <textarea 
          className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-3 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all min-h-[180px] resize-none" 
          placeholder="How can we help you get back on the road?" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <motion.button 
        type="submit" 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="w-full py-4 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-glow" 
        disabled={formSubmitted}
      >
        {formSubmitted ? 'Sending...' : 'Send Message'}
      </motion.button>
      {formSuccess && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-green-600 text-center font-medium bg-green-50 p-3 rounded-xl border border-green-200"
        >
          Message sent successfully!
        </motion.p>
      )}
    </form>
  );
}
