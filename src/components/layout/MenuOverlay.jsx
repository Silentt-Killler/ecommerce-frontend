'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Instagram, Facebook, Twitter } from 'lucide-react';

const menuItems = [
  { name: 'MENSWEAR', href: '/menswear' },
  { name: 'WOMENSWEAR', href: '/womenswear' },
  { name: 'WATCHES', href: '/watch' },
  { name: 'BEAUTY & CARE', href: '/beauty' },
  { name: 'ALL PRODUCTS', href: '/shop' },
];

const footerLinks = [
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Shipping', href: '/shipping' },
];

export default function MenuOverlay({ isOpen, onClose }) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-white"
      style={{ animation: 'slideIn 0.3s ease' }}
    >
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" onClick={onClose} className="text-xl tracking-[0.3em] font-light">
              PRISMIN
            </Link>
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="flex flex-col justify-between h-[calc(100vh-80px)]">
        {/* Main Menu Items */}
        <div className="flex-1 flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 w-full">
            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="block group"
                  style={{ 
                    animation: `fadeInUp 0.4s ease ${index * 0.05}s both`
                  }}
                >
                  <div className="flex items-center justify-between py-4 border-b border-transparent hover:border-gray-200 transition-colors">
                    <span className="text-3xl md:text-5xl font-light tracking-[0.15em] text-gray-900 group-hover:text-[#B08B5C] transition-colors">
                      {item.name}
                    </span>
                    <span className="text-2xl text-gray-300 group-hover:text-[#B08B5C] group-hover:translate-x-2 transition-all">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100">
          <div className="max-w-[1400px] mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Footer Links */}
              <div className="flex items-center gap-8">
                {footerLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={onClose}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
