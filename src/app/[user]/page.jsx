import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card from '../components/Card';
import CoverImageEditor from '../components/CoverImageEditor';
import { notFound } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';

export async function generateMetadata({ params }) {
  const { user } = await params;
  const decodedUser = decodeURIComponent(user);
  if (!decodedUser.startsWith('@')) {
    return { title: 'User Not Found | Plynt.space' };
  }
  const username = decodedUser.slice(1);
  return {
    title: `${username}'s Profile | Plynt.space`,
    description: `Read articles by ${username} on Plynt.space.`,
    alternates: {
      canonical: `https://plynt.space/@${username}`,
    },
  };
}

const ProfilePage = async ({ params }) => {
  const { user } = await params;
  const decodedUser = decodeURIComponent(user);
  if (!decodedUser.startsWith('@')) {
    notFound();
  }
  const decodedUsername = decodedUser.slice(1);

  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Fetch real profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', decodedUsername)
    .single();

  if (!profile) {
    return <div className="p-20 text-center text-xl text-gray-600">User not found</div>;
  }

  // Fetch real posts by this author
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*')
    .eq('author_id', profile.id)
    .eq('published', true)
    .order('created_at', { ascending: false });

  // Compute some stats
  const totalPosts = recentPosts?.length || 0;
  const totalLikes = recentPosts?.reduce((acc, p) => acc + (p.likes || 0), 0) || 0;

  // Since we don't have following/followers tables yet, use placeholders or 0
  const stats = {
    followers: 0,
    following: 0,
    posts: totalPosts
  };

  const socials = {
    twitter: "#",
    github: "#",
    website: "#"
  };

  const pinnedPost = recentPosts?.find(p => p.featured) || null;
  const displayPosts = pinnedPost ? recentPosts.filter(p => p.id !== pinnedPost.id) : recentPosts || [];

  const popularPosts = [...(recentPosts || [])]
    .sort((a, b) => ((b.likes || 0) + (b.views_count || 0)) - ((a.likes || 0) + (a.views_count || 0)))
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero / Cover */}
      <CoverImageEditor 
        initialCoverUrl={profile.cover_url}
        isOwner={currentUser?.id === profile.id}
        profileId={profile.id}
      />

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Info Card (Overlapping cover) */}
        <div className="relative -mt-16 sm:-mt-24 bg-white rounded-2xl shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start border border-gray-100">

          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md overflow-hidden shrink-0 bg-white">
            <Image
              src={profile.avatar_url || "/user.webp"}
              alt={profile.full_name || profile.username}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left mt-2 md:mt-4">
            <h1 className="text-3xl font-bold text-gray-900">{profile.full_name || profile.username}</h1>
            <p className="text-gray-500 font-medium">@{profile.username}</p>
            {profile.tagline && (
              <p className="text-blue-600 font-medium mt-1">{profile.tagline}</p>
            )}
            {profile.bio && (
              <p className="text-gray-700 mt-3 text-lg leading-relaxed max-w-2xl">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 sm:gap-8 mt-5 text-sm">
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-gray-900 text-lg">{stats.posts}</span>
                <span className="text-gray-500">Posts</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="font-bold text-gray-900 text-lg">{totalLikes}</span>
                <span className="text-gray-500">Likes Received</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-4">
            {currentUser?.id === profile.id ? (
              <Link href="/settings" className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-center w-full sm:w-auto border border-gray-200">
                Edit Profile
              </Link>
            ) : (
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors w-full sm:w-auto shadow-sm">
                Follow
              </button>
            )}
          </div>
        </div>

        {/* Two Column Layout below profile */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8">

          {/* Main Content Area (Posts) */}
          <div className="flex-1 space-y-10">
            {/* Pinned Post */}
            {pinnedPost && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.26 3.425l-2.09-.696a1 1 0 00-1.127.39l-2.88 4.319-3.085.342a1 1 0 00-.773 1.583l2.25 2.502-.454 4.091a1 1 0 001.378 1.054l3.52-1.76 2.5 1.5a1 1 0 001.442-1.16l-.888-3.418 2.055-3.08a1 1 0 00-.39-1.126l-1.46-.876.696-2.089a1 1 0 00-.735-1.282z" clipRule="evenodd" /></svg>
                  Pinned Post
                </h2>
                <Card
                  title={pinnedPost.title}
                  description={pinnedPost.content?.slice(0, 150) + "..."}
                  image={pinnedPost.cover_image || "/article-cover.webp"}
                  slug={pinnedPost.slug}
                  author={profile.full_name || profile.username}
                  username={profile.username}
                  tags={pinnedPost.tags || []}
                  likes={pinnedPost.likes || 0}
                  comments={pinnedPost.comments_count || 0}
                  featured={true}
                />
              </section>
            )}

            {/* Recent Posts Grid */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Posts</h2>
              {displayPosts.length === 0 ? (
                <p className="text-gray-500">No posts yet.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {displayPosts.map(post => (
                    <Card
                      key={post.id}
                      title={post.title}
                      description={post.content?.slice(0, 100) + "..."}
                      image={post.cover_image || "/blog-image.webp"}
                      slug={post.slug}
                      author={profile.full_name || profile.username}
                      username={profile.username}
                      tags={post.tags || []}
                      likes={post.likes || 0}
                      comments={post.comments_count || 0}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Area (Bio & Socials) */}
          <div className="w-full lg:w-1/3 xl:w-1/4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {profile.bio}
              </p>

              <div className="mt-6 space-y-3">
                <a href={socials.twitter} className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors text-sm font-medium">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                  Twitter
                </a>
                <a href={socials.github} className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  GitHub
                </a>
                <a href={socials.website} className="flex items-center gap-3 text-gray-600 hover:text-blue-500 transition-colors text-sm font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Website
                </a>
              </div>
            </div>

            {popularPosts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Articles</h3>
                <div className="space-y-4">
                  {popularPosts.map(post => (
                    <Link href={`/@${profile.username}/${post.slug}`} key={post.id} className="block group">
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 leading-snug line-clamp-2 transition-colors">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          {post.views_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L12 8.343l3.172-3.171a4 4 0 115.656 5.656L12 21.485l-8.828-8.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                          {post.likes || 0}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
