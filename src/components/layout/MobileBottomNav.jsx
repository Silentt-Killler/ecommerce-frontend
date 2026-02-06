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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // নেভিগেশন হলে মেনু বন্ধ করার জন্য (Back/Home click fix)
  useEffect(() => {
    if (isOpen) onClose();
  }, [pathname]);

  const fetchSubcategories = async (slug) => {
    if (subcategories[slug]) return;
    try {
      const res = await api.get(`/subcategories?parent=${slug}&is_active=true`);
      setSubcategories(prev => ({ ...prev, [slug]: res.data.subcategories || [] }));
    } catch (e) { console.error(e); }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease'
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, bottom: 0,
        // ডেস্কটপে রাইট, মোবাইলে লেফট
        right: isMobile ? 'auto' : 0, 
        left: isMobile ? 0 : 'auto',
        width: isMobile ? '85vw' : '400px', // স্ট্যান্ডার্ড প্রিমিয়াম উইডথ
        zIndex: 9999, backgroundColor: '#FFFFFF',
        display: 'flex', flexDirection: 'column',
        boxShadow: isMobile ? '5px 0 25px rgba(0,0,0,0.1)' : '-5px 0 25px rgba(0,0,0,0.1)',
        animation: isMobile ? 'slideInLeft 0.4s ease' : 'slideInRight 0.4s ease'
      }}>
        {/* Header */}
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5' }}>
          <span style={{ fontSize: 18, fontWeight: 300, letterSpacing: 4 }}>PRISMIN</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Content */}
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
                  padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 17, fontWeight: 400, color: '#1a1a1a', letterSpacing: '0.5px'
                }}
              >
                {cat.name}
                <ChevronDown size={18} style={{ transform: expandedCategory === cat.slug ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
              </button>
              
              {expandedCategory === cat.slug && (
                <div style={{ backgroundColor: '#fafafa', animation: 'fadeIn 0.3s' }}>
                  {subcategories[cat.slug]?.map(sub => (
                    <Link key={sub.slug} href={`${cat.href}?subcategory=${sub.slug}`} style={{
                      display: 'block', padding: '12px 40px', color: '#666', fontSize: 15, textDecoration: 'none'
                    }}>{sub.name}</Link>
                  ))}
                  <Link href={cat.href} style={{ display: 'block', padding: '12px 40px', color: '#B08B5C', fontWeight: 600, fontSize: 14 }}>View All</Link>
                </div>
              )}
            </div>
          ))}
          <Link href="/shop" style={{ display: 'block', padding: '20px 24px', fontSize: 17, fontWeight: 500, color: '#000', textDecoration: 'none' }}>Shop All Products</Link>
        </div>

        {/* Footer Links */}
        <div style={{ padding: '24px', borderTop: '1px solid #f5f5f5', backgroundColor: '#fafafa' }}>
           <Link href={isAuthenticated ? "/account" : "/login"} style={{ display: 'block', padding: '10px 0', color: '#000', fontSize: 15, fontWeight: 500 }}>{isAuthenticated ? "My Account" : "Login / Register"}</Link>
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
