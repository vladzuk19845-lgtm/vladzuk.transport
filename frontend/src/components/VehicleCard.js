import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Truck, Car, MapPin, Phone, Package, Users, Ruler } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const VehicleCard = ({ vehicle, showContact = true }) => {
  const { t } = useLanguage();
  
  const isCargo = vehicle.vehicle_type === 'cargo';
  const Icon = isCargo ? Truck : Car;

  const defaultImage = isCargo 
    ? 'https://images.unsplash.com/photo-1602607771743-9f829d8419e9?w=400&h=300&fit=crop'
    : 'https://images.pexels.com/photos/28977056/pexels-photo-28977056.jpeg?w=400&h=300&fit=crop';

  return (
    <div 
      className="card-glass overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
      data-testid={`vehicle-card-${vehicle.id}`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={vehicle.images?.[0] || defaultImage}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${isCargo ? 'bg-blue-500' : 'bg-purple-500'} text-white`}>
            <Icon className="w-3 h-3 mr-1" />
            {isCargo ? t('vehicle.cargo') : t('vehicle.passenger')}
          </Badge>
        </div>
        {vehicle.available && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-[#00ff94] text-black">
              {t('vehicle.available')}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-heading font-bold text-lg text-white mb-1">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-zinc-500 text-sm mb-3">{vehicle.year}</p>

        {/* Specs */}
        <div className="space-y-2 mb-4">
          {isCargo && vehicle.capacity_tons && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Package className="w-4 h-4 text-[#00ff94]" />
              <span>{vehicle.capacity_tons} {t('vehicle.capacity')}</span>
            </div>
          )}
          {isCargo && vehicle.dimensions_length && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Ruler className="w-4 h-4 text-[#00ff94]" />
              <span>{vehicle.dimensions_length}×{vehicle.dimensions_width}×{vehicle.dimensions_height} м</span>
            </div>
          )}
          {!isCargo && vehicle.passenger_seats && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Users className="w-4 h-4 text-[#00ff94]" />
              <span>{vehicle.passenger_seats} {t('vehicle.seats')}</span>
            </div>
          )}
          {vehicle.driver_city && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <MapPin className="w-4 h-4 text-[#00ff94]" />
              <span>{vehicle.driver_city}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <div>
            <span className="text-2xl font-heading font-bold text-[#00ff94]">
              {vehicle.price_per_km}
            </span>
            <span className="text-zinc-500 text-sm ml-1">{t('common.uah')}/км</span>
          </div>
          
          {showContact && vehicle.driver_phone && (
            <Button 
              size="sm" 
              className="bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-full"
              onClick={() => window.location.href = `tel:${vehicle.driver_phone}`}
              data-testid={`contact-btn-${vehicle.id}`}
            >
              <Phone className="w-4 h-4 mr-1" />
              {t('vehicle.contact')}
            </Button>
          )}
        </div>

        {/* Driver info */}
        {vehicle.driver_name && (
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-xs font-bold text-[#00ff94]">
                {vehicle.driver_name.charAt(0)}
              </span>
            </div>
            <span className="text-zinc-400 text-sm">{vehicle.driver_name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
