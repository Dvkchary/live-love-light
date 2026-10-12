'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, Flame, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4E8C1] border border-[#D9C38F] text-[#9A7513] text-xs font-semibold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WE ARE HERE TO HELP</span>
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-bold text-[#231B15]">
            Contact Customer Support
          </h1>
          <p className="text-sm text-[#786C63] leading-relaxed">
            Have questions about our candle fragrances, bulk wedding/corporate orders, or marketplace deliveries? Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif-luxury text-xl font-bold text-[#231B15]">
                Live Love Light Studio
              </h3>

              <div className="space-y-4 text-xs text-[#786C63]">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C59B27] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#231B15] text-xs">Email Us</strong>
                    <span>support@livelovelight.in</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C59B27] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#231B15] text-xs">Customer Care & WhatsApp</strong>
                    <span>+91 98765 43210 (Mon - Sat, 10 AM - 6 PM IST)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C59B27] mt-0.5 shrink-0" />
                  <div>
                    <strong className="block text-[#231B15] text-xs">Artisan Atelier</strong>
                    <span>Crafted with love in India</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F6F1EC] rounded-2xl border border-[#EAE3D9] text-[11px] text-[#786C63] space-y-1">
                <strong className="text-[#231B15] block">Marketplace Orders Notice</strong>
                <p>
                  For tracking and returns of orders placed on Amazon, Flipkart, or Meesho, you can also view real-time delivery status directly in the respective app using your order ID.
                </p>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-[#EAE3D9] p-6 sm:p-8 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-[#231B15]">
                    Message Received
                  </h3>
                  <p className="text-xs text-[#786C63] max-w-sm mx-auto">
                    Thank you for reaching out to Live Love Light. A member of our concierge team will respond within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="px-6 py-2 rounded-full bg-[#F6F1EC] text-xs font-semibold text-[#231B15]"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full bg-[#FCFBF7] text-sm text-[#231B15] p-3 rounded-xl border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="priya@example.com"
                      className="w-full bg-[#FCFBF7] text-sm text-[#231B15] p-3 rounded-xl border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#231B15] mb-1">
                      Message / Inquiry Details
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us how we can help you..."
                      className="w-full bg-[#FCFBF7] text-sm text-[#231B15] p-3 rounded-xl border border-[#EAE3D9] focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl bg-[#231B15] hover:bg-[#3D3027] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#DFBE58]" />
                    <span>Send Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
