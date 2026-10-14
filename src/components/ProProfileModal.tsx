import React, { useState } from 'react';
import { ProfessionalProfile } from '../types';
import {
  X,
  Star,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Phone,
  MessageSquare,
  Mail,
  ArrowRight,
  Info,
  DollarSign,
} from 'lucide-react';

interface ProProfileModalProps {
  pro: ProfessionalProfile | null;
  onClose: () => void;
  onContact: (pro: ProfessionalProfile) => void;
}

export const ProProfileModal: React.FC<ProProfileModalProps> = ({ pro, onClose, onContact }) => {
  if (!pro) return null;

  const [activeTab, setActiveTab] = useState<'info' | 'portfolio' | 'reviews'>('info');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-stone-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-start justify-between gap-4 bg-stone-50/50">
          <div className="flex items-start gap-4">
            <img
              src={pro.photoUrl}
              alt={pro.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-stone-100 border border-stone-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                  {pro.commercialName}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                {pro.name} · {pro.isCompany ? 'Empresa de servicios' : 'Profesional independiente'}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 mt-2">
                <div className="flex items-center gap-1 text-amber-700 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{pro.rating.toFixed(1)}</span>
                  <span className="text-stone-500 font-normal">({pro.reviewCount} opiniones)</span>
                </div>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span>{pro.experienceYears} años de experiencia</span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="text-emerald-700 font-medium">
                  {pro.verifiedInAppReviewsCount} verificados en app
                </span>
                {pro.verificationStatus === 'verified' && (
                  <>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      DNI Verificado por Administración
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center border-b border-stone-200 px-6 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-2 border-b-2 transition-colors mr-6 ${
              activeTab === 'info'
                ? 'border-amber-600 text-stone-900 font-semibold'
                : 'border-transparent text-stone-700 hover:text-stone-900'
            }`}
          >
            Información & Servicios
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 px-2 border-b-2 transition-colors mr-6 ${
              activeTab === 'portfolio'
                ? 'border-amber-600 text-stone-900 font-semibold'
                : 'border-transparent text-stone-700 hover:text-stone-900'
            }`}
          >
            Fotos de Trabajos ({pro.portfolioPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-amber-600 text-stone-900 font-semibold'
                : 'border-transparent text-stone-700 hover:text-stone-900'
            }`}
          >
            Opiniones de Clientes ({pro.reviews.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-700">
          {activeTab === 'info' && (
            <>
              {/* Bio */}
              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  Acerca del profesional
                </h3>
                <p className="text-stone-700 leading-relaxed text-sm bg-stone-50/60 p-3.5 rounded-lg border border-stone-100">
                  {pro.bio}
                </p>
              </div>

              {/* Specialties */}
              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  Especialidades que ofrece
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pro.specialties.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-xs text-stone-800"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule, Response & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Disponibilidad & Horarios</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    <span className="font-medium text-stone-800">Días:</span> {pro.workingDays}
                  </p>
                  <p className="text-xs text-stone-600">
                    <span className="font-medium text-stone-800">Horario:</span> {pro.scheduleText}
                  </p>
                  <p className="text-xs text-stone-600">
                    <span className="font-medium text-stone-800">Respuesta:</span> {pro.responseTimeText}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Criterio de Precios</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pro.pricingNote}
                  </p>
                  <p className="text-[11px] text-stone-500 italic">
                    *El monto final se coordina de mutuo acuerdo y se formaliza en la ficha de seguimiento de la app.
                  </p>
                </div>
              </div>

              {/* Coverage Zones & Privacy Notice */}
              <div>
                <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
                  Zonas de Cobertura
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-stone-700">
                  {pro.coverageZones.map((z, i) => (
                    <span key={i} className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-md">
                      <MapPin className="w-3 h-3 text-stone-500" />
                      <span>{z}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-start gap-2 text-xs text-stone-500 bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <span>
                    Por seguridad y privacidad, los datos de contacto directos (teléfono, WhatsApp o email) se habilitan al tocar "Contactar" e iniciar el seguimiento formal del servicio.
                  </span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                Trabajos documentados por el profesional para ilustrar la calidad de sus terminaciones.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pro.portfolioPhotos.map((photo, i) => (
                  <div key={i} className="group rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="p-3">
                      <span className="text-[11px] text-stone-600 uppercase font-medium">{photo.category}</span>
                      <h4 className="text-xs font-semibold text-stone-800 mt-0.5">{photo.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-600 pb-2 border-b border-stone-100">
                <span>{pro.reviews.length} opiniones registradas</span>
                <span className="text-emerald-700 font-medium">
                  {pro.verifiedInAppReviewsCount} verificadas con trabajo cerrado en la app
                </span>
              </div>

              {pro.reviews.map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-900">{rev.clientName}</span>
                    <span className="text-stone-600 text-xs">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    ))}
                    {rev.isInAppVerified && (
                      <span className="ml-2 text-[11px] text-emerald-800 font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Trabajo realizado en la app · {rev.serviceName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed pt-1">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between gap-4">
          <div className="text-xs text-stone-600 hidden sm:block">
            <span>Canales aceptados: </span>
            <span className="font-semibold text-stone-800">
              {pro.allowedChannels.map((c) => (c === 'app_chat' ? 'Chat en la app' : c === 'whatsapp' ? 'WhatsApp' : c === 'phone' ? 'Llamada' : 'Email')).join(', ')}
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              onContact(pro);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Contactar profesional</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
