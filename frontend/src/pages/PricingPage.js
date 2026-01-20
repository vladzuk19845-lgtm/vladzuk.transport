import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const PricingPage = () => {
  const { language, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API}/packages`);
        setPackages(response.data);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      }
    };
    fetchPackages();
  }, []);

  const handleSubscribe = async (packageId) => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    setLoading(packageId);
    try {
      const response = await axios.post(`${API}/payments/create`, { package_id: packageId });
      // Redirect to Fondy checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Помилка при створенні платежу');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12" data-testid="pricing-page">
      {/* Hero */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff94]/10 border border-[#00ff94]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[#00ff94]" />
            <span className="text-[#00ff94] text-sm font-medium">Прозорі тарифи</span>
          </div>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((plan) => {
              const name = language === 'ua' ? plan.name_ua : plan.name;
              const description = language === 'ua' ? plan.description_ua : plan.description;
              const features = language === 'ua' ? plan.features_ua : plan.features;
              const priceUAH = plan.price / 100;

              return (
                <div 
                  key={plan.id}
                  className={`relative card-glass p-8 ${
                    plan.popular 
                      ? 'border-[#00ff94]/50 ring-2 ring-[#00ff94]/20 scale-105' 
                      : ''
                  }`}
                  data-testid={`pricing-card-${plan.id}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff94] text-black font-bold px-4">
                      {t('pricing.popular')}
                    </Badge>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="font-heading font-bold text-2xl text-white mb-2">{name}</h3>
                    <p className="text-zinc-500">{description}</p>
                  </div>

                  <div className="text-center mb-8">
                    <span className="text-5xl font-heading font-bold text-white">{priceUAH}</span>
                    <span className="text-zinc-500 ml-2">{t('common.uah')}{t('pricing.perMonth')}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#00ff94]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#00ff94]" />
                        </div>
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full rounded-full h-12 font-bold ${
                      plan.popular 
                        ? 'bg-[#00ff94] text-black hover:bg-[#00cc76]' 
                        : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                    }`}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    data-testid={`subscribe-btn-${plan.id}`}
                  >
                    {loading === plan.id ? t('common.loading') : t('pricing.subscribe')}
                  </Button>

                  {user?.subscription_active && user?.subscription_package === plan.id && (
                    <p className="text-center text-[#00ff94] text-sm mt-4">
                      ✓ Ваш поточний план
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ or info */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-zinc-500">
            Усі ціни вказані в українських гривнях. Оплата через платіжну систему Fondy.
            Підписка автоматично поновлюється щомісяця. Ви можете скасувати в будь-який момент.
          </p>
        </div>
      </section>
    </div>
  );
};
