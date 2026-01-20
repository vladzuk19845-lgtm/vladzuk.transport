import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Truck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#00ff94] rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-black" />
              </div>
              <span className="font-heading font-bold text-xl text-white">TransportPro</span>
            </Link>
            <p className="text-zinc-500 max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-white mb-4">Навігація</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/cargo" className="text-zinc-500 hover:text-[#00ff94] transition-colors">
                  {t('nav.cargo')}
                </Link>
              </li>
              <li>
                <Link to="/passenger" className="text-zinc-500 hover:text-[#00ff94] transition-colors">
                  {t('nav.passenger')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-zinc-500 hover:text-[#00ff94] transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-white mb-4">Контакти</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-zinc-500">
                <Mail className="w-4 h-4 text-[#00ff94]" />
                info@transportpro.ua
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <Phone className="w-4 h-4 text-[#00ff94]" />
                +380 (44) 123-45-67
              </li>
              <li className="flex items-center gap-2 text-zinc-500">
                <MapPin className="w-4 h-4 text-[#00ff94]" />
                Київ, Україна
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">
            © 2024 TransportPro. {t('footer.rights')}.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-zinc-600 hover:text-[#00ff94] text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-zinc-600 hover:text-[#00ff94] text-sm transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
