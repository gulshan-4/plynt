"use client";

import React, { useState } from 'react';
import { FiMail, FiMapPin, FiMessageSquare } from 'react-icons/fi';

export default function ContactPage() {
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate network request for MVP
    setTimeout(() => {
      setStatus('success');
      e.target.reset();
    }, 1200);
  };

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
            Have a question, feedback, or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 max-w-5xl mt-12">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Contact Info (Left Column) */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FiMail size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                <p className="text-sm text-gray-500 mb-2">For general inquiries and support.</p>
                <a href="mailto:hello@plynt.space" className="text-blue-600 font-medium hover:underline">
                  hello@plynt.space
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <FiMessageSquare size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Community</h3>
                <p className="text-sm text-gray-500 mb-2">Join our Discord to chat with other writers.</p>
                <a href="#" className="text-green-600 font-medium hover:underline">
                  Join Discord Server
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <FiMapPin size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Office</h3>
                <p className="text-sm text-gray-500">
                  123 Creator Lane,<br />
                  San Francisco, CA 94103
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form (Right Column) */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              
              {status === 'success' ? (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="font-bold text-lg mb-1">Message Sent!</h3>
                  <p className="text-green-700 text-sm">Thanks for reaching out. We'll get back to you shortly.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="mt-4 text-green-700 font-medium text-sm hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea 
                      id="message" 
                      rows="5"
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="Write your message here..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all ${
                      status === 'submitting' 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                    }`}
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
