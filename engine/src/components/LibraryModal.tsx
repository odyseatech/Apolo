import React from 'react';
import { LIBRARY_MODELS, ModelItemId } from '../types/library';
import {
  Layers,
  X,
  Check,
  Cpu,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelId: ModelItemId;
  onSelectModel: (id: ModelItemId) => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  activeModelId,
  onSelectModel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-3xl bg-[#0e0e4b]/85 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,100,0.7)] backdrop-blur-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/15 shadow-inner">
              <Layers className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Biblioteca de Modelos 3D Interactivos
              </h2>
              <p className="text-xs text-neutral-300">
                Selecciona una obra de ingeniería mecánica o aeroespacial para explorar en tiempo real.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {LIBRARY_MODELS.map((item) => {
            const isSelected = activeModelId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectModel(item.id);
                  onClose();
                }}
                className={`group relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-white/20 border-white shadow-[0_0_30px_rgba(56,189,248,0.3)] ring-2 ring-white'
                    : 'bg-white/[0.06] border-white/10 hover:bg-white/[0.14] hover:border-white/25 hover:scale-[1.01]'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-white bg-emerald-500/80 px-2.5 py-0.5 rounded-full shadow-sm">
                        <Check className="w-3.5 h-3.5" /> En Pantalla
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Specs Pill List */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                  {item.specs.map((spec, i) => (
                    <div key={i} className="bg-black/25 p-2 rounded-xl border border-white/5">
                      <div className="text-[9px] text-neutral-400 uppercase">{spec.label}</div>
                      <div className="text-xs font-mono font-bold text-white truncate mt-0.5">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {item.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:translate-x-1 transition-transform">
                    <span>{isSelected ? 'Explorando' : 'Cargar Modelo'}</span>
                    <ArrowRight className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
