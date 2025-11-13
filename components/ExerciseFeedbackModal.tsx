// components/ExerciseFeedbackModal.tsx
import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { CheckCircleIcon } from './icons';

interface ExerciseFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feedback: { jointLoad: number; technicalQuality: number; perceivedFatigue: number }) => void;
  exerciseName: string;
}

const ExerciseFeedbackModal: React.FC<ExerciseFeedbackModalProps> = ({ isOpen, onClose, onSave, exerciseName }) => {
  const [jointLoad, setJointLoad] = useState(5);
  const [technicalQuality, setTechnicalQuality] = useState(8);
  const [perceivedFatigue, setPerceivedFatigue] = useState(5);

  const handleSave = () => {
    onSave({ 
        jointLoad, 
        technicalQuality,
        perceivedFatigue,
    });
    // Reset state for next time
    setJointLoad(5);
    setTechnicalQuality(8);
    setPerceivedFatigue(5);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Feedback para: ${exerciseName}`}>
      <div className="space-y-6 p-2">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Carga Articular (1-Baja, 10-Alta)</label>
          <input type="range" min="1" max="10" value={jointLoad} onChange={(e) => setJointLoad(parseInt(e.target.value))} className="w-full" />
          <p className="text-center font-bold text-lg">{jointLoad}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Calidad Técnica (1-Mala, 10-Perfecta)</label>
          <input type="range" min="1" max="10" value={technicalQuality} onChange={(e) => setTechnicalQuality(parseInt(e.target.value))} className="w-full" />
          <p className="text-center font-bold text-lg">{technicalQuality}</p>
        </div>
         <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Fatiga Percibida del Ejercicio (1-Baja, 10-Alta)</label>
          <input type="range" min="1" max="10" value={perceivedFatigue} onChange={(e) => setPerceivedFatigue(parseInt(e.target.value))} className="w-full" />
          <p className="text-center font-bold text-lg">{perceivedFatigue}</p>
        </div>
        <div className="flex justify-end pt-4 border-t border-border-color">
          <Button onClick={handleSave} variant="primary" className="w-full !py-3 !text-base">
            <CheckCircleIcon size={20}/> Guardar Feedback y Continuar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExerciseFeedbackModal;