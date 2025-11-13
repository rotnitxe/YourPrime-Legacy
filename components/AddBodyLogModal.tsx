// components/AddBodyLogModal.tsx
import React, { useState } from 'react';
import { BodyProgressLog, Settings } from '../types';
import { takePicture } from '../services/cameraService';
import { optimizeImage } from '../services/imageService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { SaveIcon, CameraIcon, TrashIcon } from './icons';

interface AddBodyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: BodyProgressLog) => void;
  settings: Settings;
}

const PREDEFINED_MEASUREMENTS = ["Pecho", "Cintura", "Cadera", "Bíceps (Izq)", "Bíceps (Der)", "Muslo (Izq)", "Muslo (Der)"];

const AddBodyLogModal: React.FC<AddBodyLogModalProps> = ({ isOpen, onClose, onSave, settings }) => {
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [measurements, setMeasurements] = useState<{ [key: string]: number }>({});

  const handleTakePhoto = async () => {
    if (photos.length >= 4) {
      alert("Puedes añadir un máximo de 4 fotos por registro.");
      return;
    }
    const photoDataUrl = await takePicture();
    if (photoDataUrl) {
      const optimizedPhoto = await optimizeImage(photoDataUrl);
      setPhotos(prev => [...prev, optimizedPhoto]);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleMeasurementChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    setMeasurements(prev => ({
      ...prev,
      [key]: isNaN(numValue) ? 0 : numValue,
    }));
  };

  const handleSave = () => {
    if (!weight) {
      alert("El peso es un campo obligatorio.");
      return;
    }
    const finalMeasurements = Object.entries(measurements).reduce((acc, [key, value]) => {
        if (typeof value === 'number' && value > 0) {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, number>);

    const newLog: BodyProgressLog = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      weight: parseFloat(weight),
      bodyFatPercentage: bodyFat ? parseFloat(bodyFat) : undefined,
      photos: photos.length > 0 ? photos : undefined,
      measurements: Object.keys(finalMeasurements).length > 0 ? finalMeasurements : undefined,
    };

    onSave(newLog);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Registro Corporal">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Peso ({settings.weightUnit}) *</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-center"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">% Grasa Corporal</label>
            <input
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={e => setBodyFat(e.target.value)}
              className="w-full bg-slate-800 border-slate-700 rounded-md p-2 text-center"
            />
          </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Fotos de Progreso</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square group">
                        <img src={photo} alt={`Progreso ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                        <button onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <TrashIcon size={14} />
                        </button>
                    </div>
                ))}
                {photos.length < 4 && (
                    <button onClick={handleTakePhoto} className="aspect-square flex flex-col items-center justify-center bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-md hover:border-slate-500 hover:bg-slate-800 transition-colors">
                        <CameraIcon className="text-slate-400 mb-1" />
                        <span className="text-xs text-slate-400">Añadir Foto</span>
                    </button>
                )}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Medidas (cm)</label>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {PREDEFINED_MEASUREMENTS.map(name => (
                    <div key={name}>
                         <label className="block text-xs font-medium text-slate-400 mb-1">{name}</label>
                         <input
                            type="number"
                            step="0.1"
                            value={measurements[name] || ''}
                            onChange={e => handleMeasurementChange(name, e.target.value)}
                            className="w-full bg-slate-800 border-slate-700 rounded-md p-1.5 text-center"
                         />
                    </div>
                ))}
            </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
          <Button onClick={onClose} variant="secondary">Cancelar</Button>
          <Button onClick={handleSave}><SaveIcon size={16}/> Guardar Registro</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddBodyLogModal;
