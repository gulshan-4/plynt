"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

export default function CoverImageEditor({ initialCoverUrl, isOwner, profileId }) {
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl || "https://images.pexels.com/photos/2583852/pexels-photo-2583852.jpeg");
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading("Updating cover...");

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      setCoverUrl(base64Data);

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({ cover_url: base64Data })
        .eq('id', profileId);

      setIsUploading(false);
      if (error) {
        toast.error("Failed to update cover", { id: loadingToast });
      } else {
        toast.success("Cover updated successfully!", { id: loadingToast });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full h-48 md:h-64 relative bg-gray-300 group">
      <Image
        src={coverUrl}
        alt="Cover"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/20" />
      
      {isOwner && (
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <label className={`flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 text-white text-sm font-medium rounded-lg cursor-pointer backdrop-blur-sm border border-white/20 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {isUploading ? "Uploading..." : "Change Cover"}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCoverChange}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
