import React from 'react';
import { useApp } from '../context/AppContext';
import { ServiceJob } from '../types';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Star,
  Calendar,
  MessageSquare,
  Search,
  Bell,
} from 'lucide-react';

interface ClientDashboardProps {
  onSelectJob: (job: ServiceJob) => void;
  onExplore: () => void;
  onOpenReportModal: (jobId?: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  onSelectJob,
  onExplore,
  onOpenReportModal,
}) => {
  const { jobs, currentUser } = useApp();

  // Filter jobs for this client
  const clientJobs = jobs.filter((j) => j.clientId === (currentUser?.id || 'user-client-1'));

  // Reminders: active jobs where client has a pending confirmation
  const pendingArrivalReminders = clientJobs.filter(
    (j) => j.milestones.on_the_way?.proConfirmedAt && !j.milestones.arrived?.clientConfirmedAt
  );

  const pendingCompletionReminders = clientJobs.filter(
    (j) => j.milestones.work_completed.proConfirmedAt && !j.milestones.work_completed.clientConfirmedAt
  );

  const pendingPaymentReminders = clientJobs.filter(
    (j) => j.milestones.work_completed.proConfirmedAt && !j.clientPaymentConfirmed
  );

  const activeJobs = clientJobs.filter((j) => !j.status.startsWith('closed'));
  const closedJobs = clientJobs.filter((j) => j.status.startsWith('closed'));

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Client Header */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            Panel de Servicios del Cliente
          </span>
          <h1 className="text-xl font-bold text-stone-900 mt-0.5">
            Hola, {currentUser?.name || 'Cliente'}
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Zona registrada: <span className="font-semibold text-stone-800">{currentUser?.zone || 'CABA'}</span> · Aquí puedes hacer seguimiento de tus contactos y pagos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExplore}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar nuevo profesional</span>
          </button>
        </div>
      </div>

      {/* Actionable Reminders Banner */}
      {(pendingArrivalReminders.length > 0 ||
        pendingCompletionReminders.length > 0 ||
        pendingPaymentReminders.length > 0) && (
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <Bell className="w-4 h-4 text-amber-700" />
            <span>Recordatorios de acción pendiente:</span>
          </div>

          <div className="space-y-1.5 text-xs text-amber-900">
            {pendingArrivalReminders.map((j) => (
              <div
                key={j.id}
                onClick={() => onSelectJob(j)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer hover:bg-white"
              >
                <span>
                  <strong>{j.proName}</strong> está en camino para "{j.description}". ¿Llegó al domicilio?
                </span>
                <span className="text-amber-800 font-semibold underline text-[11px]">Confirmar llegada →</span>
              </div>
            ))}

            {pendingCompletionReminders.map((j) => (
              <div
                key={j.id}
                onClick={() => onSelectJob(j)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer hover:bg-white"
              >
                <span>
                  <strong>{j.proName}</strong> marcó trabajo terminado en orden #{j.code}. Por favor verifica y confirma el resultado.
                </span>
                <span className="text-amber-800 font-semibold underline text-[11px]">Verificar →</span>
              </div>
            ))}

            {pendingPaymentReminders.map((j) => (
              <div
                key={j.id}
                onClick={() => onSelectJob(j)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-amber-200 cursor-pointer hover:bg-white"
              >
                <span>
                  Trabajo finalizado con <strong>{j.proName}</strong>. Pendiente informar y confirmar monto pagado.
                </span>
                <span className="text-amber-800 font-semibold underline text-[11px]">Informar pago →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Jobs Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
          <span>Servicios Activos & En Curso ({activeJobs.length})</span>
        </h2>

        {activeJobs.length === 0 ? (
          <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl text-xs text-stone-500 space-y-3">
            <p>No tienes ningún servicio activo en este momento.</p>
            <button
              onClick={onExplore}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl font-semibold text-xs hover:bg-stone-800"
            >
              Explorar profesionales en mi zona
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-2xs group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-stone-500">{job.code}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="font-semibold text-stone-900">{job.categoryName}</span>
                    {job.isEmergency && (
                      <span className="text-rose-600 font-bold text-[11px]">🚨 Urgencia</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                    {job.description}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-stone-500">
                    <span>Profesional: <strong>{job.proCommercialName}</strong></span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>Canal: {job.initialChannel}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>
                      {job.estimatedPrice
                        ? `Est.: $${job.estimatedPrice.toLocaleString()}`
                        : 'Cotización pendiente'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    job.status === 'under_review'
                      ? 'bg-rose-100 text-rose-800'
                      : job.status === 'work_in_progress'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-stone-100 text-stone-800'
                  }`}>
                    {job.status === 'work_in_progress' && 'En ejecución'}
                    {job.status === 'in_coordination' && 'Coordinando'}
                    {job.status === 'contact_initiated' && 'Contacto registrado'}
                    {job.status === 'pro_responded' && 'Pro respondió'}
                    {job.status === 'under_review' && 'En revisión'}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-amber-100 flex items-center justify-center text-stone-600 group-hover:text-stone-900 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Jobs & Reviews History */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
          Historial de Trabajos Finalizados ({closedJobs.length})
        </h2>

        {closedJobs.length === 0 ? (
          <div className="p-6 text-center bg-white border border-stone-200 rounded-2xl text-xs text-stone-400">
            Aún no tienes trabajos cerrados en tu historial.
          </div>
        ) : (
          <div className="space-y-3">
            {closedJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className="bg-white border border-stone-200 hover:border-stone-300 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-stone-500">{job.code}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="font-semibold text-stone-900">{job.categoryName}</span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span className="text-emerald-700 font-semibold">✓ Cerrado</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-800">
                    {job.description}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-stone-500">
                    <span>Atendido por: <strong>{job.proName}</strong></span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    <span>Monto final: <strong>${(job.clientFinalPriceReported || job.proFinalPriceReported || 0).toLocaleString()}</strong></span>
                  </div>

                  {job.reviewSubmitted && (
                    <div className="flex items-center gap-1 text-amber-500 text-xs pt-0.5">
                      {Array.from({ length: job.reviewSubmitted.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                      ))}
                      <span className="text-stone-600 text-[11px] ml-1">Tu reseña fue publicada</span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-stone-700 underline">
                    Ver ficha y comprobante →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support & Problem Reporting Footer */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-stone-500" />
          <span>¿Tuviste un inconveniente con un profesional o un presupuesto?</span>
        </div>
        <button
          onClick={() => onOpenReportModal()}
          className="font-semibold text-stone-900 hover:text-rose-700 underline cursor-pointer"
        >
          Enviar reporte a la administración
        </button>
      </div>
    </div>
  );
};
