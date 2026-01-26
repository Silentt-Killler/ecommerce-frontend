'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Phone, Mail, ChevronDown } from 'lucide-react';

// TikTok icon (not in lucide)
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// YouTube icon
const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const [openSection, setOpenSection] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <footer style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', paddingBottom: 70 }}>
        <div style={{ padding: '40px 20px 30px' }}>
          
          {/* Logo & About */}
          <div style={{ marginBottom: 32 }}>
            <Link href="/">
              <Image 
                src="/images/logo-white.png" 
                alt="PRISMIN" 
                width={120} 
                height={40}
                style={{ height: 'auto', marginBottom: 16 }}
              />
            </Link>
            <p style={{ fontSize: 13, color: '#A0A0A0', lineHeight: 1.7 }}>
              PRISMIN is a luxury destination for women who dress with intention. We curate soulful fashion and beauty pieces that blend global inspiration with cultural grace.
            </p>
          </div>

          {/* Connect With Us */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>
              Connect With Us
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }}>
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }}>
                <Instagram size={18} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }}>
                <TikTokIcon />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }}>
                <YouTubeIcon />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, marginBottom: 16, textTransform: 'uppercase' }}>
              Customer Service
            </h3>
            <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 8 }}>(10 AM - 6 PM)</p>
            <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 16 }}>(Except Weekend/Govt. Holidays)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Phone size={16} style={{ color: '#A0A0A0' }} />
              <a href="tel:+8801XXXXXXXXX" style={{ fontSize: 14, color: '#FFFFFF', textDecoration: 'none' }}>+8801XXXXXXXXX</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={16} style={{ color: '#A0A0A0' }} />
              <a href="mailto:info@prismin.com" style={{ fontSize: 14, color: '#FFFFFF', textDecoration: 'underline' }}>info@prismin.com</a>
            </div>
          </div>

          {/* Accordion - Information */}
          <div style={{ borderTop: '1px solid #2A2A2A' }}>
            <button 
              onClick={() => toggleSection('information')}
              style={{ width: '100%', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, color: '#FFFFFF', textTransform: 'uppercase' }}>Information</span>
              <ChevronDown size={18} style={{ color: '#A0A0A0', transform: openSection === 'information' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {openSection === 'information' && (
              <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/about" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>About Prismin</Link>
                <Link href="/safety-advisory" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Safety Advisory</Link>
                <Link href="/community-guidelines" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Community Guidelines</Link>
                <Link href="/social-responsibility" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Social Responsibility</Link>
                <Link href="/blog" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Blog</Link>
              </div>
            )}
          </div>

          {/* Accordion - Policy */}
          <div style={{ borderTop: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
            <button 
              onClick={() => toggleSection('policy')}
              style={{ width: '100%', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 1, color: '#FFFFFF', textTransform: 'uppercase' }}>Policy</span>
              <ChevronDown size={18} style={{ color: '#A0A0A0', transform: openSection === 'policy' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {openSection === 'policy' && (
              <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/privacy-policy" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Privacy Policy</Link>
                <Link href="/delivery-policy" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Delivery Policy</Link>
                <Link href="/return-policy" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Return and Exchange Policy</Link>
                <Link href="/terms" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none' }}>Terms and Conditions</Link>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #2A2A2A' }}>
          <p style={{ fontSize: 12, color: '#666' }}>© {currentYear} PRISMIN. All Rights Reserved.</p>
        </div>
      </footer>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <footer style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '50px 40px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 60 }}>
          
          {/* Brand & About */}
          <div>
            <Link href="/">
              <Image 
                src="/images/logo-white.png" 
                alt="PRISMIN" 
                width={140} 
                height={45}
                style={{ height: 'auto', marginBottom: 20 }}
              />
            </Link>
            <p style={{ fontSize: 14, color: '#A0A0A0', lineHeight: 1.8, marginBottom: 28 }}>
              PRISMIN is a luxury destination for women who dress with intention. We curate soulful fashion and beauty pieces that blend global inspiration with cultural grace—honoring every woman's choice, comfort, and quiet confidence.
            </p>
            
            {/* Connect With Us */}
            <h3 style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, marginBottom: 16, textTransform: 'uppercase' }}>
              Connect With Us
            </h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#B08B5C'; e.currentTarget.style.color = '#B08B5C'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#3A3A3A'; e.currentTarget.style.color = '#A0A0A0'; }}>
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#B08B5C'; e.currentTarget.style.color = '#B08B5C'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#3A3A3A'; e.currentTarget.style.color = '#A0A0A0'; }}>
                <Instagram size={18} />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#B08B5C'; e.currentTarget.style.color = '#B08B5C'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#3A3A3A'; e.currentTarget.style.color = '#A0A0A0'; }}>
                <TikTokIcon />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid #3A3A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0A0A0', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.borderColor = '#B08B5C'; e.currentTarget.style.color = '#B08B5C'; }} onMouseOut={(e) => { e.currentTarget.style.borderColor = '#3A3A3A'; e.currentTarget.style.color = '#A0A0A0'; }}>
                <YouTubeIcon />
              </a>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, marginBottom: 20, textTransform: 'uppercase' }}>
              Customer Service
            </h3>
            <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 4 }}>(10 AM - 6 PM)</p>
            <p style={{ fontSize: 13, color: '#A0A0A0', marginBottom: 20 }}>(Except Weekend/Govt. Holidays)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Phone size={16} style={{ color: '#A0A0A0' }} />
              <a href="tel:+8801XXXXXXXXX" style={{ fontSize: 14, color: '#FFFFFF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#B08B5C'} onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>+8801XXXXXXXXX</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={16} style={{ color: '#A0A0A0' }} />
              <a href="mailto:info@prismin.com" style={{ fontSize: 14, color: '#FFFFFF', textDecoration: 'underline', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#B08B5C'} onMouseOut={(e) => e.currentTarget.style.color = '#FFFFFF'}>info@prismin.com</a>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, marginBottom: 20, textTransform: 'uppercase' }}>
              Information
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 12 }}>
                <Link href="/about" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>About Prismin</Link>
              </li>
              <li style={{ marginBottom: 12 }}>
                <Link href="/safety-advisory" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Safety Advisory</Link>
              </li>
              <li style={{ marginBottom: 12 }}>
                <Link href="/community-guidelines" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Community Guidelines</Link>
              </li>
              <li style={{ marginBottom: 12 }}>
                <Link href="/social-responsibility" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Social Responsibility</Link>
              </li>
              <li>
                <Link href="/blog" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Blog</Link>
              </li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, marginBottom: 20, textTransform: 'uppercase' }}>
              Policy
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: 12 }}>
                <Link href="/privacy-policy" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Privacy Policy</Link>
              </li>
              <li style={{ marginBottom: 12 }}>
                <Link href="/delivery-policy" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Delivery Policy</Link>
              </li>
              <li style={{ marginBottom: 12 }}>
                <Link href="/return-policy" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Return and Exchange Policy</Link>
              </li>
              <li>
                <Link href="/terms" style={{ fontSize: 14, color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'} onMouseOut={(e) => e.currentTarget.style.color = '#A0A0A0'}>Terms and Conditions</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid #2A2A2A' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '20px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#666' }}>© {currentYear} PRISMIN. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
