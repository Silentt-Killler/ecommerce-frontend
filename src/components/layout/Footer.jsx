'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Plus, Minus, Phone, Mail } from 'lucide-react';

// TikTok Icon Component
const TikTokIcon = ({ size = 18, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Mobile Accordion State
  const [openSection, setOpenSection] = useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-12 pb-6 border-t border-gray-800">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* 1. BRAND SECTION (Logo + Text + Socials) - Spans 4 columns on Desktop */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* Logo */}
            <Link href="/" className="inline-block">
              {/* Ensure you have a valid logo at public/logo.png */}
              <div className="relative w-32 h-10">
                <Image 
                  src="/logo.png" 
                  alt="PRISMIN" 
                  width={128}
                  height={40}
                  className="object-contain object-left"
                />
              </div>
            </Link>
            
            {/* About Text */}
            <p className="text-gray-400 text-[13px] leading-relaxed pr-0 lg:pr-8 text-justify">
              PRISMIN is a luxury destination for women who dress with intention.
              We curate soulful fashion and beauty pieces that blend global inspiration with cultural grace—honoring every woman’s choice, comfort, and quiet confidence.
            </p>

            {/* Social Icons (Fixed: items-center prevents stretching) */}
            <div className="pt-2">
              <h3 className="text-[11px] font-bold tracking-[0.15em] mb-4 uppercase text-white">Connect With Us</h3>
              <div className="flex flex-row gap-3 items-center"> 
                <a href="#" className="flex items-center justify-center w-9 h-9 bg-white text-black rounded-full hover:bg-gray-200 transition-all">
                  <Facebook size={16} />
                </a>
                <a href="#" className="flex items-center justify-center w-9 h-9 bg-white text-black rounded-full hover:bg-gray-200 transition-all">
                  <Instagram size={16} />
                </a>
                <a href="#" className="flex items-center justify-center w-9 h-9 bg-white text-black rounded-full hover:bg-gray-200 transition-all">
                  <TikTokIcon size={16} />
                </a>
                <a href="#" className="flex items-center justify-center w-9 h-9 bg-white text-black rounded-full hover:bg-gray-200 transition-all">
                  <Youtube size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* 2. CUSTOMER SERVICE (Visible Desktop & Mobile) - Spans 3 columns */}
          <div className="lg:col-span-3 lg:pl-4">
            <h3 className="text-[11px] font-bold tracking-[0.15em] mb-5 uppercase text-white">
              Customer Service
            </h3>
            <div className="space-y-3 text-[13px] text-gray-400">
              <div className="mb-4">
                <p>(10 AM – 6 PM)</p>
                <p>(Except Weekend/Govt. Holidays)</p>
              </div>
              
              <div className="flex items-center gap-3 group">
                <Phone size={14} className="group-hover:text-white transition-colors"/>
                <a href="tel:+8801708156699" className="hover:text-white transition-colors">+880 1708-156699</a>
              </div>
              
              <div className="flex items-center gap-3 group">
                <Mail size={14} className="group-hover:text-white transition-colors"/>
                <a href="mailto:info@prismin.com" className="hover:text-white transition-colors">info@prismin.com</a>
              </div>
            </div>
          </div>

          {/* 3. INFORMATION (Accordion on Mobile) - Spans 2 columns */}
          <div className="lg:col-span-2 border-t border-gray-800 lg:border-none pt-4 lg:pt-0">
            <div 
              className="flex justify-between items-center cursor-pointer lg:cursor-default select-none"
              onClick={() => toggleSection('info')}
            >
              <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-white mb-0 lg:mb-5">
                Information
              </h3>
              {/* Mobile Icon */}
              <span className="lg:hidden text-white transition-transform duration-300">
                {openSection === 'info' ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSection === 'info' ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100 lg:mt-0'
            }`}>
              <ul className="space-y-2 text-[13px] text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About RISE</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">Safety Advisory</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors">Community Guidelines</Link></li>
                <li><Link href="/responsibility" className="hover:text-white transition-colors">Social Responsibility</Link></li>
              </ul>
            </div>
          </div>

          {/* 4. POLICY (Accordion on Mobile) - Spans 3 columns */}
          <div className="lg:col-span-3 border-t border-gray-800 lg:border-none pt-4 lg:pt-0">
            <div 
              className="flex justify-between items-center cursor-pointer lg:cursor-default select-none"
              onClick={() => toggleSection('policy')}
            >
              <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-white mb-0 lg:mb-5">
                Policy
              </h3>
              <span className="lg:hidden text-white transition-transform duration-300">
                {openSection === 'policy' ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openSection === 'policy' ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100 lg:mt-0'
            }`}>
              <ul className="space-y-2 text-[13px] text-gray-400">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/delivery-policy" className="hover:text-white transition-colors">Delivery Policy</Link></li>
                <li><Link href="/return-policy" className="hover:text-white transition-colors">Return and Exchange Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link></li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="mt-12 border-t border-gray-800 bg-[#1a1a1a]">
        <div className="container mx-auto px-6 py-6 text-center">
          <p className="text-gray-500 text-[11px] tracking-wide">
            &copy; {currentYear} PRISMIN. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
