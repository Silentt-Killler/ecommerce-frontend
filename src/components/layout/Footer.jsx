'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Youtube, Plus, Minus, Phone, Mail } from 'lucide-react';

// কাস্টম টিকটক আইকন যা চ্যাপ্টা হবে না
const TikTokIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
  </svg>
);

export default function Footer() {
  const [openSection, setOpenSection] = useState('');

  const toggle = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <footer style={{ backgroundColor: '#1a1a1a' }} className="text-white pt-12 pb-6 w-full overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Brand & Socials */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="block">
              <Image 
                src="/logo.png" 
                alt="PRISMIN" 
                width={140} 
                height={45} 
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-[#a3a3a3] text-[13px] leading-relaxed max-w-sm">
              PRISMIN is a luxury destination for women who dress with intention. 
              We curate soulful fashion and beauty pieces that blend global inspiration with cultural grace.
            </p>
            <div className="pt-4">
              <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4">Connect With Us</h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Facebook size={16} />, label: 'FB' },
                  { icon: <Instagram size={16} />, label: 'IG' },
                  { icon: <TikTokIcon />, label: 'TT' },
                  { icon: <Youtube size={16} />, label: 'YT' }
                ].map((social, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6 hidden lg:block">Customer Service</h4>
            <div className="text-[#a3a3a3] text-[13px] space-y-4">
              <div className="lg:mb-6">
                <p>(10 AM – 6 PM)</p>
                <p>(Except Weekend/Govt. Holidays)</p>
              </div>
              <a href="tel:+8801708156699" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone size={14} className="flex-shrink-0" /> +880 1708-156699
              </a>
              <a href="mailto:online@prismin.com" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail size={14} className="flex-shrink-0" /> online@prismin.com
              </a>
            </div>
          </div>

          {/* Information - Desktop */}
          <div className="lg:col-span-2 hidden lg:block">
            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6">Information</h4>
            <ul className="text-[#a3a3a3] text-[13px] space-y-3">
              <li><Link href="/about" className="hover:text-white">About PRISMIN</Link></li>
              <li><Link href="/safety" className="hover:text-white">Safety Advisory</Link></li>
              <li><Link href="/guidelines" className="hover:text-white">Community Guidelines</Link></li>
              <li><Link href="/responsibility" className="hover:text-white">Social Responsibility</Link></li>
            </ul>
          </div>

          {/* Policy - Desktop */}
          <div className="lg:col-span-3 hidden lg:block">
            <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6">Policy</h4>
            <ul className="text-[#a3a3a3] text-[13px] space-y-3">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/delivery" className="hover:text-white">Delivery Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white">Return & Exchange Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms and Conditions</Link></li>
            </ul>
          </div>

          {/* Mobile Accordions */}
          <div className="lg:hidden border-t border-[#333] pt-2">
            {[
              { id: 'info', title: 'Information', links: ['About PRISMIN', 'Safety Advisory', 'Community Guidelines', 'Social Responsibility'] },
              { id: 'policy', title: 'Policy', links: ['Privacy Policy', 'Delivery Policy', 'Return & Exchange Policy', 'Terms and Conditions'] }
            ].map((section) => (
              <div key={section.id} className="border-b border-[#333]">
                <button 
                  onClick={() => toggle(section.id)}
                  className="w-full py-4 flex justify-between items-center text-[11px] font-bold tracking-[0.2em] uppercase"
                >
                  {section.title}
                  {openSection === section.id ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openSection === section.id ? 'max-h-48 pb-4' : 'max-h-0'}`}>
                  <ul className="text-[#a3a3a3] text-[13px] space-y-3">
                    {section.links.map((link, idx) => (
                      <li key={idx}><Link href="#" className="block">{link}</Link></li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-[#333] text-center">
          <p className="text-[#737373] text-[11px] tracking-widest uppercase">
            © {new Date().getFullYear()} PRISMIN Brand. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
