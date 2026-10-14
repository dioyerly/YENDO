import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ProfessionalProfile,
  ServiceJob,
  ContactChannel,
  AvailabilityStatus,
} from '../types';
import {
  User,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Download,
  Settings,
  Plus,
  Trash2,
  FileText,
  Star,
  Check,
} from 'lucide-react';
import { ZONES } from '../data/mockData';

interface ProDashboardProps {
  onSelectJob: (job: ServiceJob) => void;
}

export const ProDashboard: React.FC<ProDashboardProps> = ({ onSelectJob }) => {
  const {
    professionals,
    updateProfessionalProfile,
    jobs,
    currentUser,
    commissionRatePercent,
    recordCommissionPayment,
    commissionPayments,
  } = useApp();

  // Find currently managed professional
  const [selectedProId, setSelectedProId] = useState<string>(
    professionals.find((p) => p.userId === currentUser?.id || p.id === currentUser?.id || p.id === currentUser?.proProfileId)?.id || professionals[0]?.id || 'pro-1'
  );

  const currentPro = professionals.find((p) => p.id === selectedProId) || professionals[0];

  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'commissions' | 'profile' | 'reviews'>('pipeline');

  // Profile Editor state
  const [editingProfile, setEditingProfile] = useState<ProfessionalProfile>(currentPro);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');

  // Manual Commission Payment Form State
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentMethodInput, setPaymentMethodInput] = useState('Transferencia Bancaria');
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [paymentNoteInput, setPaymentNoteInput] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Sync editor when pro selection changes
  const handleSelectPro = (proId: string) => {
    setSelectedProId(proId);
    const found = professionals.find((p) => p.id === proId);
    if (found) setEditingProfile(found);
  };

  // Jobs for this pro
  const proJobs = jobs.filter((j) => j.proId === currentPro.id);
  const incomingJobs = proJobs.filter((j) => j.status === 'contact_initiated');
  const activeJobs = proJobs.filter((j) => j.status !== 'contact_initiated' && !j.status.startsWith('closed'));
  const closedJobs = proJobs.filter((j) => j.status.startsWith('closed'));

  // Commission totals
  const totalBilled = closedJobs.reduce(
    (sum, j) => sum + (j.proFinalPriceReported || j.clientFinalPriceReported || 0),
    0
  );
  const totalCommissionOwed = closedJobs.reduce(
    (sum, j) => sum + (j.commission.platformAmount || 0),
    0
  );
  const totalProEarned = totalBilled - totalCommissionOwed;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfessionalProfile(editingProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddSpecialty = () => {
    if (newSpecialtyInput.trim()) {
      setEditingProfile((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialtyInput.trim()],
      }));
      setNewSpecialtyInput('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setEditingProfile((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const handleToggleChannel = (channel: ContactChannel) => {
    setEditingProfile((prev) => {
      const exists = prev.allowedChannels.includes(channel);
      return {
        ...prev,
        allowedChannels: exists
          ? prev.allowedChannels.filter((c) => c !== channel)
          : [...prev.allowedChannels, channel],
      };
    });
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(paymentAmountInput);
    if (amt > 0 && paymentRefInput.trim()) {
      recordCommissionPayment({
        date: new Date().toISOString().split('T')[0],
        amount: amt,
        paymentMethod: paymentMethodInput,
        referenceNumber: paymentRefInput.trim(),
        note: `${currentPro.name} - ${paymentNoteInput.trim() || 'Liquidación voluntaria de comisiones'}`,
      });
      setPaymentAmountInput('');
      setPaymentRefInput('');
      setPaymentNoteInput('');
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3500);
    }
  };

  const handleDownloadMonthlySummary = () => {
    const lines = [
      `RESUMEN MENSUAL DE LIQUIDACIÓN Y SERVICIOS - SOLUCIONES PARA TU HOGAR`,
      `Profesional: ${currentPro.name} (${currentPro.commercialName})`,
      `Fecha de generación: ${new Date().toLocaleDateString()}`,
      `Comisión configurada: ${commissionRatePercent}%`,
      `----------------------------------------------------------------------`,
      `CÓDIGO | FECHA | CLIENTE | SERVICIO | MONTO DECLARADO | COMISIÓN PLATAFORMA (${commissionRatePercent}%) | NETO PRO`,
      ...closedJobs.map((j) => {
        const amt = j.proFinalPriceReported || j.clientFinalPriceReported || 0;
        const comm = j.commission.platformAmount || Math.round(amt * (commissionRatePercent / 100));
        const net = amt - comm;
        return `${j.code} | ${new Date(j.createdAt).toLocaleDateString()} | ${j.clientName} | ${j.categoryName} | $${amt} | $${comm} | $${net}`;
      }),
      `----------------------------------------------------------------------`,
      `TOTAL FACTURADO: $${totalBilled.toLocaleString()} ARS`,
      `TOTAL COMISIÓN PLATAFORMA: $${totalCommissionOwed.toLocaleString()} ARS`,
      `INGRESOS NETOS PROFESIONAL: $${totalProEarned.toLocaleString()} ARS`,
      `\nNota: La plataforma no retiene fondos automáticamente. Los saldos de comisiones se abonan según el acuerdo mensual.`,
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resumen-comisiones-${currentPro.name.toLowerCase().replace(/\s+/g, '-')}-octubre2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Pro Switcher Bar & Status Banner */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wide font-semibold">
            <span>Panel de Control del Profesional</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mt-1">
            {currentPro.commercialName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-600">
            <span>{currentPro.name}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{currentPro.availability === 'available_now' ? '🟢 Disponible ahora' : '🟡 Turnos programados'}</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            {currentPro.verificationStatus === 'verified' ? (
              <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ DNI Verificado ({currentPro.dniNumber})
              </span>
            ) : currentPro.verificationStatus === 'pending' ? (
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⏳ DNI en revisión por la administración ({currentPro.dniNumber})
              </span>
            ) : (
              <span className="text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                ❌ DNI observado / requiere actualización
              </span>
            )}
          </div>
        </div>

        {/* Quick Pro Selector to test multiple profiles */}
        <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200 text-xs">
          <span className="text-stone-500 font-medium whitespace-nowrap">Gestionar perfil:</span>
          <select
            value={selectedProId}
            onChange={(e) => handleSelectPro(e.target.value)}
            className="bg-white border border-stone-300 rounded-lg p-1.5 font-semibold text-stone-800 text-xs"
          >
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.commercialName} ({p.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap ${
            activeSubTab === 'pipeline'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Flujo de Trabajos ({proJobs.length})
        </button>

        <button
          onClick={() => setActiveSubTab('commissions')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'commissions'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Mis Comisiones & Resumen</span>
        </button>

        <button
          onClick={() => {
            setEditingProfile(currentPro);
            setActiveSubTab('profile');
          }}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'profile'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Editar Perfil & Disponibilidad</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reviews')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'reviews'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Opiniones Recibidas ({currentPro.reviews.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: PIPELINE & ACTIVE JOBS */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Incoming Contact Requests */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Nuevos Contactos Entrantes ({incomingJobs.length})</span>
            </h2>

            {incomingJobs.length === 0 ? (
              <div className="p-4 bg-white border border-stone-200 rounded-xl text-xs text-stone-500">
                No tienes solicitudes nuevas pendientes de respuesta.
              </div>
            ) : (
              <div className="space-y-2.5">
                {incomingJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-amber-900">{job.code}</span>
                        <span aria-hidden="true" className="text-amber-300">·</span>
                        <span className="font-semibold text-stone-900">Cliente: {job.clientName}</span>
                        <span aria-hidden="true" className="text-amber-300">·</span>
                        <span className="text-stone-600">Canal: {job.initialChannel}</span>
                        {job.isEmergency && (
                          <span className="text-rose-700 font-bold text-[11px]">🚨 URGENTE</span>
                        )}
                      </div>
                      <p className="text-xs text-stone-800 font-medium mt-1">
                        "{job.description}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-stone-900 underline">
                        Responder y coordinar →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Services In Execution */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
              Servicios en Curso & Coordinación ({activeJobs.length})
            </h2>

            {activeJobs.length === 0 ? (
              <div className="p-4 bg-white border border-stone-200 rounded-xl text-xs text-stone-500">
                No hay servicios en curso en este momento.
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => onSelectJob(job)}
                    className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono text-stone-500 font-bold">{job.code}</span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="font-semibold text-stone-900">{job.clientName}</span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="text-stone-600">{job.clientZone}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-stone-900">
                        {job.description}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {job.estimatedPrice
                          ? `Precio estimado: $${job.estimatedPrice.toLocaleString()}`
                          : 'Precio a convenir'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        job.status === 'under_review'
                          ? 'bg-rose-100 text-rose-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {job.status === 'work_in_progress' ? 'Trabajo iniciado' : job.status === 'under_review' ? 'En revisión' : 'Coordinando'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: COMMISSIONS & MONTHLY SUMMARY */}
      {activeSubTab === 'commissions' && (
        <div className="space-y-6">
          {/* Commission Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-xs text-stone-500 font-medium">Trabajos Cerrados</span>
              <p className="text-2xl font-bold font-mono text-stone-900 mt-1">
                {closedJobs.length}
              </p>
              <span className="text-[11px] text-stone-500">Total acumulado en la app</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-xs text-stone-500 font-medium">Total Facturado</span>
              <p className="text-2xl font-bold font-mono text-stone-900 mt-1">
                ${totalBilled.toLocaleString()}
              </p>
              <span className="text-[11px] text-stone-500">Monto bruto informado por trabajos</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-xs text-stone-500 font-medium">
                Comisión Plataforma ({commissionRatePercent}%)
              </span>
              <p className="text-2xl font-bold font-mono text-amber-700 mt-1">
                ${totalCommissionOwed.toLocaleString()}
              </p>
              <span className="text-[11px] text-stone-500">Calculada sobre trabajos confirmados</span>
            </div>
          </div>

          {/* Model Transparency Box */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-700 space-y-2">
            <span className="font-bold text-stone-900 block">
              Reglas de comisión transparente
            </span>
            <p className="leading-relaxed">
              La plataforma no cobra cargo de alta ni costo mensual de suscripción. La comisión del <strong>{commissionRatePercent}%</strong> se calcula únicamente una vez que el cliente y el profesional confirman conjuntamente que el trabajo se completó y se pagó. La aplicación no retiene fondos de clientes ni efectúa débitos automáticos.
            </p>
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleDownloadMonthlySummary}
                className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar resumen mensual (.txt)</span>
              </button>
            </div>
          </div>

          {/* Manual Commission Payment Form */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Registrar Pago de Comisión a la Plataforma
            </h3>
            <p className="text-xs text-stone-600">
              Informa aquí tu comprobante cuando realices la transferencia mensual de comisiones acordadas con la administración.
            </p>

            {paymentSuccess && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Pago de comisión registrado con éxito para validación administrativa.</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Monto a rendir ($ ARS) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  placeholder="Ej: 3500"
                  className="w-full text-xs p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Medio de pago *
                </label>
                <select
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-stone-300"
                >
                  <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Efectivo / Sede">Efectivo en Sede</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  N° de Referencia / Comprobante *
                </label>
                <input
                  type="text"
                  required
                  value={paymentRefInput}
                  onChange={(e) => setPaymentRefInput(e.target.value)}
                  placeholder="Ej: OP-982134"
                  className="w-full text-xs p-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Registrar comprobante de comisión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PROFILE & AVAILABILITY EDITOR */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                Configuración del Perfil Profesional
              </h2>
              <p className="text-xs text-stone-500">
                Actualiza tus especialidades, horarios, zonas de cobertura y formas de contacto.
              </p>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Guardado con éxito
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nombre de Fantasía o Empresa *
              </label>
              <input
                type="text"
                required
                value={editingProfile.commercialName}
                onChange={(e) => setEditingProfile({ ...editingProfile, commercialName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Nombre del titular o responsable *
              </label>
              <input
                type="text"
                required
                value={editingProfile.name}
                onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Estado de Disponibilidad Actual *
              </label>
              <select
                value={editingProfile.availability}
                onChange={(e) => setEditingProfile({ ...editingProfile, availability: e.target.value as AvailabilityStatus })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              >
                <option value="available_now">🟢 Disponible ahora</option>
                <option value="available_today">🟡 Turnos disponibles hoy</option>
                <option value="by_appointment">⚪ Con cita previa programada</option>
                <option value="off_hours">🔴 Fuera de horario</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingProfile.acceptsEmergencies}
                  onChange={(e) => setEditingProfile({ ...editingProfile, acceptsEmergencies: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span className="font-semibold text-stone-800">
                  Acepto urgencias ("Necesito ayuda ahora")
                </span>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Horario de atención
              </label>
              <input
                type="text"
                value={editingProfile.scheduleText}
                onChange={(e) => setEditingProfile({ ...editingProfile, scheduleText: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tiempo de respuesta estimado
              </label>
              <input
                type="text"
                value={editingProfile.responseTimeText}
                onChange={(e) => setEditingProfile({ ...editingProfile, responseTimeText: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Descripción profesional / Bio
              </label>
              <textarea
                rows={3}
                value={editingProfile.bio}
                onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300"
              />
            </div>

            {/* Specialties Editor */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block font-semibold text-stone-700">
                Especialidades publicadas
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {editingProfile.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md text-xs"
                  >
                    <span>{spec}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(i)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Agregar nueva especialidad..."
                  value={newSpecialtyInput}
                  onChange={(e) => setNewSpecialtyInput(e.target.value)}
                  className="flex-1 p-2 rounded-lg border border-stone-300 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSpecialty}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg text-xs"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Channels allowed */}
            <div className="sm:col-span-2 space-y-2 pt-2 border-t border-stone-100">
              <label className="block font-semibold text-stone-700">
                Canales de contacto permitidos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['app_chat', 'whatsapp', 'phone', 'email'] as ContactChannel[]).map((ch) => (
                  <label
                    key={ch}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer ${
                      editingProfile.allowedChannels.includes(ch)
                        ? 'border-amber-500 bg-amber-50/40 text-stone-900 font-semibold'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={editingProfile.allowedChannels.includes(ch)}
                      onChange={() => handleToggleChannel(ch)}
                      className="accent-amber-600"
                    />
                    <span className="capitalize">{ch.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-stone-100">
            <button
              type="submit"
              className="py-2.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Guardar Cambios de Perfil
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 4: REVIEWS */}
      {activeSubTab === 'reviews' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            Calificaciones y Reseñas de Clientes
          </h3>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 border border-stone-100 text-xs">
            <div className="text-center pr-4 border-r border-stone-200">
              <span className="text-2xl font-bold font-mono text-stone-900 block">
                {currentPro.rating.toFixed(1)}
              </span>
              <div className="flex items-center justify-center gap-0.5 text-amber-500 my-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                ))}
              </div>
              <span className="text-[11px] text-stone-500">{currentPro.reviewCount} en total</span>
            </div>
            <div>
              <p className="font-semibold text-stone-800">
                {currentPro.verifiedInAppReviewsCount} reseñas verificadas por trabajos completados dentro de la plataforma.
              </p>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Las reseñas verificadas provienen de órdenes cerradas donde ambas partes confirmaron la finalización y el pago.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {currentPro.reviews.map((rev) => (
              <div key={rev.id} className="p-3.5 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900">{rev.clientName}</span>
                  <span className="text-stone-500 text-[11px]">{rev.date}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                  ))}
                  {rev.isInAppVerified && (
                    <span className="text-[11px] text-emerald-800 font-semibold ml-2">
                      ✓ Trabajo verificado en app ({rev.serviceName})
                    </span>
                  )}
                </div>
                <p className="text-stone-700 italic pt-1">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
