import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const PricingCard = ({ plan, onSubscribe, loading }) => {
  const { language, t } = useLanguage();
  
  const name = language === 'ua' ? plan.name_ua : plan.name;
  const description = language === 'ua' ? plan.description_ua : plan.description;
  const features = language === 'ua' ? plan.features_ua : plan.features;
  const priceUAH = plan.price / 100;

  return (
    <div 
      className={`relative card-glass p-6 ${plan.popular ? 'border-[#00ff94]/50 ring-1 ring-[#00ff94]/30' : ''}`}
      data-testid={`pricing-card-${plan.id}`}
    >
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff94] text-black font-semibold">
          {t('pricing.popular')}
        </Badge>
      )}

      <div className="text-center mb-6">
        <h3 className="font-heading font-bold text-xl text-white mb-2">{name}</h3>
        <p className="text-zinc-500 text-sm">{description}</p>
      </div>

      <div className="text-center mb-6">
        <span className="text-4xl font-heading font-bold text-white">{priceUAH}</span>
        <span className="text-zinc-500 ml-1">{t('common.uah')}{t('pricing.perMonth')}</span>
      </div>

      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-5 h-5 text-[#00ff94] flex-shrink-0 mt-0.5" />
            <span className="text-zinc-300">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className={`w-full rounded-full ${
          plan.popular 
            ? 'bg-[#00ff94] text-black hover:bg-[#00cc76]' 
            : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
        }`}
        onClick={() => onSubscribe(plan.id)}
        disabled={loading}
        data-testid={`subscribe-btn-${plan.id}`}
      >
        {loading ? t('common.loading') : t('pricing.subscribe')}
      </Button>
    </div>
  );
};
