import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Truck, User, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const RegisterPage = () => {
  const { t } = useLanguage();
  const { register, login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    user_type: 'driver'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register(formData);
      toast.success(t('common.success'));
      // Auto login after registration
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24" data-testid="register-page">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-[#00ff94] rounded-xl flex items-center justify-center">
              <Truck className="w-7 h-7 text-black" />
            </div>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-white mt-6 mb-2">
            {t('auth.register.title')}
          </h1>
          <p className="text-zinc-500">Створіть акаунт водія</p>
        </div>

        {/* Form */}
        <div className="card-glass p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">{t('auth.register.name')}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Іван Петренко"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 bg-zinc-950 border-zinc-800 focus:border-[#00ff94] h-12 rounded-xl"
                  required
                  data-testid="register-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">{t('auth.register.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-zinc-950 border-zinc-800 focus:border-[#00ff94] h-12 rounded-xl"
                  required
                  data-testid="register-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">{t('auth.register.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-zinc-950 border-zinc-800 focus:border-[#00ff94] h-12 rounded-xl"
                  required
                  minLength={6}
                  data-testid="register-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">{t('auth.register.phone')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+380 XX XXX XX XX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10 bg-zinc-950 border-zinc-800 focus:border-[#00ff94] h-12 rounded-xl"
                  required
                  data-testid="register-phone"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-zinc-300">{t('auth.register.city')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="city"
                  type="text"
                  placeholder="Київ"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="pl-10 bg-zinc-950 border-zinc-800 focus:border-[#00ff94] h-12 rounded-xl"
                  required
                  data-testid="register-city"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-full h-12 font-bold"
              disabled={loading}
              data-testid="register-submit"
            >
              {loading ? t('common.loading') : t('auth.register.submit')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-zinc-500">
              {t('auth.register.hasAccount')}{' '}
              <Link to="/login" className="text-[#00ff94] hover:underline" data-testid="register-login-link">
                {t('auth.register.login')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
