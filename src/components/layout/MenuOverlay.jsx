'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { X, ChevronDown } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';

const CATEGORIES = [
  { name: 'Original Pakistani', slug: 'original-pakistani', href: '/original-pakistani' },
  { name: 'Inspired Pakistani', slug: 'inspired-pakistani', href: '/inspired-pakistani' },
  { name: 'Premium Bag', slug: 'premium-bag', href: '/premium-bag' },
  { name: 'Beauty & Care', slug: 'beauty', href: '/beauty' }
];

export default function MenuOverlay({ isOpen, onClose }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loading, setLoading] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Back button বা অন্য পেজে ক্লিক করলে অটো মেনু বন্ধ হবে
  useEffect(() => {
    if (isOpen) onClose();
  }, [pathname]);

  const fetchSubcategories = async (slug) => {
    if (subcategories[slug]) return;
    setLoading(prev => ({ ...prev, [slug]: true }));
    try {
      const res = await api.get(`/subcategories?parent=${slug}&is_active=true`);
      setSubcategories(prev => ({ ...prev, [slug]: res.data.subcategories || [] }));
    } catch (error) {
      setSubcategories(prev => ({ ...prev, [slug]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [slug]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(5px)',
        animation: 'fadeIn 0.3s ease'
      }} />

      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        right: isMobile ? 'auto' : 0, left: isMobile ? 0 : 'auto',
        width: isMobile ? '85vw' : '400px',
        zIndex: 9999, backgroundColor: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        animation: isMobile ? 'slideInLeft 0.4s ease' : 'slideInRight 0.4s ease',
        boxShadow: isMobile ? '5px 0 25px rgba(0,0,0,0.1)' : '-5px 0 25px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: 18, fontWeight: 300, letterSpacing: 3 }}>PRISMIN</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {CATEGORIES.map((cat) => (
            <div key={cat.slug}>
              <button 
                onClick={() => {
                  setExpandedCategory(expandedCategory === cat.slug ? null : cat.slug);
                  fetchSubcategories(cat.slug);
                }}
                style={{
                  width: '100%', display: 'flex', justifyContent: 'space-between',
                  padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, fontWeight: 500, color: '#1a1a1a'
                }}
              >
                {cat.name}
                <ChevronDown size={18} style={{ transform: expandedCategory === cat.slug ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
              
              {expandedCategory === cat.slug && (
                <div style={{ backgroundColor: '#fcfcfc', borderLeft: '3px solid #000' }}>
                  {loading[cat.slug] ? <div style={{ padding: '10px 40px', fontSize: 13, color: '#888' }}>Loading...</div> : 
                    subcategories[cat.slug]?.map(sub => (
                      <Link key={sub.slug} href={`${cat.href}?subcategory=${sub.slug}`} style={{
                        display: 'block', padding: '12px 40px', color: '#555', fontSize: 14, textDecoration: 'none'
                      }}>
                        {sub.name}
                      </Link>
                    ))
                  }
                  <Link href={cat.href} style={{ display: 'block', padding: '12px 40px', color: '#B08B5C', fontWeight: 600, fontSize: 14 }}>
                    Shop All {cat.name}
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
           <Link href={isAuthenticated ? "/account" : "/login"} style={{ display: 'block', padding: '10px 0', color: '#000', fontSize: 15, fontWeight: 500 }}>
             {isAuthenticated ? "My Account" : "Sign In / Register"}
           </Link>
           <Link href="/contact" style={{ display: 'block', padding: '10px 0', color: '#666', fontSize: 14 }}>Contact Us</Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}
