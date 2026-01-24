'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Plus, Phone, Mail } from 'lucide-react';

const TikTokIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export default function Footer() {
  const [openInfo, setOpenInfo] = useState(false);
  const [openPolicy, setOpenPolicy] = useState(false);

  return (
    <footer className="bg-neutral-900 text-white">
      {/* Desktop Footer */}
      <div className="hidden md:block py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-8">
            
            {/* Column 1: Logo & Description */}
            <div className="col-span-3">
              <Image src="/logo.png" alt="PRISMIN" width={120} height={40} className="mb-6" />
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                PRISMIN is a luxury destination for women who dress with intention. 
                We curate soulful fashion and beauty pieces that blend global inspiration 
                with cultural grace—honoring every woman's choice, comfort, and quiet confidence.
              </p>
              <h3 className="text-white text-xs font-semibold uppercase mb-4">Connect With Us</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                  <Facebook size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                  <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                  <TikTokIcon size={20} />
                </a>
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200">
                  <Youtube size={20} />
                </a>
              </div>
            </div>

            {/* Column 2: Customer Service */}
            <div className="col-span-3">
              <h3 className="text-white text-xs font-semibold uppercase mb-6">Customer Service</h3>
              <div className="text-gray-400 text-sm space-y-3">
                <p>(10 AM – 6 PM)</p>
                <p>(Except Weekend/Govt. Holidays)</p>
                <a href="tel:+8801XXX-XXXXXX" className="flex items-center gap-2 hover:text-white">
                  <Phone size={16} />
                  +880 1XXX-XXXXXX
                </a>
                <a href="mailto:info@prismin.com" className="flex items-center gap-2 hover:text-white">
                  <Mail size={16} />
                  info@prismin.com
                </a>
              </div>
            </div>

            {/* Column 3: Information */}
            <div className="col-span-3">
              <h3 className="text-white text-xs font-semibold uppercase mb-6">Information</h3>
              <ul className="text-gray-400 text-sm space-y-3">
                <li><Link href="/about" className="hover:text-white">About PRISMIN</Link></li>
                <li><Link href="/safety" className="hover:text-white">Safety Advisory</Link></li>
                <li><Link href="/community" className="hover:text-white">Community Guidelines</Link></li>
                <li><Link href="/social-responsibility" className="hover:text-white">Social Responsibility</Link></li>
              </ul>
            </div>

            {/* Column 4: Policy */}
            <div className="col-span-3">
              <h3 className="text-white text-xs font-semibold uppercase mb-6">Policy</h3>
              <ul className="text-gray-400 text-sm space-y-3">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/delivery" className="hover:text-white">Delivery Policy</Link></li>
                <li><Link href="/return" className="hover:text-white">Return and Exchange Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms and Conditions</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden py-12 px-6">
        {/* Logo */}
        <Image src="/logo.png" alt="PRISMIN" width={100} height={33} className="mb-6" />
        
        {/* Description */}
        <p className="text-gray-400 text-sm leading-relaxed mb-6">
          PRISMIN is a luxury destination for women who dress with intention. 
          We curate soulful fashion and beauty pieces that blend global inspiration 
          with cultural grace—honoring every woman's choice, comfort, and quiet confidence.
        </p>

        {/* Connect With Us */}
        <h3 className="text-white text-xs font-semibold uppercase mb-4">Connect With Us</h3>
        <div className="flex gap-3 mb-8">
          <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
            <Facebook size={20} />
          </a>
          <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
            <Instagram size={20} />
          </a>
          <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
            <TikTokIcon size={20} />
          </a>
          <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black">
            <Youtube size={20} />
          </a>
        </div>

        {/* Customer Service */}
        <h3 className="text-white text-xs font-semibold uppercase mb-4">Customer Service</h3>
        <div className="text-gray-400 text-sm space-y-3 mb-8">
          <p>(10 AM – 6 PM)</p>
          <p>(Except Weekend/Govt. Holidays)</p>
          <a href="tel:+8801XXX-XXXXXX" className="flex items-center gap-2">
            <Phone size={16} />
            +880 1XXX-XXXXXX
          </a>
          <a href="mailto:info@prismin.com" className="flex items-center gap-2">
            <Mail size={16} />
            info@prismin.com
          </a>
        </div>

        {/* Information Accordion */}
        <div className="border-t border-gray-800 pt-4">
          <button 
            onClick={() => setOpenInfo(!openInfo)}
            className="w-full flex justify-between items-center py-3"
          >
            <h3 className="text-white text-xs font-semibold uppercase">Information</h3>
            <Plus size={20} className={`text-white transition-transform ${openInfo ? 'rotate-45' : ''}`} />
          </button>
          {openInfo && (
            <ul className="text-gray-400 text-sm space-y-3 pb-4">
              <li><Link href="/about">About PRISMIN</Link></li>
              <li><Link href="/safety">Safety Advisory</Link></li>
              <li><Link href="/community">Community Guidelines</Link></li>
              <li><Link href="/social-responsibility">Social Responsibility</Link></li>
            </ul>
          )}
        </div>

        {/* Policy Accordion */}
        <div className="border-t border-gray-800 pt-4">
          <button 
            onClick={() => setOpenPolicy(!openPolicy)}
            className="w-full flex justify-between items-center py-3"
          >
            <h3 className="text-white text-xs font-semibold uppercase">Policy</h3>
            <Plus size={20} className={`text-white transition-transform ${openPolicy ? 'rotate-45' : ''}`} />
          </button>
          {openPolicy && (
            <ul className="text-gray-400 text-sm space-y-3 pb-4">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/delivery">Delivery Policy</Link></li>
              <li><Link href="/return">Return and Exchange Policy</Link></li>
              <li><Link href="/terms">Terms and Conditions</Link></li>
            </ul>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800 py-6 text-center">
        <p className="text-gray-500 text-xs">© 2025 PRISMIN Brand. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
