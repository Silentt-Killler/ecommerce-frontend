import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-focus text-white">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-2xl mb-4">BRAND</h3>
            <p className="text-primary-400 text-sm leading-relaxed">
              Premium quality products for your lifestyle. 
              We deliver excellence in every order.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-primary-400 hover:text-gold transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-primary-400 hover:text-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-primary-400 hover:text-gold transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-primary-400 hover:text-gold transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-primary-400 hover:text-gold transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-primary-400 hover:text-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-primary-400 hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-medium mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-primary-400 hover:text-gold transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-primary-400 hover:text-gold transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-primary-400 hover:text-gold transition-colors">
                  Returns & Exchange
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-primary-400 hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-primary-400">
              <li>Dhaka, Bangladesh</li>
              <li>+880 1XXX-XXXXXX</li>
              <li>info@yourbrand.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-800 mt-12 pt-8 text-center text-sm text-primary-400">
          <p>© {new Date().getFullYear()} BRAND. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
