import React from 'react';
import Card from './ui/Card';
import { SparklesIcon, PencilIcon } from './icons';

interface ProgramTypeSelectorProps {
  onSelectSimple: () => void;
  onSelectAdvanced: () => void;
}

const ProgramTypeSelector: React.FC<ProgramTypeSelectorProps> = ({ onSelectSimple, onSelectAdvanced }) => {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h2 className="text-3xl font-bold mb-6 text-center text-slate-100">¿Qué tipo de programa quieres crear?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card onClick={onSelectSimple} className="cursor-pointer hover:border-[var(--primary-color-500)] transition-all duration-300 transform hover:scale-105 border-2 border-transparent">
          <div className="text-center p-4">
            <PencilIcon size={48} className="mx-auto mb-4 text-[var(--primary-color-400)]" />
            <h3 className="text-2xl font-bold text-white">Creación Simple</h3>
            <p className="text-slate-400 mt-2">Define tus propias sesiones y ejercicios manualmente o con ayuda de la IA para una sesión específica.</p>
          </div>
        </Card>
        <Card onClick={onSelectAdvanced} className="cursor-pointer hover:border-[var(--primary-color-500)] transition-all duration-300 transform hover:scale-105 border-2 border-transparent">
          <div className="text-center p-4">
            <SparklesIcon size={48} className="mx-auto mb-4 text-[var(--primary-color-400)]" />
            <h3 className="text-2xl font-bold text-white">Avanzado con Periodización</h3>
            <p className="text-slate-400 mt-2">Estructura un plan a largo plazo con mesociclos, microciclos y la ayuda de un coach de IA especializado.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProgramTypeSelector;