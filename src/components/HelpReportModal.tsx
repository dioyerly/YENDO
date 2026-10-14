import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';

interface HelpReportModalProps {
  jobId?: string;
  onClose: () => void;
}

export const HelpReportModal: React.FC<HelpReportModalProps> = ({ jobId, onClose }) => {
  const { createReport, jobs } = useApp();
  const [reason, setReason] = useState('Discrepancia en el monto final acordado');
  const [details, setDetails] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string>(jobId || '');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    createReport({
      jobId: selectedJobId || undefined,
      reason,
      details: details.trim(),
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Reportar un Problema o Consulta
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-stone-900">Reporte registrado con éxito</h4>
            <p className="text-xs text-stone-600">
              El equipo de administración revisará la información y se comunicará a la brevedad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Servicio relacionado (opcional)
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
              >
                <option value="">Consulta o reporte general</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.code} - {j.description} ({j.proCommercialName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Motivo del reporte *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-stone-300 bg-white font-medium"
              >
                <option value="Discrepancia en el monto final acordado">
                  Discrepancia en el monto final acordado
                </option>
                <option value="Profesional no asistió a la visita pactada">
                  Profesional no asistió a la visita pactada
                </option>
                <option value="Trabajo incompleto o con fallas">
                  Trabajo incompleto o con fallas
                </option>
                <option value="Conducta inapropiada">
                  Conducta inapropiada
                </option>
                <option value="Consulta sobre comisiones">
                  Consulta sobre comisiones
                </option>
                <option value="Otro motivo">
                  Otro motivo
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Detalle de lo ocurrido *
              </label>
              <textarea
                required
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe claramente la situación para que la administración pueda intervenir..."
                className="w-full p-2.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 text-stone-600 hover:text-stone-900 font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!details.trim()}
                className="py-2 px-4 bg-stone-900 text-white font-bold rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors"
              >
                Enviar reporte
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
