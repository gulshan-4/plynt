'use client'
import React, { useState } from 'react';
import { TbSearch, TbX } from 'react-icons/tb';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/actions/auth';
import { searchPosts } from '@/app/actions/posts';
import Image from 'next/image';

const Navbar = ({ initialUser }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(initialUser);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const fetchResults = async () => {
      if (searchQuery.trim().length > 0) {
        const results = await searchPosts(searchQuery);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };
    const timer = setTimeout(() => fetchResults(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  React.useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  React.useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single();
        setUser({
          ...session.user,
          avatar_url: data?.avatar_url || session.user.user_metadata?.avatar_url || null
        });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { title: 'Home', href: '/', active: pathname === '/' },
    { title: 'Latest', href: '/latest', active: pathname === '/latest' },
    { title: 'Trending', href: '/trending', active: pathname === '/trending' },
    { title: 'Categories', href: '/categories', active: pathname === '/categories' }
  ];

  return (
    <>
      <nav className="nav-divided">
        <Link href="/" className="logo">PLYNT.</Link>

        <div className="links">
          {navLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className={`link ${link.active ? 'active' : ''}`}
            >
              {link.title}
            </Link>
          ))}
        </div>

        <div className="actions">
          <div className="action-item" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <TbSearch size={18} />
            Search
          </div>

          {user ? (
            <div className="action-item pfp" style={{ position: 'relative' }} onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
              <div style={{ width: '32px', height: '32px', overflow: 'hidden', position: 'relative' }}>
                <Image src={user.avatar_url || user.user_metadata?.avatar_url || "/user.webp"} alt="Avatar" fill style={{ objectFit: 'cover' }} />
              </div>
              {/* Profile */}

              {isProfileDropdownOpen && (
                <div style={{ position: 'absolute', top: '100%', right: '0', background: '#fff', border: '2px solid #111', borderTop: 'none', zIndex: 100, display: 'flex', flexDirection: 'column', width: '200px' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '2px solid #111', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>{user.user_metadata?.username || user.email}</div>
                  <Link href={`/@${user.user_metadata?.username || 'user'}`} className="action-item" style={{ borderLeft: 'none', padding: '16px' }}>Profile</Link>
                  <Link href="/settings" className="action-item" style={{ borderLeft: 'none', padding: '16px', borderTop: '1px solid #E4E4E7' }}>Settings</Link>
                  <button onClick={() => logout()} className="action-item" style={{ borderLeft: 'none', padding: '16px', borderTop: '1px solid #E4E4E7', color: 'red' }}>Sign out</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/sign-in" className="action-item">Sign In</Link>
          )}

          <Link href={user ? `/@${user.user_metadata?.username || 'user'}/write` : '/sign-in'} className="action-item write-btn">
            Write
          </Link>
        </div>
      </nav>

      {/* Command Palette Search Overlay */}
      {isSearchOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }} onClick={() => setIsSearchOpen(false)}>
          <div style={{ width: '100%', maxWidth: '600px', background: '#fff', border: '3px solid #111', boxShadow: '8px 8px 0 rgba(0,0,0,1)', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', borderBottom: searchResults.length > 0 || searchQuery.trim().length > 0 ? '2px solid #111' : 'none' }}>
              <button type="submit" style={{ padding: '16px', display: 'flex', alignItems: 'center', color: '#111', background: 'none', border: 'none', cursor: 'pointer' }} aria-label="Search">
                <TbSearch size={24} />
              </button>
              <input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: '16px 16px 16px 0', border: 'none', outline: 'none', fontWeight: 700, fontSize: '18px', color: '#111', background: 'transparent' }}
                autoFocus
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} style={{ padding: '16px', borderLeft: '2px solid #111', background: '#fff', cursor: 'pointer', color: '#111' }}>
                <TbX size={24} />
              </button>
            </form>

            {/* Live Dropdown Results */}
            {searchResults.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '300px', overflowY: 'auto' }}>
                {searchResults.map((post) => (
                  <Link 
                    key={post.id} 
                    href={`/@${post.profiles?.username || 'user'}/${post.slug}`}
                    onClick={() => setIsSearchOpen(false)}
                    style={{ padding: '16px', borderBottom: '1px solid #E4E4E7', textDecoration: 'none', color: '#111', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <TbSearch size={16} style={{ color: '#666' }} />
                    <div style={{ fontWeight: 700, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {searchQuery.trim().length > 0 && searchResults.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontWeight: 600 }}>
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;