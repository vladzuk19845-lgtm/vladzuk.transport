import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Truck, Car, Search, Shield, DollarSign, MapPin, 
  ArrowRight, ChevronRight, Zap, Users, Package 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { PricingCard } from '../components/PricingCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const LandingPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ drivers: 0, vehicles: 0, cargo_vehicles: 0, passenger_vehicles: 0 });
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, packagesRes] = await Promise.all([
          axios.get(`${API}/stats`),
          axios.get(`${API}/packages`)
        ]);
        setStats(statsRes.data);
        setPackages(packagesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: Zap, titleKey: 'features.1.title', descKey: 'features.1.desc', color: 'from-yellow-500 to-orange-500' },
    { icon: Shield, titleKey: 'features.2.title', descKey: 'features.2.desc', color: 'from-blue-500 to-cyan-500' },
    { icon: DollarSign, titleKey: 'features.3.title', descKey: 'features.3.desc', color: 'from-green-500 to-emerald-500' },
    { icon: MapPin, titleKey: 'features.4.title', descKey: 'features.4.desc', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 gradient-radial" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1602607771743-9f829d8419e9?w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#09090b]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[#00ff94] animate-pulse" />
              <span className="text-zinc-400 text-sm">Платформа #1 для перевізників</span>
            </div>

            {/* Title */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-7xl text-white mb-6 animate-fade-in animate-delay-100" data-testid="hero-title">
              {t('hero.title')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl mx-auto mb-10 animate-fade-in animate-delay-200">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in animate-delay-300">
              <Link to="/cargo">
                <Button 
                  size="lg" 
                  className="bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-full text-lg px-8 py-6 font-bold neon-glow-hover"
                  data-testid="hero-search-btn"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {t('hero.cta.search')}
                </Button>
              </Link>
              <Link to={isAuthenticated ? "/dashboard" : "/register"}>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-zinc-700 text-white hover:bg-white/5 rounded-full text-lg px-8 py-6"
                  data-testid="hero-driver-btn"
                >
                  {t('hero.cta.driver')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in animate-delay-400">
              <div className="card-glass p-6 text-center">
                <div className="text-3xl font-heading font-bold text-[#00ff94] mb-1">{stats.drivers || '50+'}+</div>
                <div className="text-zinc-500 text-sm">{t('hero.stats.drivers')}</div>
              </div>
              <div className="card-glass p-6 text-center">
                <div className="text-3xl font-heading font-bold text-[#00ff94] mb-1">{stats.vehicles || '100+'}+</div>
                <div className="text-zinc-500 text-sm">{t('hero.stats.vehicles')}</div>
              </div>
              <div className="card-glass p-6 text-center">
                <div className="text-3xl font-heading font-bold text-[#00ff94] mb-1">
                  <Truck className="w-8 h-8 mx-auto mb-1" />
                  {stats.cargo_vehicles || '70+'}
                </div>
                <div className="text-zinc-500 text-sm">{t('vehicle.cargo')}</div>
              </div>
              <div className="card-glass p-6 text-center">
                <div className="text-3xl font-heading font-bold text-[#00ff94] mb-1">
                  <Car className="w-8 h-8 mx-auto mb-1" />
                  {stats.passenger_vehicles || '30+'}
                </div>
                <div className="text-zinc-500 text-sm">{t('vehicle.passenger')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-6 h-6 text-zinc-600 rotate-90" />
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" data-testid="services-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Cargo */}
            <Link to="/cargo" className="group">
              <div className="card-glass p-8 h-full hover:scale-[1.02] transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Truck className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-white mb-3">{t('nav.cargo')}</h3>
                <p className="text-zinc-400 mb-6">
                  Знайдіть вантажівки будь-якого розміру для перевезення ваших товарів по всій Україні
                </p>
                <div className="flex items-center text-[#00ff94] font-semibold">
                  Переглянути <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Passenger */}
            <Link to="/passenger" className="group">
              <div className="card-glass p-8 h-full hover:scale-[1.02] transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Car className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-white mb-3">{t('nav.passenger')}</h3>
                <p className="text-zinc-400 mb-6">
                  Оберіть комфортний автомобіль з водієм для ділових поїздок або подорожей
                </p>
                <div className="flex items-center text-[#00ff94] font-semibold">
                  Переглянути <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950/50" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
              {t('features.title')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card-glass p-6 text-center hover:scale-[1.03] transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white mb-2">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-zinc-500 text-sm">
                  {t(feature.descKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" id="pricing" data-testid="pricing-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl sm:text-4xl text-white mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-zinc-400 text-lg">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((plan) => (
              <PricingCard 
                key={plan.id} 
                plan={plan} 
                onSubscribe={() => window.location.href = isAuthenticated ? '/dashboard' : '/register'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="card-glass p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00ff94]/5 via-transparent to-[#6366f1]/5" />
            <div className="relative z-10">
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mb-4">
                Готові почати?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Приєднуйтесь до TransportPro сьогодні та почніть заробляти на своєму транспорті
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-full px-8 py-6 font-bold"
                    data-testid="cta-register-btn"
                  >
                    Зареєструватися безкоштовно
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
