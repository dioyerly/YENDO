import React, { useState } from 'react';
import { ServiceJob, PaymentMethod, ContactChannel } from '../types';
import { useApp } from '../context/AppContext';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  Send,
  Star,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  FileText,
  ArrowLeft,
  Info,
  ShieldCheck,
  User,
  Check,
} from 'lucide-react';

interface JobDetailViewProps {
  job: ServiceJob;
  onBack: () => void;
  onOpenReportModal: (jobId: string) => void;
}

export const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  onBack,
  onOpenReportModal,
}) => {
  const {
    role,
    currentUser,
    commissionRatePercent,
    updateMilestone,
    respondToExternalContact,
    updateEstimatedPrice,
    reportProFinalPrice,
    clientConfirmOrContestPayment,
    submitReview,
    sendChatMessage,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tracking' | 'chat' | 'history'>('tracking');
  const [chatInput, setChatInput] = useState('');

  // Forms states
  const [estimateInput, setEstimateInput] = useState<string>(
    job.estimatedPrice ? String(job.estimatedPrice) : ''
  );
  const [proFinalPriceInput, setProFinalPriceInput] = useState<string>(
    job.proFinalPriceReported ? String(job.proFinalPriceReported) : job.estimatedPrice ? String(job.estimatedPrice) : ''
  );
  const [proPaymentMethod, setProPaymentMethod] = useState<PaymentMethod>(
    job.proPaymentMethod || 'cash'
  );

  const [clientFinalPriceInput, setClientFinalPriceInput] = useState<string>(
    job.clientFinalPriceReported
      ? String(job.clientFinalPriceReported)
      : job.proFinalPriceReported
      ? String(job.proFinalPriceReported)
      : job.estimatedPrice
      ? String(job.estimatedPrice)
      : ''
  );
  const [clientPaymentMethod, setClientPaymentMethod] = useState<PaymentMethod>(
    job.clientPaymentMethod || 'cash'
  );
  const [clientHasDifference, setClientHasDifference] = useState(false);
  const [differenceReason, setDifferenceReason] = useState('');
  const [receiptNote, setReceiptNote] = useState(job.receiptNote || '');

  // Review state
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState('');

  const isClient = role === 'client';
  const isPro = role === 'pro';
  const isAdmin = role === 'admin';

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(job.id, chatInput);
    setChatInput('');
  };

  const handleProSubmitFinalPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(proFinalPriceInput);
    if (parsed > 0) {
      reportProFinalPrice(job.id, parsed, proPaymentMethod);
    }
  };

  const handleClientSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(clientFinalPriceInput);
    if (parsed > 0) {
      clientConfirmOrContestPayment({
        jobId: job.id,
        confirmedAmount: parsed,
        paymentMethod: clientPaymentMethod,
        matches: !clientHasDifference,
        differenceReason: clientHasDifference ? differenceReason : undefined,
        receiptNote: receiptNote.trim() || undefined,
      });
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim()) {
      submitReview(job.id, ratingInput, commentInput.trim());
      setCommentInput('');
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top back button & breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al listado</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportModal(job.id)}
            className="text-xs font-medium text-stone-600 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-stone-100 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
            <span>Reportar problema</span>
          </button>
        </div>
      </div>

      {/* Main Job Overview Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-stone-500">
                {job.code}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="text-xs font-semibold text-stone-800 uppercase tracking-wide">
                {job.categoryName}
              </span>
              {job.isEmergency && (
                <>
                  <span aria-hidden="true" className="text-stone-300">·</span>
                  <span className="text-xs font-bold text-rose-700">
                    🚨 Urgencia
                  </span>
                </>
              )}
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
              {job.description}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-500" />
                <span className="font-semibold text-stone-900">Cliente:</span> {job.clientName}
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-stone-900">Profesional:</span> {job.proCommercialName} ({job.proName})
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Iniciado: {formatDateTime(job.createdAt)}</span>
              </span>
            </div>
          </div>

          {/* Status Box */}
          <div className="sm:text-right shrink-0">
            <span className="text-[11px] text-stone-500 block uppercase font-medium">Estado del servicio</span>
            <span className={`inline-block text-xs font-bold mt-0.5 px-2.5 py-1 rounded-md ${
              job.status === 'work_in_progress'
                ? 'bg-amber-100 text-amber-900'
                : job.status === 'closed_pending_commission'
                ? 'bg-emerald-100 text-emerald-900'
                : job.status === 'closed_commission_paid'
                ? 'bg-blue-100 text-blue-900'
                : job.status === 'under_review'
                ? 'bg-rose-100 text-rose-900'
                : 'bg-stone-100 text-stone-800'
            }`}>
              {job.status === 'work_in_progress' && 'En ejecución en el domicilio'}
              {job.status === 'in_coordination' && 'Coordinando visita o presupuesto'}
              {job.status === 'contact_initiated' && 'Contacto inicial registrado'}
              {job.status === 'pro_responded' && 'Profesional respondió'}
              {job.status === 'closed_pending_commission' && 'Cerrado · Pendiente de comisión'}
              {job.status === 'closed_commission_paid' && 'Finalizado · Comisión liquidada'}
              {job.status === 'under_review' && 'En revisión por administración'}
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-6 text-xs font-medium pt-4">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-1.5 transition-colors border-b-2 ${
              activeTab === 'tracking'
                ? 'border-amber-600 text-stone-900 font-bold'
                : 'border-transparent text-stone-700 hover:text-stone-900'
            }`}
          >
            Hitos & Ficha de Seguimiento
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-1.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-amber-600 text-stone-900 font-bold'
                : 'border-transparent text-stone-700 hover:text-stone-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat del Servicio</span>
            {job.chatMessages.length > 0 && (
              <span className="text-[10px] bg-stone-100 px-1.5 rounded-full font-bold">
                {job.chatMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-amber-600 text-stone-900 font-bold'
                : 'border-transparent text-stone-700 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Registro de Auditoría ({job.historyEvents.length})</span>
          </button>
        </div>
      </div>

      {/* DISPUTE ALERT IF UNDER REVIEW */}
      {job.status === 'under_review' && (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Servicio en revisión por discrepancia de montos</span>
          </div>
          <p className="text-xs text-rose-800 leading-relaxed">
            {job.priceMismatchReason || 'Existe una diferencia entre el monto informado por el profesional y el monto confirmado por el cliente.'}
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-semibold pt-1">
            <span>Declarado por profesional: ${job.proFinalPriceReported?.toLocaleString() || 'N/A'}</span>
            <span>Declarado por cliente: ${job.clientFinalPriceReported?.toLocaleString() || 'N/A'}</span>
          </div>
          {isAdmin && (
            <p className="text-[11px] text-rose-700 italic pt-1">
              Como Administradora, puedes mediar y fijar el monto final acordado desde la pestaña de Administración.
            </p>
          )}
        </div>
      )}

      {/* TAB 1: TRACKING & MILESTONES */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* Dual-party audit explanation notice */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-stone-800">Verificación cruzada de hitos:</span> Ambas partes visualizan las actualizaciones en tiempo real. Un hito solo se considera completado de mutuo acuerdo cuando ambas partes lo confirman individualmente con registro de hora.
            </div>
          </div>

          {/* Milestone Timeline Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Cronograma de Hitos del Servicio
            </h2>

            <div className="space-y-5">
              {/* 1. Contacto Iniciado */}
              <MilestoneRow
                stepNumber={1}
                title="1. Contacto iniciado"
                description={`Registrado en la app vía ${job.initialChannel}`}
                state={job.milestones.contact_initiated}
                isConfirmed={!!job.milestones.contact_initiated.clientConfirmedAt}
              />

              {/* 2. Profesional Respondió */}
              <MilestoneRow
                stepNumber={2}
                title="2. Profesional respondió"
                description="El profesional tomó la solicitud y estableció el primer contacto"
                state={job.milestones.pro_responded}
                isConfirmed={!!job.milestones.pro_responded.proConfirmedAt || !!job.milestones.pro_responded.clientConfirmedAt}
                actionButton={
                  !job.milestones.pro_responded.proConfirmedAt && isPro ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'pro_responded', 'Profesional respondió la solicitud')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Marcar respondido
                    </button>
                  ) : !job.milestones.pro_responded.clientConfirmedAt && isClient ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'pro_responded', 'Cliente confirmó respuesta del profesional')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Confirmar que me respondió
                    </button>
                  ) : null
                }
              />

              {/* 3. Trabajo Aceptado */}
              <MilestoneRow
                stepNumber={3}
                title="3. Trabajo aceptado"
                description="Ambas partes acordaron realizar el trabajo"
                state={job.milestones.job_accepted}
                isConfirmed={!!job.milestones.job_accepted.proConfirmedAt && !!job.milestones.job_accepted.clientConfirmedAt}
                actionButton={
                  isPro && !job.milestones.job_accepted.proConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'job_accepted', 'Profesional aceptó el trabajo')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Aceptar trabajo (Pro)
                    </button>
                  ) : isClient && !job.milestones.job_accepted.clientConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'job_accepted', 'Cliente confirmó contratación')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Confirmar acuerdo (Cliente)
                    </button>
                  ) : null
                }
              />

              {/* 4. Precio Estimado */}
              <MilestoneRow
                stepNumber={4}
                title="4. Precio estimado acordado"
                description={
                  job.estimatedPrice
                    ? `Monto orientativo pactado: $${job.estimatedPrice.toLocaleString()}`
                    : 'Aún no se ha informado un precio preliminar'
                }
                state={job.milestones.price_agreed}
                isConfirmed={!!job.milestones.price_agreed.proConfirmedAt || !!job.milestones.price_agreed.clientConfirmedAt}
                actionButton={
                  !job.estimatedPrice && (isPro || isClient) ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Ej: 25000"
                        value={estimateInput}
                        onChange={(e) => setEstimateInput(e.target.value)}
                        className="w-24 text-xs p-1 border border-stone-300 rounded"
                      />
                      <button
                        onClick={() => {
                          const val = Number(estimateInput);
                          if (val > 0) updateEstimatedPrice(job.id, val);
                        }}
                        className="px-2 py-1 bg-amber-400 text-stone-950 font-bold text-xs rounded hover:bg-amber-300"
                      >
                        Fijar $
                      </button>
                    </div>
                  ) : null
                }
              />

              {/* 5. Visita o Trabajo Coordinado */}
              <MilestoneRow
                stepNumber={5}
                title="5. Visita o trabajo coordinado"
                description="Fecha y franja horaria acordada para la atención"
                state={job.milestones.visit_scheduled}
                isConfirmed={!!job.milestones.visit_scheduled.proConfirmedAt && !!job.milestones.visit_scheduled.clientConfirmedAt}
                actionButton={
                  isPro && !job.milestones.visit_scheduled.proConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'visit_scheduled', 'Visita agendada')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Coordinar visita (Pro)
                    </button>
                  ) : isClient && !job.milestones.visit_scheduled.clientConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'visit_scheduled', 'Cliente confirma horario de visita')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Confirmar horario (Cliente)
                    </button>
                  ) : null
                }
              />

              {/* 6. En camino (opcional) */}
              <MilestoneRow
                stepNumber={6}
                title="6. Profesional en camino (opcional)"
                description="Aviso de salida y tiempo de viaje estimado"
                state={job.milestones.on_the_way || {}}
                isConfirmed={!!job.milestones.on_the_way?.proConfirmedAt}
                actionButton={
                  isPro && !job.milestones.on_the_way?.proConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'on_the_way', 'Profesional en camino hacia el domicilio')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Voy en camino
                    </button>
                  ) : null
                }
              />

              {/* 7. Llegó al domicilio (opcional) */}
              <MilestoneRow
                stepNumber={7}
                title="7. Profesional llegó (opcional)"
                description="Presencia en el domicilio confirmada"
                state={job.milestones.arrived || {}}
                isConfirmed={!!job.milestones.arrived?.clientConfirmedAt || !!job.milestones.arrived?.proConfirmedAt}
                actionButton={
                  isPro && !job.milestones.arrived?.proConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'arrived', 'Profesional llegó al domicilio')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800 mr-2"
                    >
                      Llegué al domicilio
                    </button>
                  ) : isClient && !job.milestones.arrived?.clientConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'arrived', 'Cliente confirmó llegada')}
                      className="px-3 py-1 bg-emerald-700 text-white text-xs font-semibold rounded-md hover:bg-emerald-800"
                    >
                      Confirmar que llegó
                    </button>
                  ) : null
                }
              />

              {/* 8. Trabajo Iniciado */}
              <MilestoneRow
                stepNumber={8}
                title="8. Trabajo iniciado"
                description="Comienzo de las tareas de reparación o instalación"
                state={job.milestones.work_started}
                isConfirmed={!!job.milestones.work_started.proConfirmedAt || !!job.milestones.work_started.clientConfirmedAt}
                actionButton={
                  isPro && !job.milestones.work_started.proConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'work_started', 'Inicio de tareas')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Iniciar tareas
                    </button>
                  ) : isClient && !job.milestones.work_started.clientConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'work_started', 'Cliente confirma inicio')}
                      className="px-3 py-1 bg-stone-900 text-white text-xs font-semibold rounded-md hover:bg-stone-800"
                    >
                      Confirmar inicio
                    </button>
                  ) : null
                }
              />

              {/* 9. Trabajo Terminado */}
              <MilestoneRow
                stepNumber={9}
                title="9. Trabajo terminado"
                description="Finalización física de las tareas"
                state={job.milestones.work_completed}
                isConfirmed={!!job.milestones.work_completed.proConfirmedAt && !!job.milestones.work_completed.clientConfirmedAt}
                actionButton={
                  isPro && !job.milestones.work_completed.proConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'work_completed', 'Tareas finalizadas por el profesional')}
                      className="px-3 py-1 bg-amber-500 text-stone-950 font-bold text-xs rounded-md hover:bg-amber-400"
                    >
                      Marcar terminado
                    </button>
                  ) : isClient && !job.milestones.work_completed.clientConfirmedAt ? (
                    <button
                      onClick={() => updateMilestone(job.id, 'work_completed', 'Cliente verificó trabajo concluido')}
                      className="px-3 py-1 bg-amber-500 text-stone-950 font-bold text-xs rounded-md hover:bg-amber-400"
                    >
                      Confirmar que terminó
                    </button>
                  ) : null
                }
              />

              {/* 10. Pago Informado */}
              <MilestoneRow
                stepNumber={10}
                title="10. Pago informado"
                description="Declaración de importe final y medio de pago"
                state={job.milestones.payment_reported}
                isConfirmed={!!job.milestones.payment_reported.proConfirmedAt && !!job.milestones.payment_reported.clientConfirmedAt}
              />

              {/* 11. Cliente Confirma Resultado */}
              <MilestoneRow
                stepNumber={11}
                title="11. Cliente confirma resultado"
                description="Conformidad del cliente con el trabajo realizado"
                state={job.milestones.client_confirmed}
                isConfirmed={!!job.milestones.client_confirmed.clientConfirmedAt}
              />

              {/* 12. Trabajo Cerrado / Revisión */}
              <MilestoneRow
                stepNumber={12}
                title="12. Trabajo cerrado o en revisión"
                description="Cierre formal con cálculo de comisión o mediación"
                state={job.milestones.closed_or_review}
                isConfirmed={job.status.startsWith('closed')}
              />
            </div>
          </div>

          {/* PAYMENT & CLOSING SECTION */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Liquidación de Pago & Comisión</span>
            </h3>

            {/* If Pro needs to report final price */}
            {isPro && (
              <form onSubmit={handleProSubmitFinalPrice} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
                <span className="text-xs font-bold text-stone-900 block">
                  Paso del Profesional: Informar Monto Final Cobrado
                </span>
                <p className="text-xs text-stone-600">
                  Ingresa el monto total final cobrado al cliente y el medio de pago recibido.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Monto final cobrado ($ ARS) *
                    </label>
                    <input
                      type="number"
                      required
                      value={proFinalPriceInput}
                      onChange={(e) => setProFinalPriceInput(e.target.value)}
                      placeholder="Ej: 22000"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Medio de pago recibido *
                    </label>
                    <select
                      value={proPaymentMethod}
                      onChange={(e) => setProPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia Bancaria</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="other">Otro medio</option>
                    </select>
                  </div>
                </div>

                {Number(proFinalPriceInput) > 0 && (
                  <div className="text-xs text-stone-600 bg-white p-3 rounded-lg border border-stone-200 flex flex-wrap justify-between gap-2">
                    <span>
                      Comisión plataforma ({commissionRatePercent}%):{' '}
                      <strong className="text-stone-900 font-mono">
                        ${Math.round(Number(proFinalPriceInput) * (commissionRatePercent / 100)).toLocaleString()}
                      </strong>
                    </span>
                    <span>
                      Neto profesional:{' '}
                      <strong className="text-emerald-700 font-mono">
                        ${Math.round(Number(proFinalPriceInput) * (1 - commissionRatePercent / 100)).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  className="py-2 px-4 bg-stone-900 text-white font-semibold text-xs rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Guardar declaración de cobro
                </button>
              </form>
            )}

            {/* If Client needs to confirm or report mismatch */}
            {isClient && (
              <form onSubmit={handleClientSubmitPayment} className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-4">
                <span className="text-xs font-bold text-stone-900 block">
                  Paso del Cliente: Confirmación de Pago y Resultado
                </span>

                {job.proFinalPriceReported ? (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-950">
                    El profesional declaró haber cobrado{' '}
                    <strong className="font-mono">${job.proFinalPriceReported.toLocaleString()}</strong> mediante{' '}
                    <span className="capitalize">{job.proPaymentMethod}</span>.
                  </div>
                ) : (
                  <p className="text-xs text-stone-600">
                    Indica el monto que abonaste al profesional al finalizar el trabajo.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Monto abonado ($ ARS) *
                    </label>
                    <input
                      type="number"
                      required
                      value={clientFinalPriceInput}
                      onChange={(e) => setClientFinalPriceInput(e.target.value)}
                      placeholder="Ej: 22000"
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Medio de pago utilizado *
                    </label>
                    <select
                      value={clientPaymentMethod}
                      onChange={(e) => setClientPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia Bancaria</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="other">Otro medio</option>
                    </select>
                  </div>
                </div>

                {/* Comprobante note (optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nota o referencia del comprobante (opcional)
                  </label>
                  <input
                    type="text"
                    value={receiptNote}
                    onChange={(e) => setReceiptNote(e.target.value)}
                    placeholder="Ej: Nro de transferencia 8492021 o recibo físico firmado"
                    className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                  />
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    *Aclaración legal: La plataforma no valida automáticamente la autenticidad bancaria de comprobantes.
                  </p>
                </div>

                {/* Discrepancy toggle */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-800">
                    <input
                      type="checkbox"
                      checked={clientHasDifference}
                      onChange={(e) => setClientHasDifference(e.target.checked)}
                      className="w-4 h-4 accent-amber-600 rounded"
                    />
                    <span className="font-medium">
                      El monto cobrado no coincide con lo acordado o tengo una discrepancia
                    </span>
                  </label>

                  {clientHasDifference && (
                    <div className="mt-2.5 space-y-1">
                      <label className="block text-[11px] font-semibold text-rose-800">
                        Detalla el motivo de la diferencia para revisión administrativa *
                      </label>
                      <textarea
                        value={differenceReason}
                        onChange={(e) => setDifferenceReason(e.target.value)}
                        required={clientHasDifference}
                        rows={2}
                        placeholder="Ej: Me cobraron $10.000 de más sin previo aviso por un repuesto que no se utilizó..."
                        className="w-full text-xs p-2 rounded-lg border border-rose-300 bg-white focus:outline-rose-500"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  {clientHasDifference ? 'Enviar reporte de discrepancia a revisión' : 'Confirmar pago y cerrar trabajo'}
                </button>
              </form>
            )}

            {/* COMMISSION STATEMENT DISPLAY */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">
                  Comisión de la plataforma ({job.commission.ratePercent}%):
                </span>
                <span className="font-mono font-bold text-stone-900">
                  ${job.commission.platformAmount.toLocaleString()} ARS
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Ingreso correspondiente al profesional (95%):</span>
                <span className="font-mono font-semibold text-emerald-700">
                  ${job.commission.proAmount.toLocaleString()} ARS
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-200">
                <span>Estado de comisión:</span>
                <span className="font-semibold text-stone-800 capitalize">
                  {job.commission.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200 leading-snug">
                *La aplicación no retiene fondos de los clientes ni debita comisiones automáticamente de cuentas bancarias. Las comisiones se liquidan periódicamente de forma manual entre el profesional y la plataforma.
              </p>
            </div>

            {/* REVIEW SECTION WHEN CLOSED */}
            {job.status.startsWith('closed') && (
              <div className="pt-4 border-t border-stone-200">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Calificación del Servicio</span>
                </h4>

                {job.reviewSubmitted ? (
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center gap-1 text-amber-500 font-semibold">
                      {Array.from({ length: job.reviewSubmitted.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      ))}
                      <span className="text-emerald-900 ml-2">Reseña verificada registrada en la app</span>
                    </div>
                    <p className="italic text-emerald-900">"{job.reviewSubmitted.comment}"</p>
                  </div>
                ) : isClient ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <p className="text-xs text-stone-700">
                      Como el trabajo está cerrado, deja tu opinión para ayudar a otros vecinos. Se marcará como <strong>verificada con trabajo realizado en la app</strong>.
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-800">Calificación:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= ratingInput
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        required
                        rows={2}
                        placeholder="Contá cómo fue la puntualidad, prolijidad y cumplimiento del presupuesto..."
                        className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg transition-colors"
                    >
                      Publicar reseña verificada
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-stone-500 italic">
                    Aguardando la calificación del cliente.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IN-APP CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-[520px]">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">
                Chat directo entre {job.clientName} y {job.proCommercialName}
              </span>
            </div>
            <span className="text-[11px] text-stone-500">
              Asociado a orden #{job.code}
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/30">
            {job.chatMessages.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                No hay mensajes aún. Escribe el primer mensaje para coordinar.
              </div>
            ) : (
              job.chatMessages.map((msg) => {
                const isMe =
                  (isClient && msg.senderRole === 'client') ||
                  (isPro && msg.senderRole === 'pro');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-stone-600 mb-0.5 px-1 font-medium">
                      {msg.senderName} · {msg.timestamp}
                    </span>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        isMe
                          ? 'bg-amber-400 text-stone-950 font-medium rounded-br-xs'
                          : 'bg-white border border-stone-200 text-stone-900 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-stone-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Enviar mensaje como ${isPro ? job.proName : isClient ? job.clientName : 'Administradora'}...`}
              className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: AUDIT HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            Historial de Auditoría & Trazabilidad
          </h3>
          <p className="text-xs text-stone-600">
            Registro cronológico inmutable de todas las acciones, cambios de estado y canales utilizados en este servicio.
          </p>

          <div className="space-y-3 pt-2">
            {job.historyEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-xl border border-stone-100 bg-stone-50/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{evt.action}</span>
                    <span className="text-[11px] bg-stone-200/80 text-stone-700 px-1.5 py-0.2 rounded font-mono">
                      {evt.actorRole.toUpperCase()} · {evt.actorName}
                    </span>
                  </div>
                  {evt.details && (
                    <p className="text-stone-600 mt-1 text-[11px]">{evt.details}</p>
                  )}
                </div>
                <span className="text-[11px] text-stone-600 font-mono shrink-0 font-medium">
                  {formatDateTime(evt.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: MilestoneRow for dual confirmation display
const MilestoneRow: React.FC<{
  stepNumber: number;
  title: string;
  description: string;
  state: {
    proConfirmedAt?: string;
    proActorName?: string;
    clientConfirmedAt?: string;
    clientActorName?: string;
    note?: string;
  };
  isConfirmed: boolean;
  actionButton?: React.ReactNode;
}> = ({ stepNumber, title, description, state, isConfirmed, actionButton }) => {
  const formatTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="p-3.5 rounded-xl border border-stone-200/90 bg-stone-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isConfirmed
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-200 text-stone-600'
            }`}
          >
            {isConfirmed ? <Check className="w-3 h-3 stroke-[3]" /> : stepNumber}
          </div>
          <span className="text-xs font-bold text-stone-900">{title}</span>
        </div>
        <p className="text-[11px] text-stone-600 pl-7">{description}</p>

        {/* Dual verification pill-free status */}
        <div className="pl-7 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          {state.proConfirmedAt ? (
            <span className="text-emerald-800 font-medium">
              ✓ Profesional ({state.proActorName || 'Pro'}): {formatTime(state.proConfirmedAt)}
            </span>
          ) : (
            <span className="text-stone-600">○ Pendiente profesional</span>
          )}

          <span aria-hidden="true" className="text-stone-300">·</span>

          {state.clientConfirmedAt ? (
            <span className="text-emerald-800 font-medium">
              ✓ Cliente ({state.clientActorName || 'Cliente'}): {formatTime(state.clientConfirmedAt)}
            </span>
          ) : (
            <span className="text-stone-600">○ Pendiente cliente</span>
          )}
        </div>

        {state.note && (
          <p className="pl-7 text-[10px] text-stone-500 italic">
            Nota: "{state.note}"
          </p>
        )}
      </div>

      {actionButton && <div className="pl-7 sm:pl-0 shrink-0">{actionButton}</div>}
    </div>
  );
};
