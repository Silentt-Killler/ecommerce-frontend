'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Plus, Minus, Phone, Mail } from 'lucide-react';

// কাস্টম টিকটক আইকন যেহেতু লুসাইড আইকনে এটি সবসময় থাকে না
const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

export default function Footer() {
  const [openSection, setOpenSection] = useState('');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* ১. সাবস্ক্রাইব সেকশন (Stay Updated) */}
      <div className="border-b border-gray-800 py-16 text-center">
        <h2 className="text-[20px] tracking-[0.4em] font-medium mb-4 uppercase">Stay Updated</h2>
        <p className="text-gray-400 text-xs mb-8">Subscribe to receive updates on new arrivals and special offers</p>
        <div className="flex max-w-lg mx-auto px-4">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="flex-grow bg-transparent border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors"
          />
          <button className="bg-white text-black px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors">
            Subscribe
          </button>
        </div>
      </div>

      {/* ২. মেইন ফুটার কন্টেন্ট */}
      <div className="container mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* ব্র্যান্ড এবং সোশ্যাল - ৪ কলাম */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block">
              <h2 className="text-3xl tracking-[0.3em] font-light">PRISMIN</h2>
            </Link>
            <p className="text-gray-400 text-[13px] leading-relaxed max-w-sm">
              PRISMIN is a luxury destination for women who dress with intention. We curate soulful fashion and beauty pieces that blend global inspiration with cultural grace—honoring every woman’s choice, comfort, and quiet confidence.
            </p>
            <div>
              <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4">Connect With Us</h4>
              <div className="flex gap-3">
                {[
                  { icon: <Facebook size={18} />, href: "#" },
                  { icon: <Instagram size={18} />, href: "#" },
                  { icon: <TikTokIcon />, href: "#" },
                  { icon: <Youtube size={18} />, href: "#" }
                ].map((social, idx) => (
                  <a key={idx} href={social.href} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-300 transition-all">
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* কাস্টমার সার্ভিস - ৩ কলাম */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6">Customer Service</h4>
            <div className="text-gray-400 text-[13px] space-y-4">
              <div className="mb-6">
                <p>(10 AM – 6 PM)</p>
                <p>(Except Weekend/Govt. Holidays)</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} />
                <a href="tel:+8801708156699" className="hover:text-white transition-colors">+880 1708-156699</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} />
                <a href="mailto:online@prismin.com" className="hover:text-white transition-colors">online@prismin.com</a>
              </div>
            </div>
          </div>

          {/* ইনফরমেশন - ২ কলাম (ডেস্কটপে আলাদা, মোবাইলে একর্ডিয়ন) */}
          <div className="lg:col-span-2 border-t border-gray-800 lg:border-none">
            <div 
              className="flex justify-between items-center py-4 lg:py-0 cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('info')}
            >
              <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase lg:mb-6">Information</h4>
              <span className="lg:hidden">{openSection === 'info' ? <Minus size={16} /> : <Plus size={16} />}</span>
            </div>
            <ul className={`text-gray-400 text-[13px] space-y-3 overflow-hidden transition-all duration-300 ${openSection === 'info' ? 'max-h-60 pb-4' : 'max-h-0 lg:max-h-full'}`}>
              <li><Link href="/about" className="hover:text-white transition-colors">About PRISMIN</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Safety Advisory</Link></li>
              <li><Link href="/guidelines" className="hover:text-white transition-colors">Community Guidelines</Link></li>
              <li><Link href="/responsibility" className="hover:text-white transition-colors">Social Responsibility</Link></li>
            </ul>
          </div>

          {/* পলিসি - ৩ কলাম */}
          <div className="lg:col-span-3 border-t border-gray-800 lg:border-none">
            <div 
              className="flex justify-between items-center py-4 lg:py-0 cursor-pointer lg:cursor-default"
              onClick={() => toggleSection('policy')}
            >
              <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase lg:mb-6">Policy</h4>
              <span className="lg:hidden">{openSection === 'policy' ? <Minus size={16} /> : <Plus size={16} />}</span>
            </div>
            <ul className={`text-gray-400 text-[13px] space-y-3 overflow-hidden transition-all duration-300 ${openSection === 'policy' ? 'max-h-60 pb-4' : 'max-h-0 lg:max-h-full'}`}>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/delivery" className="hover:text-white transition-colors">Delivery Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Return and Exchange Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* ৩. কপিরাইট বার */}
      <div className="border-t border-gray-800 py-8 text-center bg-[#151515]">
        <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">
          © {new Date().getFullYear()} PRISMIN Brand. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
