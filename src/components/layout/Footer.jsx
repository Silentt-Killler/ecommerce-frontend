import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-focus text-white">
      {/* Main Footer */}
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/">
              <h2 className="text-2xl tracking-[0.3em] font-light mb-4">PRISMIN</h2>
            </Link>
            <p className="text-primary-400 text-sm leading-relaxed">
              Premium quality products for the modern lifestyle.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm tracking-[0.2em] mb-6">SHOP</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/shop?category=menswear" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Menswear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=womenswear" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Womenswear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=winter-collection" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Winter Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?category=watch" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Watch
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-primary-400 text-sm hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm tracking-[0.2em] mb-6">HELP</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-primary-400 text-sm hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-primary-400 text-sm hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm tracking-[0.2em] mb-6">CONTACT</h3>
            <ul className="space-y-3 text-primary-400 text-sm">
              <li>Dhaka, Bangladesh</li>
              <li>+880 1XXX-XXXXXX</li>
              <li>info@prismin.com</li>
            </ul>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-primary-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-primary-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-primary-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-primary-500 text-xs tracking-wide">
            <p>&copy; {currentYear} PRISMIN. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
