import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ua: {
    // Navigation
    'nav.home': 'Головна',
    'nav.cargo': 'Вантажні перевезення',
    'nav.passenger': 'Пасажирські перевезення',
    'nav.pricing': 'Тарифи',
    'nav.login': 'Увійти',
    'nav.register': 'Реєстрація',
    'nav.dashboard': 'Кабінет',
    'nav.logout': 'Вийти',
    
    // Hero
    'hero.title': 'Знайдіть ідеального перевізника',
    'hero.subtitle': 'Платформа, де водії пропонують свої послуги, а клієнти знаходять найкращих перевізників для вантажних та пасажирських перевезень по всій Україні',
    'hero.cta.search': 'Знайти перевізника',
    'hero.cta.driver': 'Я водій',
    'hero.stats.drivers': 'Водіїв',
    'hero.stats.vehicles': 'Транспорту',
    'hero.stats.cities': 'Міст',
    
    // Features
    'features.title': 'Чому обирають TransportPro',
    'features.1.title': 'Швидкий пошук',
    'features.1.desc': 'Знайдіть потрібний транспорт за лічені секунди',
    'features.2.title': 'Перевірені водії',
    'features.2.desc': 'Всі водії проходять верифікацію',
    'features.3.title': 'Прозорі ціни',
    'features.3.desc': 'Без прихованих комісій та доплат',
    'features.4.title': 'По всій Україні',
    'features.4.desc': 'Працюємо у всіх містах країни',
    
    // Pricing
    'pricing.title': 'Тарифні плани',
    'pricing.subtitle': 'Оберіть план, який підходить саме вам',
    'pricing.popular': 'Популярний',
    'pricing.perMonth': '/місяць',
    'pricing.subscribe': 'Підписатися',
    
    // Auth
    'auth.login.title': 'Вхід',
    'auth.login.email': 'Email',
    'auth.login.password': 'Пароль',
    'auth.login.submit': 'Увійти',
    'auth.login.noAccount': 'Немає акаунту?',
    'auth.login.register': 'Зареєструватися',
    
    'auth.register.title': 'Реєстрація',
    'auth.register.name': "Повне ім'я",
    'auth.register.email': 'Email',
    'auth.register.password': 'Пароль',
    'auth.register.phone': 'Телефон',
    'auth.register.city': 'Місто',
    'auth.register.submit': 'Зареєструватися',
    'auth.register.hasAccount': 'Вже є акаунт?',
    'auth.register.login': 'Увійти',
    
    // Dashboard
    'dashboard.title': 'Мій кабінет',
    'dashboard.subscription': 'Підписка',
    'dashboard.active': 'Активна',
    'dashboard.inactive': 'Неактивна',
    'dashboard.expires': 'Діє до',
    'dashboard.myVehicles': 'Мій транспорт',
    'dashboard.addVehicle': 'Додати транспорт',
    'dashboard.noVehicles': 'У вас ще немає доданого транспорту',
    'dashboard.activateDemo': 'Активувати демо-підписку',
    'dashboard.needSubscription': 'Для додавання транспорту потрібна активна підписка',
    
    // Vehicle
    'vehicle.type': 'Тип',
    'vehicle.cargo': 'Вантажний',
    'vehicle.passenger': 'Пасажирський',
    'vehicle.brand': 'Марка',
    'vehicle.model': 'Модель',
    'vehicle.year': 'Рік',
    'vehicle.capacity': 'Вантажопідйомність (тонн)',
    'vehicle.dimensions': 'Габарити (Д×Ш×В), м',
    'vehicle.seats': 'Місць',
    'vehicle.description': 'Опис',
    'vehicle.pricePerKm': 'Ціна за км (грн)',
    'vehicle.available': 'Доступний',
    'vehicle.save': 'Зберегти',
    'vehicle.cancel': 'Скасувати',
    'vehicle.delete': 'Видалити',
    'vehicle.edit': 'Редагувати',
    'vehicle.contact': 'Зв\'язатися',
    
    // Search
    'search.title': 'Пошук транспорту',
    'search.city': 'Місто',
    'search.cityPlaceholder': 'Введіть місто',
    'search.minCapacity': 'Мін. вантажопідйомність',
    'search.maxPrice': 'Макс. ціна за км',
    'search.button': 'Знайти',
    'search.noResults': 'Нічого не знайдено',
    'search.results': 'Знайдено',
    
    // Footer
    'footer.description': 'Платформа для пошуку перевізників по всій Україні',
    'footer.rights': 'Всі права захищено',
    
    // Common
    'common.loading': 'Завантаження...',
    'common.error': 'Помилка',
    'common.success': 'Успішно',
    'common.uah': 'грн',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.cargo': 'Cargo',
    'nav.passenger': 'Passenger',
    'nav.pricing': 'Pricing',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Hero
    'hero.title': 'Find the Perfect Carrier',
    'hero.subtitle': 'A platform where drivers offer their services and clients find the best carriers for cargo and passenger transportation across Ukraine',
    'hero.cta.search': 'Find a Carrier',
    'hero.cta.driver': "I'm a Driver",
    'hero.stats.drivers': 'Drivers',
    'hero.stats.vehicles': 'Vehicles',
    'hero.stats.cities': 'Cities',
    
    // Features
    'features.title': 'Why Choose TransportPro',
    'features.1.title': 'Fast Search',
    'features.1.desc': 'Find the right transport in seconds',
    'features.2.title': 'Verified Drivers',
    'features.2.desc': 'All drivers are verified',
    'features.3.title': 'Transparent Pricing',
    'features.3.desc': 'No hidden fees or charges',
    'features.4.title': 'All Ukraine',
    'features.4.desc': 'We operate in all cities',
    
    // Pricing
    'pricing.title': 'Pricing Plans',
    'pricing.subtitle': 'Choose the plan that suits you',
    'pricing.popular': 'Popular',
    'pricing.perMonth': '/month',
    'pricing.subscribe': 'Subscribe',
    
    // Auth
    'auth.login.title': 'Login',
    'auth.login.email': 'Email',
    'auth.login.password': 'Password',
    'auth.login.submit': 'Sign In',
    'auth.login.noAccount': "Don't have an account?",
    'auth.login.register': 'Register',
    
    'auth.register.title': 'Register',
    'auth.register.name': 'Full Name',
    'auth.register.email': 'Email',
    'auth.register.password': 'Password',
    'auth.register.phone': 'Phone',
    'auth.register.city': 'City',
    'auth.register.submit': 'Sign Up',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.register.login': 'Login',
    
    // Dashboard
    'dashboard.title': 'My Dashboard',
    'dashboard.subscription': 'Subscription',
    'dashboard.active': 'Active',
    'dashboard.inactive': 'Inactive',
    'dashboard.expires': 'Expires',
    'dashboard.myVehicles': 'My Vehicles',
    'dashboard.addVehicle': 'Add Vehicle',
    'dashboard.noVehicles': 'You have no vehicles yet',
    'dashboard.activateDemo': 'Activate Demo Subscription',
    'dashboard.needSubscription': 'Active subscription required to add vehicles',
    
    // Vehicle
    'vehicle.type': 'Type',
    'vehicle.cargo': 'Cargo',
    'vehicle.passenger': 'Passenger',
    'vehicle.brand': 'Brand',
    'vehicle.model': 'Model',
    'vehicle.year': 'Year',
    'vehicle.capacity': 'Capacity (tons)',
    'vehicle.dimensions': 'Dimensions (L×W×H), m',
    'vehicle.seats': 'Seats',
    'vehicle.description': 'Description',
    'vehicle.pricePerKm': 'Price per km (UAH)',
    'vehicle.available': 'Available',
    'vehicle.save': 'Save',
    'vehicle.cancel': 'Cancel',
    'vehicle.delete': 'Delete',
    'vehicle.edit': 'Edit',
    'vehicle.contact': 'Contact',
    
    // Search
    'search.title': 'Search Transport',
    'search.city': 'City',
    'search.cityPlaceholder': 'Enter city',
    'search.minCapacity': 'Min capacity',
    'search.maxPrice': 'Max price per km',
    'search.button': 'Search',
    'search.noResults': 'No results found',
    'search.results': 'Found',
    
    // Footer
    'footer.description': 'Platform for finding carriers across Ukraine',
    'footer.rights': 'All rights reserved',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.uah': 'UAH',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'ua';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ua' ? 'en' : 'ua');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
