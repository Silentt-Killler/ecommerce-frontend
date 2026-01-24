'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Plus, Minus, Phone, Mail } from 'lucide-react';

// TikTok Icon Component
const TikTokIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openSection, setOpenSection] = useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <footer className="w-full bg-neutral-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Section (4 columns on desktop) */}
          <div className="lg:col-span-4">
            {/* Logo */}
            <Link href="/" className="inline-block mb-6">
              <Image 
                src="/logo.png" 
                alt="PRISMIN" 
                width={140}
                height={45}
                className="h-auto w-auto max-h-12"
              />
            </Link>
            
            {/* Description */}
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              PRISMIN is a luxury destination for women who dress with intention. 
              We curate soulful fashion and beauty pieces that blend global inspiration 
              with cultural grace—honoring every woman's choice, comfort, and quiet confidence.
            </p>

            {/* Social Media */}
            <div>
              <h3 className="text-white text-xs font-semibold tracking-wider uppercase mb-4">
                Connect With Us
              </h3>
              <div className="flex items-center gap-3">
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-white text-neutral-900 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-white text-neutral-900 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-white text-neutral-900 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon size={16} />
                </a>
                <a 
                  href="#" 
                  className="w-9 h-9 rounded-full bg-white text-neutral-900 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Service (3 columns on desktop) */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-xs font-semibold tracking-wider uppercase mb-6">
              Customer Service
            </h3>
            <div className="space-y-4">
              <div className="text-neutral-400 text-sm space-y-1">
                <p>(10 AM – 6 PM)</p>
                <p>(Except Weekend/Govt. Holidays)</p>
              </div>
              
              <div className="space-y-3">
                <a 
                  href="tel:+8801XXXXXXXXX" 
                  className="flex items-center gap-2 text-neutral-400 text-sm hover:text-white transition-colors"
                >
                  <Phone size={14} className="flex-shrink-0" />
                  <span>+880 1XXX-XXXXXX</span>
                </a>
                
                <a 
                  href="mailto:info@prismin.com" 
                  className="flex items-center gap-2 text-neutral-400 text-sm hover:text-white transition-colors"
                >
                  <Mail size={14} className="flex-shrink-0" />
                  <span>info@prismin.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Information (2.5 columns on desktop) */}
          <div className="lg:col-span-2 border-t border-neutral-800 lg:border-none pt-6 lg:pt-0">
            <button 
              className="w-full flex justify-between items-center lg:cursor-default lg:pointer-events-none"
              onClick={() => toggleSection('info')}
            >
              <h3 className="text-white text-xs font-semibold tracking-wider uppercase">
                Information
              </h3>
              <span className="lg:hidden text-white">
                {openSection === 'info' ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>

            <ul className={`mt-6 space-y-3 text-sm transition-all duration-300 ease-in-out lg:!max-h-full lg:!opacity-100 ${
              openSection === 'info' 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About PRISMIN
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-neutral-400 hover:text-white transition-colors">
                  Safety Advisory
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-neutral-400 hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/social-responsibility" className="text-neutral-400 hover:text-white transition-colors">
                  Social Responsibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policy (2.5 columns on desktop) */}
          <div className="lg:col-span-3 border-t border-neutral-800 lg:border-none pt-6 lg:pt-0">
            <button 
              className="w-full flex justify-between items-center lg:cursor-default lg:pointer-events-none"
              onClick={() => toggleSection('policy')}
            >
              <h3 className="text-white text-xs font-semibold tracking-wider uppercase">
                Policy
              </h3>
              <span className="lg:hidden text-white">
                {openSection === 'policy' ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>

            <ul className={`mt-6 space-y-3 text-sm transition-all duration-300 ease-in-out lg:!max-h-full lg:!opacity-100 ${
              openSection === 'policy' 
                ? 'max-h-96 opacity-100' 
                : 'max-h-0 opacity-0 overflow-hidden'
            }`}>
              <li>
                <Link href="/privacy-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/delivery-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="text-neutral-400 hover:text-white transition-colors">
                  Return and Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-neutral-500 text-xs text-center tracking-wide">
            © {currentYear} PRISMIN Brand. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
