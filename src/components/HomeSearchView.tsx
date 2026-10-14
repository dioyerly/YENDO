import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProfessionalProfile, ContactChannel, AvailabilityStatus } from '../types';
import { CATEGORIES, ZONES, HERO_IMAGE_URL } from '../data/mockData';
import { CategoryIcon } from './CategoryIcon';
import { ProCard } from './ProCard';
import {
  Search,
  AlertTriangle,
  MapPin,
  Filter,
  Star,
  Check,
  X,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface HomeSearchViewProps {
  onContact: (pro: ProfessionalProfile) => void;
  onViewDetails: (pro: ProfessionalProfile) => void;
  emergencyActive: boolean;
  setEmergencyActive: (active: boolean) => void;
}

export const HomeSearchView: React.FC<HomeSearchViewProps> = ({
  onContact,
  onViewDetails,
  emergencyActive,
  setEmergencyActive,
}) => {
  const { professionals } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [contactChannelFilter, setContactChannelFilter] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [minExperience, setMinExperience] = useState<number>(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter professionals
  const filteredPros = professionals.filter((pro) => {
    // 1. Emergency mode check
    if (emergencyActive) {
      if (!pro.acceptsEmergencies || pro.availability !== 'available_now') {
        return false;
      }
    }

    // 2. Search query in name, commercial name, specialties, bio, categories
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText =
        pro.name.toLowerCase().includes(q) ||
        pro.commercialName.toLowerCase().includes(q) ||
        pro.bio.toLowerCase().includes(q) ||
        pro.specialties.some((s) => s.toLowerCase().includes(q)) ||
        pro.categories.some((c) => c.toLowerCase().includes(q));

      if (!matchText) return false;
    }

    // 3. Category filter
    if (selectedCategory !== 'all') {
      if (!pro.categories.includes(selectedCategory)) return false;
    }

    // 4. Zone filter
    if (selectedZone !== 'all') {
      const matchesZone = pro.coverageZones.some((z) =>
        z.toLowerCase().includes(selectedZone.toLowerCase())
      );
      if (!matchesZone) return false;
    }

    // 5. Availability filter
    if (availabilityFilter !== 'all') {
      if (pro.availability !== availabilityFilter) return false;
    }

    // 6. Contact channel filter
    if (contactChannelFilter !== 'all') {
      if (!pro.allowedChannels.includes(contactChannelFilter as ContactChannel)) return false;
    }

    // 7. Rating & Experience
    if (minRating > 0 && pro.rating < minRating) return false;
    if (minExperience > 0 && pro.experienceYears < minExperience) return false;

    return true;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedZone('all');
    setAvailabilityFilter('all');
    setContactChannelFilter('all');
    setMinRating(0);
    setMinExperience(0);
    setEmergencyActive(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'all' ||
    selectedZone !== 'all' ||
    availabilityFilter !== 'all' ||
    contactChannelFilter !== 'all' ||
    minRating > 0 ||
    minExperience > 0 ||
    emergencyActive;

  return (
    <div className="space-y-8 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-stone-900 text-white border border-stone-800 shadow-sm">
        {/* Background image with contrast scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE_URL}
            alt="Hogar y servicios"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-900/50" />
        </div>

        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/50 border border-amber-800/60 px-3 py-1 rounded-full mb-3">
            <span>Marketplace de Servicios para el Hogar</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight max-w-2xl">
            Encuentra profesionales de confianza para tu casa. Sin trámites obligatorios.
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
            Tanto si te quedaste afuera y necesitas un cerrajero urgente, como si planificas pintar o renovar tu instalación. Busca, compara perfiles reales y contacta directamente al que mejor se adapte a tu necesidad.
          </p>

          {/* Quick Emergency Button Banner */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setEmergencyActive(!emergencyActive)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                emergencyActive
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                  : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 fill-rose-500/20" />
              <span>{emergencyActive ? 'Filtro de Urgencia Activado' : '🚨 Necesito ayuda ahora (Urgencias)'}</span>
            </button>

            {emergencyActive && (
              <span className="text-xs text-rose-300 animate-pulse font-medium">
                Mostrando profesionales con guardia activa y disponibles en este momento.
              </span>
            )}
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS BAR */}
      <section className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Main Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="¿Qué necesitas resolver? (ej. me quedé afuera, pérdida de agua, pintar)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 text-stone-900 bg-stone-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Zone Selector */}
          <div className="md:col-span-4 relative">
            <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-stone-800 bg-stone-50/50 appearance-none font-medium cursor-pointer"
            >
              <option value="all">Todas las zonas de cobertura</option>
              {ZONES.filter((z) => z !== 'Todas las zonas').map((zone, idx) => (
                <option key={idx} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Advanced Filters Button */}
          <div className="md:col-span-2 flex items-center">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                showAdvancedFilters || hasActiveFilters
                  ? 'border-amber-500 bg-amber-50 text-amber-950'
                  : 'border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros {hasActiveFilters ? '•' : ''}</span>
            </button>
          </div>
        </div>

        {/* ADVANCED FILTER PANEL */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Availability */}
            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Disponibilidad
              </label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg bg-white"
              >
                <option value="all">Cualquier horario</option>
                <option value="available_now">🟢 Disponible ahora</option>
                <option value="available_today">🟡 Turnos hoy</option>
                <option value="by_appointment">⚪ Con cita programada</option>
              </select>
            </div>

            {/* Contact Channel Accepted */}
            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Canal de contacto aceptado
              </label>
              <select
                value={contactChannelFilter}
                onChange={(e) => setContactChannelFilter(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg bg-white"
              >
                <option value="all">Cualquier canal</option>
                <option value="app_chat">Chat de la app</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Llamada telefónica</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Calificación mínima
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full p-2 border border-stone-300 rounded-lg bg-white"
              >
                <option value={0}>Todas las calificaciones</option>
                <option value={4.5}>★ 4.5 estrellas o más</option>
                <option value={4.8}>★ 4.8 estrellas o más</option>
              </select>
            </div>

            {/* Min Experience */}
            <div>
              <label className="block font-semibold text-stone-800 mb-1.5">
                Años de experiencia
              </label>
              <select
                value={minExperience}
                onChange={(e) => setMinExperience(Number(e.target.value))}
                className="w-full p-2 border border-stone-300 rounded-lg bg-white"
              >
                <option value={0}>Sin mínimo de años</option>
                <option value={5}>5+ años en el rubro</option>
                <option value={10}>10+ años en el rubro</option>
              </select>
            </div>
          </div>
        )}

        {/* Clear Filters bar */}
        {hasActiveFilters && (
          <div className="pt-2 flex items-center justify-between text-xs text-stone-600">
            <span>
              Filtros activos aplicados · <strong>{filteredPros.length}</strong> profesionales encontrados
            </span>
            <button
              onClick={clearAllFilters}
              className="text-stone-700 hover:text-stone-950 font-semibold underline cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </section>

      {/* CATEGORIES GRID */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            Categorías de Servicios del Hogar
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-amber-800 hover:underline cursor-pointer"
            >
              Ver todas las categorías
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isSelected
                    ? 'border-amber-600 bg-amber-50 text-stone-950 shadow-2xs font-semibold'
                    : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                  <CategoryIcon iconName={cat.iconName} className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold block leading-tight">
                    {cat.name}
                  </span>
                  {cat.emergencyEligible && (
                    <span className="text-[10px] text-amber-700 block mt-0.5">
                      Guardia 24hs
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SEARCH RESULTS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              {emergencyActive
                ? 'Profesionales con Guardia Activa (Emergencias)'
                : selectedCategory !== 'all'
                ? `Especialistas en ${CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Servicios'}`
                : 'Profesionales y Empresas Disponibles'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Compará perfiles, zonas y disponibilidad para elegir libremente a quién contactar.
            </p>
          </div>
          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
            {filteredPros.length} {filteredPros.length === 1 ? 'profesional' : 'profesionales'}
          </span>
        </div>

        {filteredPros.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl space-y-3">
            <p className="text-xs text-stone-600 font-medium">
              No encontramos profesionales que coincidan con estos filtros específicos.
            </p>
            <button
              onClick={clearAllFilters}
              className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              Restablecer filtros de búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPros.map((pro) => (
              <ProCard
                key={pro.id}
                pro={pro}
                onContact={onContact}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
