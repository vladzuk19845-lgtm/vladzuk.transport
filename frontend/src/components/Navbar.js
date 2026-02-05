import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, X, Truck, Car, Globe, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/cargo', label: t('nav.cargo'), icon: Truck },
    { path: '/passenger', label: t('nav.passenger'), icon: Car },
    { path: '/pricing', label: t('nav.pricing') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <div className="w-10 h-10 bg-[#00ff94] rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" />
            </div>
            <span className="font-heading font-bold text-xl text-white">EasyGoTrans</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.path.replace('/', '') || 'home'}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2
                  ${isActive(link.path) 
                    ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="text-zinc-400 hover:text-white rounded-full"
              data-testid="language-toggle"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language.toUpperCase()}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-zinc-400 hover:text-white rounded-full gap-2"
                    data-testid="user-menu-trigger"
                  >
                    <User className="w-4 h-4" />
                    {user?.name?.split(' ')[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2" data-testid="nav-dashboard">
                      <User className="w-4 h-4" />
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-400" data-testid="nav-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-zinc-400 hover:text-white rounded-full" data-testid="nav-login">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-full font-semibold" data-testid="nav-register">
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-white/10">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${isActive(link.path) 
                    ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
              <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="w-full justify-start text-zinc-400"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'ua' ? 'English' : 'Українська'}
              </Button>
              
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-zinc-400">
                      <User className="w-4 h-4 mr-2" />
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full justify-start text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                    <Button variant="ghost" className="w-full justify-start text-zinc-400">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block">
                    <Button className="w-full bg-[#00ff94] text-black hover:bg-[#00cc76]">
                      {t('nav.register')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
