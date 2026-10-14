import React from 'react';
import { ProfessionalProfile, ContactChannel } from '../types';
import { Star, MapPin, Clock, MessageSquare, Phone, Mail, ArrowRight, Shield, Check } from 'lucide-react';

interface ProCardProps {
  pro: ProfessionalProfile;
  onContact: (pro: ProfessionalProfile) => void;
  onViewDetails: (pro: ProfessionalProfile) => void;
}

export const ProCard: React.FC<ProCardProps> = ({ pro, onContact, onViewDetails }) => {
  const getAvailabilityBadge = () => {
    switch (pro.availability) {
      case 'available_now':
        return (
          <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
            Disponible ahora {pro.acceptsEmergencies ? '(acepta urgencias)' : ''}
          </span>
        );
      case 'available_today':
        return (
          <span className="text-xs font-semibold text-amber-900 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700"></span>
            Turnos disponibles hoy
          </span>
        );
      case 'by_appointment':
        return (
          <span className="text-xs font-medium text-stone-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
            Con cita previa
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-stone-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
            Fuera de horario
          </span>
        );
    }
  };

  const getPricingLabel = () => {
    switch (pro.pricingType) {
      case 'diagnostic_visit':
        return 'Visita de diagnóstico';
      case 'free_quote':
        return 'Presupuesto sin cargo';
      default:
        return 'Precio orientativo';
    }
  };

  return (
    <article className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Pro Avatar & Meta */}
        <div className="flex items-start gap-4 mb-3.5">
          <div className="relative shrink-0">
            <img
              src={pro.photoUrl}
              alt={pro.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover bg-stone-100 border border-stone-200/80 shadow-xs"
              onError={(e) => {
                // styled fallback container if image fails
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-stone-900 truncate">
                {pro.commercialName}
              </h3>
            </div>

            <p className="text-xs text-stone-600 mt-0.5 font-medium">
              {pro.name} {pro.isCompany ? '· Empresa' : '· Profesional independiente'}
            </p>

            {/* Clean unboxed metadata with dot separators */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-600 mt-1.5">
              <div className="flex items-center gap-1 text-amber-700 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{pro.rating.toFixed(1)}</span>
                <span className="text-stone-500 font-normal">({pro.reviewCount} opiniones)</span>
              </div>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{pro.experienceYears} años exp.</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-stone-700 font-medium">{pro.verifiedInAppReviewsCount} trabajos en app</span>
              {pro.verificationStatus === 'verified' && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    DNI Verificado
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Status & Availability Strip */}
        <div className="pt-2 pb-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>{getAvailabilityBadge()}</div>
          <div className="text-stone-600 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>{pro.responseTimeText}</span>
          </div>
        </div>

        {/* Bio summary */}
        <p className="text-xs text-stone-700 line-clamp-2 leading-relaxed mb-3">
          {pro.bio}
        </p>

        {/* Specialties */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {pro.specialties.slice(0, 3).map((spec, i) => (
              <span
                key={i}
                className="text-[11px] bg-stone-100/90 text-stone-700 px-2 py-0.5 rounded font-normal"
              >
                {spec}
              </span>
            ))}
            {pro.specialties.length > 3 && (
              <span className="text-[11px] text-stone-600 self-center">
                +{pro.specialties.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Coverage Zone & Pricing note */}
        <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50/70 p-2.5 rounded-lg border border-stone-100 mb-4">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1">{pro.coverageZones.join(', ')}</span>
          </div>
          <div className="flex items-start gap-1.5 text-stone-700">
            <span className="font-semibold text-stone-900 shrink-0">{getPricingLabel()}:</span>
            <span className="line-clamp-1">{pro.pricingNote}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Channels & Actions */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        {/* Channels allowed indicators */}
        <div className="flex items-center gap-1.5 text-stone-600 text-xs" title="Canales aceptados">
          <span className="text-[11px] text-stone-600 mr-0.5">Contactos:</span>
          {pro.allowedChannels.includes('app_chat') && (
            <span className="text-stone-700" title="Chat de la app">
              <MessageSquare className="w-3.5 h-3.5" />
            </span>
          )}
          {pro.allowedChannels.includes('whatsapp') && (
            <span className="text-emerald-700 font-bold text-[11px]" title="WhatsApp">
              WA
            </span>
          )}
          {pro.allowedChannels.includes('phone') && (
            <span className="text-stone-700" title="Llamada">
              <Phone className="w-3.5 h-3.5" />
            </span>
          )}
          {pro.allowedChannels.includes('email') && (
            <span className="text-stone-700" title="Email">
              <Mail className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(pro)}
            className="text-xs font-semibold text-stone-700 hover:text-stone-950 py-1.5 px-2.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Ver ficha
          </button>
          <button
            onClick={() => onContact(pro)}
            className="text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 py-1.5 px-3.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs font-medium"
          >
            <span>Contactar</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
