'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Phone, Mail, ChevronDown } from 'lucide-react';
import api from '@/lib/api';

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isMobile, setIsMobile] = useState(false);
  const [openSection, setOpenSection] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Fetch settings
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  // Get values from settings with fallbacks
  const logoUrl = settings?.footer_logo || null;
  const logoText = settings?.logo_text || 'PRISMIN';
  const footerText = settings?.footer_text || 'PRISMIN is a luxury destination for women who dress with intention. We curate soulful fashion and beauty pieces that blend global inspiration with cultural grace—honoring every woman\'s choice, comfort, and quiet confidence.';
  const phone = settings?.contact_phone || '+8801XXXXXXXXX';
  const email = settings?.contact_email || 'info@prismin.com';
  const facebookUrl = settings?.facebook_url || 'https://facebook.com';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com';
  const tiktokUrl = settings?.tiktok_url || 'https://tiktok.com';
  const youtubeUrl = settings?.youtube_url || 'https://youtube.com';

  const SocialIcon = ({ href, children }) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B5B5B5', transition: 'all 0.2s' }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#B08B5C'; e.currentTarget.style.color = '#B08B5C'; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#B5B5B5'; }}
    >
      {children}
    </a>
  );

  const FooterLink = ({ href, children }) => (
    <Link href={href} style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none', transition: 'color 0.2s', display: 'block', lineHeight: 1.8 }} onMouseOver={(e) => e.currentTarget.style.color = '#FFF'} onMouseOut={(e) => e.currentTarget.style.color = '#B5B5B5'}>
      {children}
    </Link>
  );

  // Logo Component
  const FooterLogo = () => {
    if (logoUrl) {
      return (
        <Image
          src={logoUrl}
          alt={logoText}
          width={140}
          height={45}
          style={{ height: 'auto', maxHeight: 45, width: 'auto' }}
        />
      );
    }
    return (
      <span style={{ fontSize: 24, fontWeight: 300, letterSpacing: 6, color: '#FFFFFF' }}>
        {logoText}
      </span>
    );
  };

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <footer style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF', paddingBottom: 80 }}>
        <div style={{ padding: '40px 20px 24px' }}>
          
          {/* Logo & About */}
          <div style={{ marginBottom: 28 }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: 16 }}>
              <FooterLogo />
            </Link>
            <p style={{ fontSize: 13, color: '#B5B5B5', lineHeight: 1.8 }}>{footerText}</p>
          </div>

          {/* Connect With Us */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase', color: '#FFF' }}>Connect With Us</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <SocialIcon href={facebookUrl}><Facebook size={18} /></SocialIcon>
              <SocialIcon href={instagramUrl}><Instagram size={18} /></SocialIcon>
              <SocialIcon href={tiktokUrl}><TikTokIcon /></SocialIcon>
              <SocialIcon href={youtubeUrl}><YouTubeIcon /></SocialIcon>
            </div>
          </div>

          {/* Customer Service */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase', color: '#FFF' }}>Customer Service</h3>
            <p style={{ fontSize: 13, color: '#B5B5B5', marginBottom: 4 }}>(10 AM - 6 PM)</p>
            <p style={{ fontSize: 13, color: '#B5B5B5', marginBottom: 14 }}>(Except Weekend/Govt. Holidays)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Phone size={15} style={{ color: '#B5B5B5' }} />
              <a href={'tel:' + phone} style={{ fontSize: 14, color: '#FFF', textDecoration: 'none' }}>{phone}</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Mail size={15} style={{ color: '#B5B5B5' }} />
              <a href={'mailto:' + email} style={{ fontSize: 14, color: '#FFF', textDecoration: 'underline' }}>{email}</a>
            </div>
          </div>

          {/* Accordion - Information */}
          <div style={{ borderTop: '1px solid #2A2A2A' }}>
            <button onClick={() => toggleSection('information')} style={{ width: '100%', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: '#FFF', textTransform: 'uppercase' }}>Information</span>
              <ChevronDown size={18} style={{ color: '#B5B5B5', transform: openSection === 'information' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {openSection === 'information' && (
              <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/about" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>About Prismin</Link>
                <Link href="/safety-advisory" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Safety Advisory</Link>
                <Link href="/community-guidelines" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Community Guidelines</Link>
                <Link href="/social-responsibility" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Social Responsibility</Link>
                <Link href="/blog" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Blog</Link>
              </div>
            )}
          </div>

          {/* Accordion - Policy */}
          <div style={{ borderTop: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
            <button onClick={() => toggleSection('policy')} style={{ width: '100%', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: '#FFF', textTransform: 'uppercase' }}>Policy</span>
              <ChevronDown size={18} style={{ color: '#B5B5B5', transform: openSection === 'policy' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {openSection === 'policy' && (
              <div style={{ paddingBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/privacy-policy" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Privacy Policy</Link>
                <Link href="/delivery-policy" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Delivery Policy</Link>
                <Link href="/return-policy" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Return and Exchange Policy</Link>
                <Link href="/terms" style={{ fontSize: 14, color: '#B5B5B5', textDecoration: 'none' }}>Terms and Conditions</Link>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#555' }}>© {currentYear} PRISMIN. All Rights Reserved.</p>
        </div>
      </footer>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <footer style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 40px 50px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 50 }}>
          
          {/* Brand & About */}
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: 24 }}>
              <FooterLogo />
            </Link>
            <p style={{ fontSize: 14, color: '#B5B5B5', lineHeight: 1.9, marginBottom: 32 }}>{footerText}</p>
            
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 18, textTransform: 'uppercase', color: '#FFF' }}>Connect With Us</h3>
            <div style={{ display: 'flex', gap: 12 }}>
              <SocialIcon href={facebookUrl}><Facebook size={18} /></SocialIcon>
              <SocialIcon href={instagramUrl}><Instagram size={18} /></SocialIcon>
              <SocialIcon href={tiktokUrl}><TikTokIcon /></SocialIcon>
              <SocialIcon href={youtubeUrl}><YouTubeIcon /></SocialIcon>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 22, textTransform: 'uppercase', color: '#FFF' }}>Customer Service</h3>
            <p style={{ fontSize: 14, color: '#B5B5B5', marginBottom: 4, lineHeight: 1.6 }}>(10 AM - 6 PM)</p>
            <p style={{ fontSize: 14, color: '#B5B5B5', marginBottom: 22, lineHeight: 1.6 }}>(Except Weekend/Govt. Holidays)</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Phone size={16} style={{ color: '#B5B5B5' }} />
              <a href={'tel:' + phone} style={{ fontSize: 14, color: '#FFF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#B08B5C'} onMouseOut={(e) => e.currentTarget.style.color = '#FFF'}>{phone}</a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={16} style={{ color: '#B5B5B5' }} />
              <a href={'mailto:' + email} style={{ fontSize: 14, color: '#FFF', textDecoration: 'underline', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#B08B5C'} onMouseOut={(e) => e.currentTarget.style.color = '#FFF'}>{email}</a>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 22, textTransform: 'uppercase', color: '#FFF' }}>Information</h3>
            <FooterLink href="/about">About Prismin</FooterLink>
            <FooterLink href="/safety-advisory">Safety Advisory</FooterLink>
            <FooterLink href="/community-guidelines">Community Guidelines</FooterLink>
            <FooterLink href="/social-responsibility">Social Responsibility</FooterLink>
            <FooterLink href="/blog">Blog</FooterLink>
          </div>

          {/* Policy */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, marginBottom: 22, textTransform: 'uppercase', color: '#FFF' }}>Policy</h3>
            <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
            <FooterLink href="/delivery-policy">Delivery Policy</FooterLink>
            <FooterLink href="/return-policy">Return and Exchange Policy</FooterLink>
            <FooterLink href="/terms">Terms and Conditions</FooterLink>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div style={{ borderTop: '1px solid #2A2A2A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 40px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#555' }}>© {currentYear} PRISMIN. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
