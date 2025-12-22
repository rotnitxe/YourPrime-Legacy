// components/AddNutritionLogModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { NutritionLog, FoodItem, Settings } from '../types';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { SparklesIcon, SaveIcon, CameraIcon } from './icons';
import { FOOD_DATABASE } from '../data/foodDatabase';
import { getNutritionalInfo, analyzeMealPhoto } from '../services/aiService';
import { takePicture } from '../services/cameraService';


interface AddNutritionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: NutritionLog) => void;
  isOnline: boolean;
  settings: Settings;
}

const AddNutritionLogModal: React.FC<AddNutritionLogModalProps> = ({ isOpen, onClose, onSave, isOnline, settings }) => {
  const [logMode, setLogMode] = useState<'search' | 'describe' | 'photo'>('search');
  const [mealType, setMealType] = useState<NutritionLog['mealType']>('lunch');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for 'search' mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Omit<FoodItem, 'id'> | null>(null);
  const [quantity, setQuantity] = useState('100');
  
  // State for 'describe' and 'photo' mode
  const [aiDescription, setAiDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<Omit<FoodItem, 'id'> | null>(null);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when modal opens/closes
    setLogMode('search');
    setSearchQuery('');
    setSelectedFood(null);
    setQuantity('100');
    setAiDescription('');
    setPhoto(null);
    setAiResult(null);
    setError(null);
    setIsAiLoading(false);
    setLogDate(new Date().toISOString().split('T')[0]);
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    return FOOD_DATABASE.filter(food => 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      food.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelectFood = (food: Omit<FoodItem, 'id'>) => {
    setSelectedFood(food);
    setSearchQuery(food.brand ? `${food.name} (${food.brand})` : food.name);
  };

  const handleAiDescribeSearch = async () => {
    if (!aiDescription || !isOnline) return;
    setIsAiLoading(true);
    setError(null);
    setAiResult(null);
    try {
      const result = await getNutritionalInfo(aiDescription, settings);
      if (result && result.name) {
          const resultWithServing: Omit<FoodItem, 'id'> = {
            ...result,
            servingSize: 1,
            servingUnit: 'unidad',
          };
          setAiResult(resultWithServing);
      } else {
          setError('No se pudo encontrar información para esa descripción.');
      }
    } catch (err: any) {
        setError(err.message || 'Error al analizar la descripción con IA.');
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    const imageDataUrl = await takePicture();
    if (imageDataUrl) {
      setPhoto(imageDataUrl);
      setAiResult(null);
      setError(null);
      setIsAiLoading(true);
      try {
        const base64Data = imageDataUrl.split(',')[1];
        const result = await analyzeMealPhoto(base64Data, settings);
        if (result && result.name) {
             const resultWithServing: Omit<FoodItem, 'id'> = {
                ...result,
                servingSize: 1,
                servingUnit: 'unidad',
             };
             setAiResult(resultWithServing);
        } else {
            setError('La IA no pudo analizar esta foto. Intenta con una imagen más clara.');
        }
      } catch (err: any) {
        setError(err.message || 'Error al analizar la foto con IA.');
      } finally {
        setIsAiLoading(false);
      }
    }
  };


  const handleSave = () => {
    let newLog: NutritionLog;
    const date = new Date(logDate + 'T00:00:00');

    if (logMode === 'search' && selectedFood) {
        const ratio = parseFloat(quantity) / selectedFood.servingSize;
        newLog = {
            id: crypto.randomUUID(), date: date.toISOString(), mealType,
            description: `${selectedFood.brand ? `${selectedFood.name} (${selectedFood.brand})` : selectedFood.name} - ${quantity}${selectedFood.servingUnit}`,
            calories: Math.round((selectedFood.calories || 0) * ratio),
            protein: Math.round(((selectedFood.protein || 0) * ratio) * 10) / 10,
            carbs: Math.round(((selectedFood.carbs || 0) * ratio) * 10) / 10,
            fats: Math.round(((selectedFood.fats || 0) * ratio) * 10) / 10,
        };
    } else if ((logMode === 'describe' || logMode === 'photo') && aiResult) {
        newLog = {
            id: crypto.randomUUID(), date: date.toISOString(), mealType,
            description: logMode === 'photo' ? `Comida analizada por foto: ${aiResult.name}` : aiDescription,
            calories: Math.round(aiResult.calories || 0),
            protein: Math.round((aiResult.protein || 0) * 10) / 10,
            carbs: Math.round((aiResult.carbs || 0) * 10) / 10,
            fats: Math.round((aiResult.fats || 0) * 10) / 10,
            photo: logMode === 'photo' ? photo || undefined : undefined,
        };
    } else {
        alert("Por favor, completa la información para registrar la comida.");
        return;
    }
    onSave(newLog);
  };
  
  const calculatedMacros = useMemo(() => {
      if (!selectedFood || !quantity) return null;
      const ratio = parseFloat(quantity) / selectedFood.servingSize;
      return {
          calories: (selectedFood.calories || 0) * ratio,
          protein: (selectedFood.protein || 0) * ratio,
          carbs: (selectedFood.carbs || 0) * ratio,
          fats: (selectedFood.fats || 0) * ratio,
      }
  }, [selectedFood, quantity]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Registro de Comida">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Comida</label>
              <select value={mealType} onChange={e => setMealType(e.target.value as NutritionLog['mealType'])} className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2">
                <option value="breakfast">Desayuno</option>
                <option value="lunch">Almuerzo</option>
                <option value="dinner">Cena</option>
                <option value="snack">Snack</option>
              </select>
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Fecha</label>
              <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2"/>
            </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-full text-sm">
            <button onClick={() => setLogMode('search')} className={`flex-1 py-1 rounded-full ${logMode === 'search' ? 'bg-primary-color text-white' : ''}`}>Buscar</button>
            <button onClick={() => setLogMode('describe')} disabled={!isOnline} className={`flex-1 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${logMode === 'describe' ? 'bg-primary-color text-white' : ''}`}>Describir</button>
            <button onClick={() => setLogMode('photo')} disabled={!isOnline} className={`flex-1 py-1 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${logMode === 'photo' ? 'bg-primary-color text-white' : ''}`}>Foto IA</button>
        </div>
        
        {logMode === 'search' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <label className="block text-sm font-medium text-slate-300 mb-1">Buscar en Base de Datos</label>
              <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSelectedFood(null); }} placeholder="Ej: Pechuga de pollo, galletas McKay..." className="w-full bg-slate-800 border border-slate-700 rounded-md px-4 py-2" />
              {searchQuery.length >= 2 && !selectedFood && (
                <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((food, index) => (
                    <div key={`${food.name}-${index}`} onClick={() => handleSelectFood(food)} className="p-3 cursor-pointer hover:bg-[var(--primary-color-700)]">
                      <p className="font-semibold text-white">{food.name}</p>
                      <p className="text-xs text-slate-400">{food.brand || 'Alimento genérico'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {selectedFood && (
              <div className="bg-slate-900/50 p-4 rounded-lg space-y-4 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="flex-grow">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Cantidad</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full bg-slate-800 border-slate-700 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Unidad</label>
                    <p className="p-2 text-slate-300">{selectedFood.servingUnit}</p>
                  </div>
                </div>
                {calculatedMacros && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div><p className="text-xs text-slate-400">Calorías</p><p className="font-bold text-lg text-white">{Math.round(calculatedMacros.calories)}</p></div>
                        <div><p className="text-xs text-blue-400">Proteína</p><p className="font-bold text-lg text-white">{calculatedMacros.protein.toFixed(1)}g</p></div>
                        <div><p className="text-xs text-orange-400">Carbs</p><p className="font-bold text-lg text-white">{calculatedMacros.carbs.toFixed(1)}g</p></div>
                        <div><p className="text-xs text-yellow-400">Grasas</p><p className="font-bold text-lg text-white">{calculatedMacros.fats.toFixed(1)}g</p></div>
                    </div>
                )}
              </div>
            )}
          </div>
        ) : logMode === 'describe' ? (
           <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Describe tu comida</label>
                <textarea value={aiDescription} onChange={e => setAiDescription(e.target.value)} rows={3} placeholder="Ej: Un plato de porotos con longaniza y una ensalada de tomate con cebolla." className="w-full bg-slate-800 border-slate-700 rounded-md p-2" />
              </div>
              <Button onClick={handleAiDescribeSearch} isLoading={isAiLoading} disabled={!aiDescription || !isOnline} className="w-full"><SparklesIcon size={16}/> Analizar Descripción</Button>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
           </div>
        ) : (
            <div className="space-y-4 animate-fade-in">
                {!photo && (
                    <Button onClick={handleTakePhoto} isLoading={isAiLoading} disabled={!isOnline} className="w-full !py-4">
                        <CameraIcon size={20}/> Tomar Foto
                    </Button>
                )}
                {photo && (
                    <div className="text-center">
                        <img src={photo} alt="Comida" className="rounded-lg max-h-48 mx-auto" />
                    </div>
                )}
            </div>
        )}

        {(logMode === 'describe' || logMode === 'photo') && isAiLoading && (
            <div className="text-center p-4 text-slate-400">Analizando...</div>
        )}

        {(logMode === 'describe' || logMode === 'photo') && aiResult && !isAiLoading && (
            <div className="bg-slate-900/50 p-4 rounded-lg space-y-2 animate-fade-in">
                <p className="text-sm font-semibold text-slate-200">Resultado del Análisis para: <span className="text-primary-color">{aiResult.name}</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                    <div><p className="text-xs text-slate-400">Calorías</p><p className="font-bold text-lg text-white">{Math.round(aiResult.calories || 0)}</p></div>
                    <div><p className="text-xs text-blue-400">Proteína</p><p className="font-bold text-lg text-white">{(aiResult.protein || 0).toFixed(1)}g</p></div>
                    <div><p className="text-xs text-orange-400">Carbs</p><p className="font-bold text-lg text-white">{(aiResult.carbs || 0).toFixed(1)}g</p></div>
                    <div><p className="text-xs text-yellow-400">Grasas</p><p className="font-bold text-lg text-white">{(aiResult.fats || 0).toFixed(1)}g</p></div>
                </div>
            </div>
        )}

         <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <Button onClick={onClose} variant="secondary">Cancelar</Button>
            <Button onClick={handleSave} disabled={(logMode === 'search' && !selectedFood) || ((logMode === 'describe' || logMode === 'photo') && !aiResult)}><SaveIcon size={16}/> Guardar Registro</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddNutritionLogModal;