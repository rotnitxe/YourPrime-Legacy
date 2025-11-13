// components/FinishWorkoutModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { DISCOMFORT_LIST } from '../data/discomfortList';
import { CheckCircleIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface FinishWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: (notes?: string, discomforts?: string[], fatigueLevel?: number, mentalClarity?: number, durationInMinutes?: number, logDate?: string) => void;
  mode?: 'live' | 'log';
  improvementIndex?: { percent: number; direction: 'up' | 'down' | 'neutral' } | null;
  initialDurationInSeconds?: number;
}

const FinishWorkoutModal: React.FC<FinishWorkoutModalProps> = ({ isOpen, onClose, onFinish, mode = 'live', improvementIndex, initialDurationInSeconds }) => {
  const [fatigueLevel, setFatigueLevel] = useState(5);
  const [mentalClarity, setMentalClarity] = useState(5);
  const [selectedDiscomforts, setSelectedDiscomforts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const prevIsOpen = useRef(isOpen);


  useEffect(() => {
    // Only set initial values when the modal opens
    if (isOpen && !prevIsOpen.current) {
      if (initialDurationInSeconds) {
        setDurationInMinutes(Math.round(initialDurationInSeconds / 60).toString());
      }
      setLogDate(new Date().toISOString().split('T')[0]);
    }
    
    // Reset state when closing
    if (!isOpen && prevIsOpen.current) {
      setFatigueLevel(5);
      setMentalClarity(5);
      setSelectedDiscomforts([]);
      setNotes('');
      setDurationInMinutes('');
    }
    
    prevIsOpen.current = isOpen;
  }, [isOpen, initialDurationInSeconds]);


  const handleFinish = () => {
    const durationNum = durationInMinutes ? parseInt(durationInMinutes, 10) : undefined;
    if (mode === 'log' && (!durationNum || durationNum <= 0)) {
        alert("Por favor, introduce una duración válida en minutos.");
        return;
    }

    onFinish(notes, selectedDiscomforts.length > 0 ? selectedDiscomforts : undefined, fatigueLevel, mentalClarity, durationNum, logDate);
  };
  
  const toggleDiscomfort = (discomfort: string) => {
    setSelectedDiscomforts(prev => 
      prev.includes(discomfort) ? prev.filter(d => d !== discomfort) : [...prev, discomfort]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Sesión">
      <div className="space-y-6 p-2">
        {improvementIndex && mode === 'live' && (
             <div className="text-center p-3 rounded-lg bg-slate-900/50">
                <p className="text-sm font-semibold text-slate-300">Índice de Mejora vs Última Sesión</p>
                 <p className={`text-3xl font-bold flex items-center justify-center gap-1 ${
                    improvementIndex.direction === 'up' ? 'text-green-400' : improvementIndex.direction === 'down' ? 'text-red-400' : 'text-sky-400'
                }`}>
                    {improvementIndex.direction === 'up' && <ArrowUpIcon size={24} />}
                    {improvementIndex.direction === 'down' && <ArrowDownIcon size={24} />}
                    {improvementIndex.percent > 0 ? '+' : ''}{improvementIndex.percent}%
                </p>
             </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duración (minutos) *</label>
                <input 
                    type="number" 
                    value={durationInMinutes} 
                    onChange={(e) => setDurationInMinutes(e.target.value)} 
                    className="w-full bg-panel-color-light border border-border-color rounded-md p-2"
                    placeholder="Ej: 60"
                />
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Fecha</label>
                <input 
                    type="date" 
                    value={logDate} 
                    onChange={(e) => setLogDate(e.target.value)} 
                    className="w-full bg-panel-color-light border border-border-color rounded-md p-2"
                />
            </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Fatiga General (1-Bajo, 10-Máximo)</label>
          <input type="range" min="1" max="10" value={fatigueLevel} onChange={(e) => setFatigueLevel(parseInt(e.target.value))} className="w-full" />
          <p className="text-center font-bold text-lg">{fatigueLevel}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Claridad Mental (1-Bajo, 10-Alto)</label>
          <input type="range" min="1" max="10" value={mentalClarity} onChange={(e) => setMentalClarity(parseInt(e.target.value))} className="w-full" />
          <p className="text-center font-bold text-lg">{mentalClarity}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Molestias (opcional)</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto bg-slate-900/50 p-2 rounded-md">
            {DISCOMFORT_LIST.map(d => (
              <button key={d} onClick={() => toggleDiscomfort(d)} className={`px-2 py-1 text-xs rounded-full border transition-colors ${selectedDiscomforts.includes(d) ? 'bg-danger-color/30 border-danger-color text-white' : 'bg-panel-color-light border-border-color text-slate-300'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notas (opcional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full bg-panel-color-light border border-border-color rounded-md p-2"/>
        </div>
        <div className="flex justify-end pt-4 border-t border-border-color">
          <Button onClick={handleFinish} variant="primary" className="w-full !py-3 !text-base">
            <CheckCircleIcon size={20}/> Confirmar y Finalizar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default FinishWorkoutModal;