import React from 'react';
import Link from 'next/link';
import { FiEdit3, FiGlobe, FiUsers } from 'react-icons/fi';

export const metadata = {
  title: 'About Us | Plynt.space',
  description: 'Learn more about Plynt.space and our mission to empower creators.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#f9fafb] min-h-screen pb-16">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            Welcome to <span className="text-blue-600">Plynt.space</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            A modern, lightning-fast platform designed to help writers, thinkers, and creators share their stories with the world without the noise.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 max-w-4xl mt-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiEdit3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Write freely</h3>
            <p className="text-gray-500 text-sm">
              Our distraction-free editor lets you focus on what matters most: your words.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiUsers size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect</h3>
            <p className="text-gray-500 text-sm">
              Build an audience, interact through comments, and grow your personal brand.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiGlobe size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Discover</h3>
            <p className="text-gray-500 text-sm">
              Explore thousands of articles across travel, technology, lifestyle, and more.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
            <p>
              We believe that everyone has a story worth telling. But in today's internet, great writing often gets buried under algorithms, ads, and cluttered interfaces.
            </p>
            <p>
              That's why we built Plynt.space — to bring the focus back to the content. We provide the tools you need to write beautifully, and the network you need to be heard, all wrapped in a blazing fast, modern application.
            </p>
            <p>
              Whether you're sharing industry insights, personal anecdotes, or the latest tech tutorials, Plynt.space is your canvas.
            </p>
          </div>

          <div className="mt-10 pt-10 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link href="/sign-up" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto text-center">
              Start Writing Today
            </Link>
            <Link href="/contact" className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto text-center">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
