import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceJob, CommissionStatus, VerificationStatus, ProfessionalProfile } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  Download,
  Filter,
  Search,
  CheckCircle,
  Eye,
  Settings,
  DollarSign,
  FileSpreadsheet,
  Lock,
  UserCheck,
  Check,
  X,
  MessageSquare,
  ArrowLeft,
  FileText,
  BadgeCheck,
  Clock,
  Shield,
} from 'lucide-react';
import { CATEGORIES, ZONES } from '../data/mockData';

interface AdminPanelProps {
  onSelectJob: (job: ServiceJob) => void;
  onExitAdmin?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSelectJob, onExitAdmin }) => {
  const {
    role,
    adminAuthenticated,
    adminLogin,
    adminLogout,
    jobs,
    professionals,
    reports,
    resolveReport,
    commissionRatePercent,
    setCommissionRatePercent,
    resolveDispute,
    updateCommissionStatus,
    verifyProfessionalDNI,
  } = useApp();

  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active section in Admin
  const [adminTab, setAdminTab] = useState<'jobs' | 'dni_verification' | 'disputes' | 'commissions' | 'reports'>('jobs');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('all');

  // Rate config form
  const [tempRate, setTempRate] = useState<number>(commissionRatePercent);
  const [rateUpdatedSuccess, setRateUpdatedSuccess] = useState(false);

  // Dispute resolution modal state
  const [mediatingJob, setMediatingJob] = useState<ServiceJob | null>(null);
  const [mediatedPriceInput, setMediatedPriceInput] = useState('');
  const [adminResolutionNote, setAdminResolutionNote] = useState('');

  // Commission status modal
  const [statusModalJob, setStatusModalJob] = useState<ServiceJob | null>(null);
  const [newCommStatus, setNewCommStatus] = useState<CommissionStatus>('paid');
  const [commStatusNote, setCommStatusNote] = useState('');

  // Report resolution modal
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
  const [reportResolutionText, setReportResolutionText] = useState('');

  // DNI inspect modal
  const [inspectingDniPro, setInspectingDniPro] = useState<ProfessionalProfile | null>(null);
  const [dniVerificationNote, setDniVerificationNote] = useState('');

  // If not authenticated as admin, show secure administrative gateway
  if (!adminAuthenticated && role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border border-stone-200 rounded-2xl shadow-sm text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900">Portal de Administración Segura</h2>
          <p className="text-xs text-stone-600 mt-1">
            Espacio confidencial reservado para la Administradora del sistema (auditoría, validación de DNI de prestadores y mediación).
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const ok = adminLogin(adminPinInput);
            if (!ok) {
              setPinError('Clave incorrecta. Usa: admin123 o 1234');
            } else {
              setPinError('');
            }
          }}
          className="space-y-3 text-xs"
        >
          <div>
            <label className="block text-left font-semibold text-stone-700 mb-1">
              Contraseña o PIN de Administradora
            </label>
            <input
              type="password"
              required
              value={adminPinInput}
              onChange={(e) => setAdminPinInput(e.target.value)}
              placeholder="Ingresa clave (ej. admin123)"
              className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50 text-stone-900 text-center font-mono font-bold tracking-widest"
            />
            {pinError && <p className="text-rose-600 text-[11px] mt-1 font-medium">{pinError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Acceder al Backoffice Administrativo
          </button>
        </form>

        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
          <span className="text-stone-400">Acceso rápido demo:</span>
          <button
            type="button"
            onClick={() => adminLogin('admin123')}
            className="text-amber-800 hover:underline font-semibold"
          >
            Entrar como Paula Sánchez (Admin)
          </button>
        </div>
      </div>
    );
  }

  // Aggregated KPI numbers
  const totalJobsCount = jobs.length;
  const underReviewJobs = jobs.filter((j) => j.status === 'under_review');
  const closedJobs = jobs.filter((j) => j.status.startsWith('closed'));
  const totalGrossAmount = closedJobs.reduce(
    (sum, j) => sum + (j.clientFinalPriceReported || j.proFinalPriceReported || 0),
    0
  );
  const totalCommissionAccrued = closedJobs.reduce(
    (sum, j) => sum + (j.commission.platformAmount || 0),
    0
  );
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const pendingDniPros = professionals.filter((p) => p.verificationStatus === 'pending');

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'under_review' && j.status !== 'under_review') return false;
      if (statusFilter === 'closed' && !j.status.startsWith('closed')) return false;
      if (statusFilter === 'active' && (j.status.startsWith('closed') || j.status === 'under_review')) return false;
    }
    if (zoneFilter !== 'all' && !j.clientZone.toLowerCase().includes(zoneFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        j.code.toLowerCase().includes(q) ||
        j.clientName.toLowerCase().includes(q) ||
        j.proName.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.categoryName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleUpdateCommissionRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempRate > 0 && tempRate <= 30) {
      setCommissionRatePercent(tempRate);
      setRateUpdatedSuccess(true);
      setTimeout(() => setRateUpdatedSuccess(false), 3000);
    }
  };

  const handleResolveDisputeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mediatingJob && Number(mediatedPriceInput) > 0) {
      resolveDispute(mediatingJob.id, Number(mediatedPriceInput), adminResolutionNote);
      setMediatingJob(null);
      setMediatedPriceInput('');
      setAdminResolutionNote('');
    }
  };

  const handleUpdateCommissionStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statusModalJob) {
      updateCommissionStatus(statusModalJob.id, newCommStatus, commStatusNote);
      setStatusModalJob(null);
      setCommStatusNote('');
    }
  };

  const handleResolveReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingReportId && reportResolutionText.trim()) {
      resolveReport(resolvingReportId, reportResolutionText);
      setResolvingReportId(null);
      setReportResolutionText('');
    }
  };

  const exportJobsCSV = () => {
    const headers = [
      'Codigo',
      'Fecha_Creacion',
      'Categoria',
      'Cliente',
      'Profesional',
      'Estado',
      'Monto_Declarado_Pro',
      'Monto_Declarado_Cliente',
      'Comision_Porcentaje',
      'Comision_Plataforma_ARS',
      'Estado_Comision',
    ];

    const rows = jobs.map((j) => [
      j.code,
      new Date(j.createdAt).toLocaleDateString(),
      `"${j.categoryName}"`,
      `"${j.clientName}"`,
      `"${j.proName}"`,
      j.status,
      j.proFinalPriceReported || 0,
      j.clientFinalPriceReported || 0,
      j.commission.ratePercent,
      j.commission.platformAmount,
      j.commission.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_comisiones_soluciones_hogar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mask sensitive private info
  const maskPhone = (phone?: string) => {
    if (!phone) return '••••-••••';
    return phone.slice(0, 6) + ' ••••-' + phone.slice(-4);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Backoffice Banner with Exit option */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
              Panel Administrativo de Control y Operaciones
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.2 rounded font-mono">
              SESIÓN SEGURA
            </span>
          </div>
          <h1 className="text-xl font-bold mt-1">
            Backoffice Central · Soluciones para tu Hogar
          </h1>
          <p className="text-xs text-stone-300 mt-0.5">
            Administradora: Paula Sánchez · Gestión de comisiones, resolución de controversias y validación de DNI de prestadores.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={exportJobsCSV}
            className="py-2 px-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          {onExitAdmin && (
            <button
              onClick={onExitAdmin}
              className="py-2 px-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la App</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium block">Total Servicios</span>
          <span className="text-xl font-bold font-mono text-stone-900 mt-0.5 block">
            {totalJobsCount}
          </span>
          <span className="text-[10px] text-stone-500">Registrados en la app</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium block">DNI por Validar</span>
          <span className="text-xl font-bold font-mono text-amber-700 mt-0.5 block">
            {pendingDniPros.length}
          </span>
          <span className="text-[10px] text-stone-500">Nuevos prestadores</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium block">Volumen Bruto</span>
          <span className="text-xl font-bold font-mono text-stone-900 mt-0.5 block">
            ${totalGrossAmount.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-500">Monto total liquidado</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium block">Comisiones ({commissionRatePercent}%)</span>
          <span className="text-xl font-bold font-mono text-stone-900 mt-0.5 block">
            ${totalCommissionAccrued.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-500">Saldos devengados</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-xs text-rose-800 font-medium block">Disputas Abiertas</span>
          <span className="text-xl font-bold font-mono text-rose-700 mt-0.5 block">
            {underReviewJobs.length}
          </span>
          <span className="text-[10px] text-stone-500">Requieren mediación</span>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setAdminTab('jobs')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap ${
            adminTab === 'jobs'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          Auditoría de Servicios ({jobs.length})
        </button>

        <button
          onClick={() => setAdminTab('dni_verification')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'dni_verification'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Validación de DNI de Prestadores</span>
          {pendingDniPros.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-400 text-stone-950 rounded">
              {pendingDniPros.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('disputes')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'disputes'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span>Controversias & Mediación ({underReviewJobs.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('commissions')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'commissions'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Configuración de Comisiones</span>
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className={`py-2 px-3.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            adminTab === 'reports'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Reportes de Usuarios ({reports.length})</span>
        </button>
      </div>

      {/* SECTION: DNI VERIFICATION QUEUE */}
      {adminTab === 'dni_verification' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Control y Verificación de DNI de Profesionales</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Revisión de identidad obligatoria para autorizar que el profesional atienda domicilios con la insignia de verificado.
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {professionals.map((pro) => (
              <div
                key={pro.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={pro.photoUrl}
                    alt={pro.name}
                    className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900 text-sm">{pro.name}</span>
                      <span className="text-stone-500">({pro.commercialName})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 text-stone-600 mt-1">
                      <span>DNI declarado: <strong className="font-mono text-stone-900">{pro.dniNumber || 'No informado'}</strong></span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span>Zona: {pro.coverageZones[0] || 'N/A'}</span>
                      <span aria-hidden="true" className="text-stone-300">·</span>
                      <span className="text-stone-500">{maskPhone(pro.phone)}</span>
                    </div>
                    {pro.verificationNotes && (
                      <p className="text-stone-500 text-[11px] mt-1 italic">
                        Nota interna: "{pro.verificationNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                      pro.verificationStatus === 'verified'
                        ? 'bg-emerald-100 text-emerald-900'
                        : pro.verificationStatus === 'pending'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {pro.verificationStatus === 'verified'
                      ? '✓ IDENTIDAD VERIFICADA'
                      : pro.verificationStatus === 'pending'
                      ? 'PENDIENTE DE REVISIÓN'
                      : 'RECHAZADO'}
                  </span>

                  <button
                    onClick={() => {
                      setInspectingDniPro(pro);
                      setDniVerificationNote(pro.verificationNotes || '');
                    }}
                    className="py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg text-xs"
                  >
                    Inspeccionar DNI
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: DISPUTES & MEDIATION */}
      {adminTab === 'disputes' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Controversias por Discrepancia de Montos</span>
            </h3>
            <p className="text-xs text-stone-600">
              Servicios donde el profesional y el cliente declararon importes diferentes. La administradora puede revisar los hechos, fijar el monto acordado y liquidar la comisión correspondiente.
            </p>

            {underReviewJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                ✓ No hay disputas abiertas en este momento. Todos los servicios cerrados fueron de común acuerdo.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {underReviewJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-stone-900">{job.code}</span>
                        <span aria-hidden="true" className="text-stone-300">·</span>
                        <span className="font-bold text-stone-900">{job.description}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 text-stone-600">
                        <span>Cliente: <strong>{job.clientName}</strong> (Declaró: ${job.clientFinalPriceReported?.toLocaleString() || 'N/A'})</span>
                        <span>Profesional: <strong>{job.proName}</strong> (Declaró: ${job.proFinalPriceReported?.toLocaleString() || 'N/A'})</span>
                      </div>
                      {job.priceMismatchReason && (
                        <p className="text-rose-800 font-medium text-[11px] mt-1">
                          Motivo declarado: "{job.priceMismatchReason}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setMediatingJob(job);
                          setMediatedPriceInput(String(job.clientFinalPriceReported || job.estimatedPrice || ''));
                          setAdminResolutionNote('');
                        }}
                        className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
                      >
                        Mediar y fijar monto final
                      </button>
                      <button
                        onClick={() => onSelectJob(job)}
                        className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-lg text-xs"
                      >
                        Ver trazabilidad
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION: COMMISSIONS & SETTINGS */}
      {adminTab === 'commissions' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-stone-600" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                Porcentaje de Comisión de la Plataforma
              </h3>
            </div>
            {rateUpdatedSuccess && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Comisión actualizada en tiempo real
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateCommissionRate} className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-stone-700">
                Porcentaje de comisión general:
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  value={tempRate}
                  onChange={(e) => setTempRate(Number(e.target.value))}
                  className="w-20 p-2 border border-stone-300 rounded-lg text-center font-bold text-xs"
                />
                <span className="font-bold text-stone-700">%</span>
              </div>
            </div>

            <button
              type="submit"
              className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Guardar nuevo porcentaje
            </button>
          </form>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
            <span className="font-bold text-stone-800 block">Regla de liquidación administrativa:</span>
            <p>
              La comisión del <strong>{commissionRatePercent}%</strong> se aplica únicamente sobre trabajos completados y pagados de común acuerdo. La plataforma no debita automáticamente cuentas bancarias ni retiene dinero de los clientes. El cobro se realiza periódicamente contra factura o comprobante.
            </p>
          </div>
        </div>
      )}

      {/* SECTION: AUDIT JOBS TABLE */}
      {adminTab === 'jobs' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
              Auditoría Completa de Servicios
            </h3>

            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar código, cliente, pro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-2.5 border border-stone-300 rounded-lg text-xs font-medium"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos en curso</option>
                <option value="under_review">En revisión / discrepancia</option>
                <option value="closed">Cerrados finalizados</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Orden</th>
                  <th className="py-2.5 px-3">Cliente (Privacidad)</th>
                  <th className="py-2.5 px-3">Profesional</th>
                  <th className="py-2.5 px-3">Servicio</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Monto Final</th>
                  <th className="py-2.5 px-3 text-right">Comisión</th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      No se encontraron servicios que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const finalAmount = job.clientFinalPriceReported || job.proFinalPriceReported || job.estimatedPrice || 0;
                    return (
                      <tr key={job.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-stone-900">
                          {job.code}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-stone-900 block">{job.clientName}</span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {maskPhone(job.clientPhone)}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-stone-900 block">{job.proCommercialName}</span>
                          <span className="text-[10px] text-stone-500">{job.proName}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-stone-800 font-medium">{job.categoryName}</span>
                          <span className="text-[10px] text-stone-500 block line-clamp-1">
                            {job.description}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded ${
                            job.status === 'under_review'
                              ? 'bg-rose-100 text-rose-800'
                              : job.status.startsWith('closed')
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-stone-100 text-stone-800'
                          }`}>
                            {job.status === 'under_review' ? 'En revisión' : job.status.startsWith('closed') ? 'Cerrado' : 'En curso'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-stone-900">
                          ${finalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono text-amber-900 font-semibold block">
                            ${(job.commission.platformAmount || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-500 uppercase">
                            {job.commission.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onSelectJob(job)}
                              className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded"
                              title="Ver trazabilidad completa"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setStatusModalJob(job);
                                setNewCommStatus(job.commission.status);
                                setCommStatusNote(job.commission.adminNote || '');
                              }}
                              className="p-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded"
                              title="Modificar estado de comisión"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION: USER REPORTS */}
      {adminTab === 'reports' && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            Reportes & Consultas de Usuarios
          </h3>
          <div className="space-y-3">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{rep.reason}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      rep.status === 'resolved' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                    }`}>
                      {rep.status === 'resolved' ? 'RESUELTO' : 'PENDIENTE'}
                    </span>
                  </div>
                  <p className="text-stone-600 mt-1">{rep.details}</p>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    Reportado por: {rep.reporterName} ({rep.reporterRole}) · {new Date(rep.createdAt).toLocaleDateString()}
                  </span>
                  {rep.adminResolution && (
                    <p className="text-emerald-800 text-[11px] font-semibold mt-1">
                      Resolución: "{rep.adminResolution}"
                    </p>
                  )}
                </div>

                {rep.status === 'pending' && (
                  <button
                    onClick={() => {
                      setResolvingReportId(rep.id);
                      setReportResolutionText('');
                    }}
                    className="py-1.5 px-3 bg-stone-900 text-white font-semibold text-xs rounded-lg hover:bg-stone-800 shrink-0"
                  >
                    Resolver reporte
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DNI INSPECTION MODAL */}
      {inspectingDniPro && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Inspección de DNI · {inspectingDniPro.name}
                </h3>
                <span className="text-xs text-stone-500">{inspectingDniPro.commercialName}</span>
              </div>
              <button
                onClick={() => setInspectingDniPro(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <p><strong>Número de DNI:</strong> <span className="font-mono font-bold text-stone-900">{inspectingDniPro.dniNumber}</span></p>
                <p><strong>Teléfono:</strong> {inspectingDniPro.phone}</p>
                <p><strong>Correo:</strong> {inspectingDniPro.email}</p>
              </div>

              {/* DNI Image Preview */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Documento escaneado / Foto de DNI:
                </label>
                <div className="rounded-xl overflow-hidden border border-stone-300 bg-stone-100 max-h-56 flex items-center justify-center">
                  <img
                    src={inspectingDniPro.dniFrontUrl || 'https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=500&auto=format&fit=crop&q=80'}
                    alt="DNI Frente"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nota interna de validación administrativa:
                </label>
                <textarea
                  rows={2}
                  value={dniVerificationNote}
                  onChange={(e) => setDniVerificationNote(e.target.value)}
                  placeholder="Ej. DNI verificado en padrón. Coincide foto y titularidad..."
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    verifyProfessionalDNI(inspectingDniPro.id, 'rejected', dniVerificationNote);
                    setInspectingDniPro(null);
                  }}
                  className="py-2 px-3.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg text-xs"
                >
                  Rechazar DNI
                </button>
                <button
                  type="button"
                  onClick={() => {
                    verifyProfessionalDNI(inspectingDniPro.id, 'verified', dniVerificationNote);
                    setInspectingDniPro(null);
                  }}
                  className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs"
                >
                  Aprobar y Otorgar Insignia Verificado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISPUTE RESOLUTION MODAL */}
      {mediatingJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">
                Mediar Discrepancia #{mediatingJob.code}
              </h3>
              <button
                onClick={() => setMediatingJob(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-700 space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <p>
                <strong>Profesional declaró:</strong> ${mediatingJob.proFinalPriceReported?.toLocaleString() || 'N/A'}
              </p>
              <p>
                <strong>Cliente declaró:</strong> ${mediatingJob.clientFinalPriceReported?.toLocaleString() || 'N/A'}
              </p>
              {mediatingJob.priceMismatchReason && (
                <p className="text-rose-700 italic">
                  Detalle del cliente: "{mediatingJob.priceMismatchReason}"
                </p>
              )}
            </div>

            <form onSubmit={handleResolveDisputeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Monto final unificado mediado ($ ARS) *
                </label>
                <input
                  type="number"
                  required
                  value={mediatedPriceInput}
                  onChange={(e) => setMediatedPriceInput(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Fundamento / Nota de resolución de la administradora *
                </label>
                <textarea
                  required
                  rows={2}
                  value={adminResolutionNote}
                  onChange={(e) => setAdminResolutionNote(e.target.value)}
                  placeholder="Ej: Se acordó ajuste del monto final tras revisar los comprobantes presentados..."
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMediatingJob(null)}
                  className="py-2 px-3 text-stone-600 hover:text-stone-900 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
                >
                  Confirmar mediación y cerrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE COMMISSION STATUS MODAL */}
      {statusModalJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-sm font-bold text-stone-900">
                Actualizar Estado de Comisión #{statusModalJob.code}
              </h3>
              <button
                onClick={() => setStatusModalJob(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCommissionStatusSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Nuevo estado de la comisión:
                </label>
                <select
                  value={newCommStatus}
                  onChange={(e) => setNewCommStatus(e.target.value as CommissionStatus)}
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs font-semibold"
                >
                  <option value="pending_payment">Pendiente de pago a la plataforma</option>
                  <option value="paid">Pagada / Rendida</option>
                  <option value="disputed">Disputada</option>
                  <option value="cancelled">Anulada (sin costo)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Motivo o registro administrativo:
                </label>
                <textarea
                  rows={2}
                  value={commStatusNote}
                  onChange={(e) => setCommStatusNote(e.target.value)}
                  placeholder="Ej: Rendición confirmada por comprobante de transferencia bancaria..."
                  className="w-full p-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalJob(null)}
                  className="py-2 px-3 text-stone-600 hover:text-stone-900 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800"
                >
                  Guardar estado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE REPORT MODAL */}
      {resolvingReportId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">
              Registrar Resolución del Reporte
            </h3>
            <form onSubmit={handleResolveReportSubmit} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                value={reportResolutionText}
                onChange={(e) => setReportResolutionText(e.target.value)}
                placeholder="Indica las medidas tomadas o el acuerdo alcanzado..."
                className="w-full p-2 border border-stone-300 rounded-lg text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolvingReportId(null)}
                  className="py-2 px-3 text-stone-600 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800"
                >
                  Marcar como resuelto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
