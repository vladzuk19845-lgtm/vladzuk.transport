import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import { Search, Truck, MapPin, Filter, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { VehicleCard } from '../components/VehicleCard';
import { Badge } from '../components/ui/badge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const CargoPage = () => {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    city: '',
    minCapacity: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async (searchFilters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('vehicle_type', 'cargo');
      if (searchFilters.city) params.append('city', searchFilters.city);
      if (searchFilters.minCapacity) params.append('min_capacity', searchFilters.minCapacity);
      if (searchFilters.maxPrice) params.append('max_price', searchFilters.maxPrice);
      
      const response = await axios.get(`${API}/vehicles?${params.toString()}`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVehicles(filters);
  };

  const clearFilters = () => {
    setFilters({ city: '', minCapacity: '', maxPrice: '' });
    fetchVehicles({});
  };

  const hasActiveFilters = filters.city || filters.minCapacity || filters.maxPrice;

  return (
    <div className="min-h-screen pt-20 pb-12" data-testid="cargo-page">
      {/* Hero */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Truck className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white">
                {t('nav.cargo')}
              </h1>
              <p className="text-zinc-500">Знайдіть вантажівки по всій Україні</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearch} className="card-glass p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* City Search */}
              <div className="flex-1">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <Input
                    value={filters.city}
                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    placeholder={t('search.cityPlaceholder')}
                    className="pl-10 bg-zinc-950 border-zinc-800 h-12 rounded-xl"
                    data-testid="search-city"
                  />
                </div>
              </div>

              {/* Toggle Filters */}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 rounded-xl h-12"
              >
                <Filter className="w-4 h-4 mr-2" />
                Фільтри
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-[#00ff94] text-black text-xs">!</Badge>
                )}
              </Button>

              {/* Search Button */}
              <Button
                type="submit"
                className="bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-xl h-12 px-8"
                data-testid="search-btn"
              >
                <Search className="w-4 h-4 mr-2" />
                {t('search.button')}
              </Button>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-zinc-800 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-zinc-500 text-sm mb-2 block">{t('search.minCapacity')} (тонн)</label>
                  <Input
                    type="number"
                    value={filters.minCapacity}
                    onChange={(e) => setFilters({ ...filters, minCapacity: e.target.value })}
                    placeholder="5"
                    className="bg-zinc-950 border-zinc-800 rounded-xl"
                    data-testid="filter-capacity"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 text-sm mb-2 block">{t('search.maxPrice')} (грн/км)</label>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="50"
                    className="bg-zinc-950 border-zinc-800 rounded-xl"
                    data-testid="filter-price"
                  />
                </div>
                {hasActiveFilters && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-zinc-500 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Очистити фільтри
                    </Button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-zinc-500">
              {t('search.results')}: <span className="text-white font-semibold">{vehicles.length}</span>
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-[#00ff94] border-t-transparent rounded-full mx-auto" />
              <p className="text-zinc-500 mt-4">{t('common.loading')}</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="card-glass p-16 text-center">
              <Truck className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="font-heading font-bold text-xl text-white mb-2">{t('search.noResults')}</h3>
              <p className="text-zinc-500">Спробуйте змінити параметри пошуку</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
