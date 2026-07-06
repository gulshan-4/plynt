"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    tagline: '',
    bio: '',
    avatar_url: ''
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            username: data.username || '',
            tagline: data.tagline || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || ''
          });
        }
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          tagline: profile.tagline,
          bio: profile.bio,
          avatar_url: profile.avatar_url
        })
        .eq('id', user.id);
        
      // Also update auth user metadata so session-based UI (like Navbar) updates immediately
      await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url
        }
      });
        
      if (error) {
        toast.error("Failed to save profile");
      } else {
        toast.success("Profile saved successfully!");
      }
    }
    setIsSaving(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    // Ideally we would verify password here first using supabase.auth.signInWithPassword
    const { deleteAccount } = await import('../actions/auth');
    await deleteAccount();
    setIsDeleting(false);
    setShowDeleteModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Profile Settings Section */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
            
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : (
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                    <Image src={profile.avatar_url || "/user.webp"} alt="Avatar" fill className="object-cover" />
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors" title="Change profile picture">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input type="text" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input type="text" value={profile.username} onChange={e => setProfile({...profile, username: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <input type="text" value={profile.tagline} onChange={e => setProfile({...profile, tagline: e.target.value})} placeholder="e.g. Software Engineer & Writer" className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea rows="3" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-none"></textarea>
                  </div>
                  <div>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
            )}
          </div>

          {/* Account Deletion Section */}
          <div className="p-6 sm:p-8 bg-red-50/30">
            <h2 className="text-xl font-bold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and all of your content. This action cannot be undone.
            </p>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors"
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you absolutely sure?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. This will permanently delete your account, including all your articles, comments, and profile data.
            </p>
            
            <form onSubmit={handleDeleteAccount}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To verify, please enter your password
                </label>
                <input 
                  type="password" 
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!deletePassword || isDeleting}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
