import React, { useState } from 'react';
import { Info, RotateCcw, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const { resetDemoData } = useApp();

  if (dismissed) return null;

  return (
    <div className="bg-amber-50/90 border-b border-amber-200 text-amber-950 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-800 shrink-0" />
          <p className="leading-snug">
            <span className="font-semibold text-amber-900">Versión preliminar con datos de demostración:</span> Los perfiles, servicios y reseñas mostrados son ficticios con fines ilustrativos. La plataforma no procesa transacciones bancarias reales ni retiene fondos automáticamente.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => {
              if (window.confirm('¿Deseas restablecer los datos de la demo a su estado inicial?')) {
                resetDemoData();
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer demo</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700 hover:text-amber-950 p-0.5 rounded focus:outline-none"
            aria-label="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
