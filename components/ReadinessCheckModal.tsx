// components/ReadinessCheckModal.tsx
import React, { useState } from 'react';
import Button from './ui/Button';

interface ReadinessData {
  sleepQuality: number;
  stressLevel: number;
  doms: number;
  motivation: number;
}

interface ReadinessCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (data: ReadinessData) => void;
}

const Slider: React.FC<{ label: string; value: number; onChange: (value: number) => void; minLabel: string; maxLabel: string; }> = ({ label, value, onChange, minLabel, maxLabel }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="flex items-center gap-3">
            <input type="range" min="1" max="5" value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full" />
            <span className="font-bold text-lg w-8 text-center">{value}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

const ReadinessCheckModal: React.FC<ReadinessCheckModalProps> = ({ isOpen, onClose, onContinue }) => {
    const [sleepQuality, setSleepQuality] = useState(3);
    const [stressLevel, setStressLevel] = useState(3);
    const [doms, setDoms] = useState(3);
    const [motivation, setMotivation] = useState(3);

    const handleContinue = () => {
        onContinue({ sleepQuality, stressLevel, doms, motivation });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="bottom-sheet-backdrop" onClick={onClose} />
            <div className="bottom-sheet-content open !h-auto max-h-[90vh]">
                <div className="bottom-sheet-grabber" />
                <header className="flex-shrink-0 p-4 text-center">
                    <h2 className="text-xl font-bold text-white">¿Cómo te sientes hoy?</h2>
                    <p className="text-sm text-slate-400">Tu feedback ayuda a adaptar el entrenamiento.</p>
                </header>
                <div className="overflow-y-auto px-4 pb-4 space-y-6">
                    <Slider label="Calidad del Sueño" value={sleepQuality} onChange={setSleepQuality} minLabel="Mala" maxLabel="Excelente" />
                    <Slider label="Nivel de Estrés" value={stressLevel} onChange={setStressLevel} minLabel="Bajo" maxLabel="Alto" />
                    <Slider label="Dolor Muscular (DOMS)" value={doms} onChange={setDoms} minLabel="Nulo" maxLabel="Extremo" />
                    <Slider label="Motivación" value={motivation} onChange={setMotivation} minLabel="Baja" maxLabel="Alta" />
                </div>
                <footer className="p-4 bg-slate-900 border-t border-slate-700/50 flex-shrink-0">
                    <Button onClick={handleContinue} className="w-full !py-3">Continuar al Entrenamiento</Button>
                </footer>
            </div>
        </>
    );
};

export default ReadinessCheckModal;