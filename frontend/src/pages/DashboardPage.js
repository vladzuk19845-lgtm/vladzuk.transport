import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Plus, Truck, Car, User, CreditCard, Calendar, 
  Edit2, Trash2, Package, AlertCircle, CheckCircle 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { VehicleCard } from '../components/VehicleCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const DashboardPage = () => {
  const { t } = useLanguage();
  const { user, refreshUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [activatingDemo, setActivatingDemo] = useState(false);

  const [vehicleForm, setVehicleForm] = useState({
    vehicle_type: 'cargo',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    capacity_tons: '',
    dimensions_length: '',
    dimensions_width: '',
    dimensions_height: '',
    passenger_seats: '',
    description: '',
    price_per_km: '',
    available: true,
    images: []
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchVehicles();
  }, [isAuthenticated, navigate]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API}/vehicles/my`);
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateDemo = async () => {
    setActivatingDemo(true);
    try {
      await axios.post(`${API}/demo/activate-subscription`);
      await refreshUser();
      toast.success('Демо-підписку активовано!');
    } catch (error) {
      toast.error(error.response?.data?.detail || t('common.error'));
    } finally {
      setActivatingDemo(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...vehicleForm,
        year: parseInt(vehicleForm.year),
        price_per_km: parseFloat(vehicleForm.price_per_km),
        capacity_tons: vehicleForm.capacity_tons ? parseFloat(vehicleForm.capacity_tons) : null,
        dimensions_length: vehicleForm.dimensions_length ? parseFloat(vehicleForm.dimensions_length) : null,
        dimensions_width: vehicleForm.dimensions_width ? parseFloat(vehicleForm.dimensions_width) : null,
        dimensions_height: vehicleForm.dimensions_height ? parseFloat(vehicleForm.dimensions_height) : null,
        passenger_seats: vehicleForm.passenger_seats ? parseInt(vehicleForm.passenger_seats) : null,
      };

      if (editingVehicle) {
        await axios.put(`${API}/vehicles/${editingVehicle.id}`, data);
        toast.success('Транспорт оновлено');
      } else {
        await axios.post(`${API}/vehicles`, data);
        toast.success('Транспорт додано');
      }
      
      setShowAddModal(false);
      setEditingVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('common.error'));
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      vehicle_type: vehicle.vehicle_type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      capacity_tons: vehicle.capacity_tons || '',
      dimensions_length: vehicle.dimensions_length || '',
      dimensions_width: vehicle.dimensions_width || '',
      dimensions_height: vehicle.dimensions_height || '',
      passenger_seats: vehicle.passenger_seats || '',
      description: vehicle.description,
      price_per_km: vehicle.price_per_km,
      available: vehicle.available,
      images: vehicle.images || []
    });
    setShowAddModal(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!window.confirm('Видалити цей транспорт?')) return;
    
    try {
      await axios.delete(`${API}/vehicles/${vehicleId}`);
      toast.success('Транспорт видалено');
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('common.error'));
    }
  };

  const resetForm = () => {
    setVehicleForm({
      vehicle_type: 'cargo',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      capacity_tons: '',
      dimensions_length: '',
      dimensions_width: '',
      dimensions_height: '',
      passenger_seats: '',
      description: '',
      price_per_km: '',
      available: true,
      images: []
    });
  };

  const isCargo = vehicleForm.vehicle_type === 'cargo';

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-white mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-zinc-500">Вітаємо, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Profile Card */}
          <div className="card-glass p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <User className="w-6 h-6 text-[#00ff94]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{user?.name}</h3>
                <p className="text-zinc-500 text-sm">{user?.email}</p>
              </div>
            </div>
            <p className="text-zinc-400 text-sm">
              <span className="text-zinc-500">Місто:</span> {user?.city}
            </p>
          </div>

          {/* Subscription Card */}
          <div className="card-glass p-6" data-testid="subscription-card">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-6 h-6 text-[#00ff94]" />
              {user?.subscription_active ? (
                <Badge className="bg-[#00ff94] text-black">{t('dashboard.active')}</Badge>
              ) : (
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {t('dashboard.inactive')}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-white mb-1">{t('dashboard.subscription')}</h3>
            {user?.subscription_expires ? (
              <p className="text-zinc-500 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t('dashboard.expires')}: {new Date(user.subscription_expires).toLocaleDateString('uk-UA')}
              </p>
            ) : (
              <p className="text-zinc-500 text-sm">{t('dashboard.needSubscription')}</p>
            )}
          </div>

          {/* Vehicles Count */}
          <div className="card-glass p-6">
            <div className="flex items-center justify-between mb-4">
              <Truck className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-heading font-bold text-white">
                {vehicles.filter(v => v.vehicle_type === 'cargo').length}
              </span>
            </div>
            <h3 className="font-semibold text-white">{t('vehicle.cargo')}</h3>
          </div>

          <div className="card-glass p-6">
            <div className="flex items-center justify-between mb-4">
              <Car className="w-6 h-6 text-purple-500" />
              <span className="text-2xl font-heading font-bold text-white">
                {vehicles.filter(v => v.vehicle_type === 'passenger').length}
              </span>
            </div>
            <h3 className="font-semibold text-white">{t('vehicle.passenger')}</h3>
          </div>
        </div>

        {/* Demo Activation (if no subscription) */}
        {!user?.subscription_active && (
          <div className="card-glass p-6 mb-8 border-yellow-500/30 bg-yellow-500/5" data-testid="demo-activation">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2">{t('dashboard.needSubscription')}</h3>
                <p className="text-zinc-400 text-sm mb-4">
                  Для тестування платформи ви можете активувати безкоштовну демо-підписку на 30 днів
                </p>
                <Button
                  onClick={handleActivateDemo}
                  disabled={activatingDemo}
                  className="bg-yellow-500 text-black hover:bg-yellow-400 rounded-full"
                  data-testid="activate-demo-btn"
                >
                  {activatingDemo ? t('common.loading') : t('dashboard.activateDemo')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* My Vehicles */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold text-xl text-white">
              {t('dashboard.myVehicles')}
            </h2>
            {user?.subscription_active && (
              <Button
                onClick={() => { resetForm(); setEditingVehicle(null); setShowAddModal(true); }}
                className="bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-full"
                data-testid="add-vehicle-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('dashboard.addVehicle')}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-[#00ff94] border-t-transparent rounded-full mx-auto" />
              <p className="text-zinc-500 mt-4">{t('common.loading')}</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="card-glass p-12 text-center">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500">{t('dashboard.noVehicles')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="relative group">
                  <VehicleCard vehicle={vehicle} showContact={false} />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditVehicle(vehicle)}
                      className="bg-zinc-800 hover:bg-zinc-700 rounded-full"
                      data-testid={`edit-vehicle-${vehicle.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="rounded-full"
                      data-testid={`delete-vehicle-${vehicle.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Vehicle Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-white">
              {editingVehicle ? t('vehicle.edit') : t('dashboard.addVehicle')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddVehicle} className="space-y-4">
            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label className="text-zinc-300">{t('vehicle.type')}</Label>
              <Select
                value={vehicleForm.vehicle_type}
                onValueChange={(value) => setVehicleForm({ ...vehicleForm, vehicle_type: value })}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800" data-testid="vehicle-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="cargo">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" /> {t('vehicle.cargo')}
                    </div>
                  </SelectItem>
                  <SelectItem value="passenger">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" /> {t('vehicle.passenger')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">{t('vehicle.brand')}</Label>
                <Input
                  value={vehicleForm.brand}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, brand: e.target.value })}
                  placeholder="Mercedes, MAN, Volvo..."
                  className="bg-zinc-950 border-zinc-800"
                  required
                  data-testid="vehicle-brand"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">{t('vehicle.model')}</Label>
                <Input
                  value={vehicleForm.model}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  placeholder="Actros, TGX..."
                  className="bg-zinc-950 border-zinc-800"
                  required
                  data-testid="vehicle-model"
                />
              </div>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label className="text-zinc-300">{t('vehicle.year')}</Label>
              <Input
                type="number"
                value={vehicleForm.year}
                onChange={(e) => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                min="1990"
                max={new Date().getFullYear() + 1}
                className="bg-zinc-950 border-zinc-800"
                required
                data-testid="vehicle-year"
              />
            </div>

            {/* Cargo specific fields */}
            {isCargo && (
              <>
                <div className="space-y-2">
                  <Label className="text-zinc-300">{t('vehicle.capacity')}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vehicleForm.capacity_tons}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_tons: e.target.value })}
                    placeholder="20"
                    className="bg-zinc-950 border-zinc-800"
                    data-testid="vehicle-capacity"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">{t('vehicle.dimensions')}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={vehicleForm.dimensions_length}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, dimensions_length: e.target.value })}
                      placeholder="Д"
                      className="bg-zinc-950 border-zinc-800"
                      data-testid="vehicle-length"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={vehicleForm.dimensions_width}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, dimensions_width: e.target.value })}
                      placeholder="Ш"
                      className="bg-zinc-950 border-zinc-800"
                      data-testid="vehicle-width"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={vehicleForm.dimensions_height}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, dimensions_height: e.target.value })}
                      placeholder="В"
                      className="bg-zinc-950 border-zinc-800"
                      data-testid="vehicle-height"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Passenger specific fields */}
            {!isCargo && (
              <div className="space-y-2">
                <Label className="text-zinc-300">{t('vehicle.seats')}</Label>
                <Input
                  type="number"
                  value={vehicleForm.passenger_seats}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, passenger_seats: e.target.value })}
                  placeholder="4"
                  className="bg-zinc-950 border-zinc-800"
                  data-testid="vehicle-seats"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-zinc-300">{t('vehicle.description')}</Label>
              <Textarea
                value={vehicleForm.description}
                onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                placeholder="Опис послуг, особливості транспорту..."
                className="bg-zinc-950 border-zinc-800 min-h-[100px]"
                required
                data-testid="vehicle-description"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-zinc-300">{t('vehicle.pricePerKm')}</Label>
              <Input
                type="number"
                step="0.01"
                value={vehicleForm.price_per_km}
                onChange={(e) => setVehicleForm({ ...vehicleForm, price_per_km: e.target.value })}
                placeholder="15"
                className="bg-zinc-950 border-zinc-800"
                required
                data-testid="vehicle-price"
              />
            </div>

            {/* Available */}
            <div className="flex items-center justify-between">
              <Label className="text-zinc-300">{t('vehicle.available')}</Label>
              <Switch
                checked={vehicleForm.available}
                onCheckedChange={(checked) => setVehicleForm({ ...vehicleForm, available: checked })}
                data-testid="vehicle-available"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-full"
              >
                {t('vehicle.cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#00ff94] text-black hover:bg-[#00cc76] rounded-full"
                data-testid="save-vehicle-btn"
              >
                {t('vehicle.save')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
