// components/Footer.jsx
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
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // State for mobile accordions
  const [openSection, setOpenSection] = useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Desktop & Mobile Layout Combined */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Column 1: Brand & About & Socials */}
          <div className="flex flex-col space-y-6">
            {/* Logo Image */}
            <Link href="/" className="inline-block">
              <div className="relative w-32 h-12">
                <Image 
                  src="/logo.png" 
                  alt="PRISMIN Logo" 
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            
            {/* About Text */}
            <p className="text-gray-400 text-sm leading-relaxed text-justify">
              PRISMIN is a luxury destination for women who dress with intention.
              We curate soulful fashion and beauty pieces that blend global inspiration with cultural grace—honoring every woman's choice, comfort, and quiet confidence.
            </p>

            {/* Connect With Us */}
            <div className="pt-4">
              <h3 className="text-xs font-bold tracking-widest mb-4 uppercase text-white">
                Connect With Us
              </h3>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a 
                  href="#" 
                  className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a 
                  href="#" 
                  className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon size={18} />
                </a>
                <a 
                  href="#" 
                  className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Service */}
          <div className="lg:pl-8">
            <h3 className="text-xs font-bold tracking-widest mb-6 uppercase text-white">
              Customer Service
            </h3>
            <div className="space-y-4 text-sm text-gray-400">
              <p>(10 AM – 6 PM)</p>
              <p>(Except Weekend/Govt. Holidays)</p>
              
              <div className="flex items-center gap-3 pt-2 hover:text-white transition-colors">
                <Phone size={16} />
                <a href="tel:+8801XXXXXXXXX">+880 1XXX-XXXXXX</a>
              </div>
              
              <div className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail size={16} />
                <a href="mailto:info@prismin.com">info@prismin.com</a>
              </div>
            </div>
          </div>

          {/* Column 3: Information (Accordion on Mobile) */}
          <div className="border-t border-gray-800 lg:border-none pt-4 lg:pt-0">
            <div 
              className="flex justify-between items-center cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('info')}
            >
              <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-0 lg:mb-6">
                Information
              </h3>
              {/* Mobile Toggle Icons */}
              <span className="lg:hidden text-white">
                {openSection === 'info' ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </div>

            <ul className={`space-y-3 mt-4 lg:mt-0 text-sm text-gray-400 overflow-hidden transition-all duration-300 ${
              openSection === 'info' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100'
            }`}>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About PRISMIN
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white transition-colors">
                  Safety Advisory
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
              <li>
                <Link href="/responsibility" className="hover:text-white transition-colors">
                  Social Responsibility
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policy (Accordion on Mobile) */}
          <div className="border-t border-gray-800 lg:border-none pt-4 lg:pt-0">
            <div 
              className="flex justify-between items-center cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('policy')}
            >
              <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-0 lg:mb-6">
                Policy
              </h3>
              <span className="lg:hidden text-white">
                {openSection === 'policy' ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </div>

            <ul className={`space-y-3 mt-4 lg:mt-0 text-sm text-gray-400 overflow-hidden transition-all duration-300 ${
              openSection === 'policy' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100'
            }`}>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/delivery-policy" className="hover:text-white transition-colors">
                  Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition-colors">
                  Return and Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 border-t border-gray-800">
        <div className="container mx-auto px-6 py-6 text-center">
          <p className="text-gray-500 text-xs tracking-wide">
            &copy; {currentYear} PRISMIN Brand. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
