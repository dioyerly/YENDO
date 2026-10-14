import React, { useState } from 'react';
import { ProfessionalProfile, ContactChannel, ServiceJob } from '../types';
import { useApp } from '../context/AppContext';
import {
  X,
  MessageSquare,
  Phone,
  Mail,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Info,
} from 'lucide-react';

interface ContactFlowModalProps {
  pro: ProfessionalProfile | null;
  onClose: () => void;
  onContactCreated: (job: ServiceJob) => void;
}

export const ContactFlowModal: React.FC<ContactFlowModalProps> = ({
  pro,
  onClose,
  onContactCreated,
}) => {
  if (!pro) return null;

  const { initiateContact, respondToExternalContact } = useApp();
  const [description, setDescription] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ContactChannel>(
    pro.allowedChannels[0] || 'app_chat'
  );
  const [isEmergency, setIsEmergency] = useState(pro.acceptsEmergencies && pro.availability === 'available_now');
  const [createdJob, setCreatedJob] = useState<ServiceJob | null>(null);
  const [externalStep, setExternalStep] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    // 1. Mandatory registration of the contact event in the app
    const newJob = initiateContact({
      proId: pro.id,
      description: description.trim(),
      channel: selectedChannel,
      isEmergency,
    });

    setCreatedJob(newJob);

    if (selectedChannel === 'app_chat') {
      // In-app chat: directly jump to tracking & chat
      onContactCreated(newJob);
      onClose();
    } else {
      // External channel (WhatsApp, Call, Email): show external launch step with disclosure
      setExternalStep(true);
    }
  };

  const handleExternalActionComplete = (responded: boolean, agreedToWork: boolean) => {
    if (createdJob) {
      respondToExternalContact(createdJob.id, responded, agreedToWork);
      onContactCreated(createdJob);
    }
    onClose();
  };

  const getChannelName = (c: ContactChannel) => {
    switch (c) {
      case 'app_chat':
        return 'Chat dentro de la app';
      case 'whatsapp':
        return 'WhatsApp';
      case 'phone':
        return 'Llamada telefónica';
      case 'email':
        return 'Correo electrónico';
    }
  };

  const getChannelIcon = (c: ContactChannel) => {
    switch (c) {
      case 'app_chat':
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case 'whatsapp':
        return <span className="text-emerald-600 font-bold text-xs">WA</span>;
      case 'phone':
        return <Phone className="w-4 h-4 text-blue-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {externalStep ? 'Registro y Canal de Contacto' : 'Contactar Profesional'}
            </h3>
            <p className="text-xs text-stone-600">
              {pro.commercialName} ({pro.name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!externalStep ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Urgency toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${isEmergency ? 'text-rose-600' : 'text-stone-400'}`} />
                <div>
                  <span className="text-xs font-semibold text-stone-900">
                    ¿Es una urgencia inmediata?
                  </span>
                  <p className="text-[11px] text-stone-500">
                    {isEmergency
                      ? 'Se marcará como prioridad de respuesta inmediata'
                      : 'Trabajo programado con margen de coordinación'}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={(e) => setIsEmergency(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                ¿Qué necesitas resolver o cotizar? *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Se rompió un caño de agua debajo de la mesada / Necesito abrir puerta blindada con llave adentro / Quiero pintar 3 ambientes..."
                rows={3}
                required
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 text-stone-800"
              />
              <p className="text-[11px] text-stone-500 mt-1">
                Sé específico con tu zona y detalles del trabajo para agilizar la cotización.
              </p>
            </div>

            {/* Select Channel */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-2">
                Selecciona la forma de contacto preferida
              </label>
              <div className="space-y-2">
                {pro.allowedChannels.map((channel) => (
                  <label
                    key={channel}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedChannel === channel
                        ? 'border-amber-500 bg-amber-50/50 text-stone-900 font-semibold'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {getChannelIcon(channel)}
                      <span className="text-xs">{getChannelName(channel)}</span>
                    </div>
                    <input
                      type="radio"
                      name="contact_channel"
                      value={channel}
                      checked={selectedChannel === channel}
                      onChange={() => setSelectedChannel(channel)}
                      className="accent-amber-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Mandatory audit notice */}
            <div className="flex items-start gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
              <ShieldCheck className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Al continuar, la plataforma registra un evento de contacto con fecha, hora y canal para habilitar la ficha de seguimiento mutua.
              </p>
            </div>

            <button
              type="submit"
              disabled={!description.trim()}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar y Registrar Contacto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* External Channel Registered Step */
          <div className="p-6 space-y-5 text-xs text-stone-700">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Contacto registrado en la plataforma (Código: {createdJob?.code}).
              </span>
            </div>

            {/* External channel action button */}
            <div className="space-y-3">
              <p className="text-stone-800 font-semibold">
                Canal seleccionado: {getChannelName(selectedChannel)}
              </p>

              {selectedChannel === 'whatsapp' && (
                <a
                  href={`https://wa.me/${pro.whatsappPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola ${pro.name}, te contacto desde Soluciones para tu Hogar por: ${description}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Abrir conversación en WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {selectedChannel === 'phone' && (
                <a
                  href={`tel:${pro.phone.replace(/[^0-9+]/g, '')}`}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Llamar al profesional ({pro.phone})</span>
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}

              {selectedChannel === 'email' && (
                <a
                  href={`mailto:${pro.email}?subject=${encodeURIComponent(
                    `Consulta de servicio - Soluciones para tu Hogar`
                  )}&body=${encodeURIComponent(description)}`}
                  className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Enviar correo electrónico ({pro.email})</span>
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Honest External Channel Disclosure */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800 text-[11px]">
                <Info className="w-3.5 h-3.5 text-stone-500" />
                <span>Aclaración sobre canales externos:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                La plataforma no tiene acceso a llamadas ni puede leer tus mensajes privados de WhatsApp o correo. Por eso, ambas partes actualizan manualmente si hubo respuesta y si acordaron realizar el trabajo.
              </p>
            </div>

            {/* Feedback question */}
            <div className="pt-2 border-t border-stone-200 space-y-2">
              <span className="font-semibold text-stone-900 block">
                ¿Pudiste comunicarte y acordar el servicio?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleExternalActionComplete(true, true)}
                  className="py-2 px-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-center cursor-pointer"
                >
                  Sí, acordamos el trabajo
                </button>
                <button
                  type="button"
                  onClick={() => handleExternalActionComplete(true, false)}
                  className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-lg text-center cursor-pointer"
                >
                  Hablamos, aún sin acuerdo
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleExternalActionComplete(false, false)}
                className="w-full py-1.5 text-stone-500 hover:text-stone-700 text-[11px] text-center block cursor-pointer"
              >
                No hubo respuesta todavía (ver en seguimiento más tarde)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
