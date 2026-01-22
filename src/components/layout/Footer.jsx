import Link from 'next/link';
import { Facebook, Instagram, Twitter, Phone, Mail, Youtube } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-focus text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container-custom mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/">
              <h2 className="text-3xl tracking-[0.2em] font-bold uppercase">PRISMIN</h2>
            </Link>
            
            <p className="text-gray-300 text-sm leading-relaxed text-justify">
              PRISMIN is a women-first fashion and beauty brand for those who dress with intention. 
              Blending global inspiration with the grace of our own culture, we curate soulful pieces 
              that honour a woman’s choice, comfort, and quiet confidence.
            </p>

            <div className="pt-4">
              <h4 className="text-sm font-bold uppercase tracking-wider mb-4">CONNECT WITH US</h4>
              <div className="flex gap-3">
                {/* Circular Social Icons like Rise */}
                <a href="#" className="bg-white text-black p-2.5 rounded-full hover:bg-gray-200 transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="bg-white text-black p-2.5 rounded-full hover:bg-gray-200 transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="bg-white text-black p-2.5 rounded-full hover:bg-gray-200 transition-colors">
                  <Twitter size={18} />
                </a>
                <a href="#" className="bg-white text-black p-2.5 rounded-full hover:bg-gray-200 transition-colors">
                  <Youtube size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Need Help? */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6">NEED HELP?</h3>
            <div className="space-y-4 text-sm text-gray-300">
              <p>
                (10 AM – 6 PM)<br />
                (Except Weekend/Govt. Holidays)
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <Phone size={18} className="text-white" />
                <span className="hover:text-white transition-colors">+880 1XXX-XXXXXX</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-white" />
                <a href="mailto:info@prismin.com" className="underline hover:text-white transition-colors">
                  info@prismin.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6">INFORMATION</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About PRISMIN
                </Link>
              </li>
              <li>
                <Link href="/social-responsibility" className="hover:text-white transition-colors">
                  Social Responsibility
                </Link>
              </li>
              {/* Added Store Locator to match visuals, remove if not needed */}
              <li>
                <Link href="/stores" className="hover:text-white transition-colors">
                  Store Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policy */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6">POLICY</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Return and Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white transition-colors">
                  Safety Advisory
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-xs tracking-wide">
            &copy; {currentYear} PRISMIN Brand. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
