// components/SmartMealPlannerView.tsx
import React, { useState, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../contexts/AppContext';
import { PantryItem } from '../types';
import { getNutritionalInfoForPantryItem, generateMealSuggestion } from '../services/aiService';
import Card from './ui/Card';
import Button from './ui/Button';
import { ArrowLeftIcon, PlusIcon, TrashIcon, SparklesIcon, SaveIcon, BrainIcon } from './icons';
import SkeletonLoader from './ui/SkeletonLoader';

const SmartMealPlannerView: React.FC = () => {
    const { pantryItems, settings, isOnline, nutritionLogs } = useAppState();
    const { setPantryItems, handleBack, addToast, handleSaveNutritionLog } = useAppDispatch();
    
    const [newItemName, setNewItemName] = useState('');
    const [newItem, setNewItem] = useState<Omit<PantryItem, 'id'>>({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0, unit: 'g', currentQuantity: 0 });
    const [suggestions, setSuggestions] = useState<any[] | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleEstimateMacros = async () => {
        if (!newItemName.trim() || !isOnline) return;
        setIsEstimating(true);
        try {
            const result = await getNutritionalInfoForPantryItem(newItemName, settings);
            setNewItem(prev => ({
                ...prev,
                name: newItemName,
                calories: result.calories,
                protein: result.protein,
                carbs: result.carbs,
                fats: result.fats,
            }));
        } catch (e) {
            addToast("No se pudo estimar la información nutricional.", "danger");
        } finally {
            setIsEstimating(false);
        }
    };
    
    const handleAddItem = () => {
        if (!newItem.name.trim() || newItem.calories <= 0) {
            addToast("El nombre y las calorías son obligatorios.", "danger");
            return;
        }
        const item: PantryItem = { id: crypto.randomUUID(), ...newItem };
        setPantryItems(prev => [...prev, item]);
        setNewItemName('');
        setNewItem({ name: '', calories: 0, protein: 0, carbs: 0, fats: 0, unit: 'g', currentQuantity: 0 });
    };

    const handleRemoveItem = (id: string) => {
        setPantryItems(prev => prev.filter(item => item.id !== id));
    };
    
    const handleUpdateItem = (id: string, field: keyof Omit<PantryItem, 'id'|'name'>, value: string) => {
        setPantryItems(prev => prev.map(item => item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item));
    };

    const handleGenerateSuggestion = async () => {
        if (!isOnline || pantryItems.length === 0) return;
        setIsGenerating(true);
        setSuggestions(null);

        const todayStr = new Date().toISOString().split('T')[0];
        const todaysLogs = nutritionLogs.filter(log => log.date.startsWith(todayStr));
        const dailyTotals = todaysLogs.reduce((acc, log) => {
            acc.calories += log.calories || 0;
            acc.protein += log.protein || 0;
            acc.carbs += log.carbs || 0;
            acc.fats += log.fats || 0;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

        const remainingMacros = {
            calories: (settings.dailyCalorieGoal || 0) - dailyTotals.calories,
            protein: (settings.dailyProteinGoal || 0) - dailyTotals.protein,
            carbs: (settings.dailyCarbGoal || 0) - dailyTotals.carbs,
            fats: (settings.dailyFatGoal || 0) - dailyTotals.fats,
        };
        
        if (remainingMacros.calories <= 0 && remainingMacros.protein <= 0) {
            addToast("¡Ya has cumplido tus metas de calorías y proteínas para hoy!", "success");
            setIsGenerating(false);
            return;
        }

        try {
            const result = await generateMealSuggestion(pantryItems, remainingMacros, settings);
            setSuggestions(result.suggestions);
        } catch (e) {
            addToast("No se pudieron generar sugerencias.", "danger");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleAddSuggestionAsLog = (suggestion: any) => {
        const description = suggestion.foods.map((f: any) => `${f.grams}g ${f.name}`).join(', ');
        const newLog = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            mealType: 'snack' as const,
            description: `Sugerencia IA: ${suggestion.mealName} (${description})`,
            calories: suggestion.totalMacros.calories,
            protein: suggestion.totalMacros.protein,
            carbs: suggestion.totalMacros.carbs,
            fats: suggestion.totalMacros.fats,
        };
        handleSaveNutritionLog(newLog);
        addToast(`Comida "${suggestion.mealName}" registrada.`, 'success');
    };

    return (
        <div className="pt-[65px] pb-20 animate-fade-in">
             <header className="flex items-center gap-4 mb-6 -mx-4 px-4">
                <button onClick={handleBack} className="p-2 text-slate-300"><ArrowLeftIcon /></button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Planificador Inteligente</h1>
                    <p className="text-slate-400 text-sm">Gestiona tu despensa y obtén sugerencias de comidas.</p>
                </div>
            </header>
            <div className="space-y-6">
                <Card>
                    <h2 className="text-xl font-bold text-white mb-3">Tu Despensa</h2>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                        {pantryItems.map(item => (
                            <details key={item.id} className="glass-card-nested !p-2">
                                <summary className="flex justify-between items-center cursor-pointer">
                                    <span>{item.name}</span>
                                    <button onClick={() => handleRemoveItem(item.id)}><TrashIcon size={16} className="text-slate-500 hover:text-red-400"/></button>
                                </summary>
                                <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                                    <div><label>Cal</label><input type="number" value={item.calories} onChange={e => handleUpdateItem(item.id, 'calories', e.target.value)} className="w-full text-center" /></div>
                                    <div><label>Prot</label><input type="number" value={item.protein} onChange={e => handleUpdateItem(item.id, 'protein', e.target.value)} className="w-full text-center" /></div>
                                    <div><label>Carb</label><input type="number" value={item.carbs} onChange={e => handleUpdateItem(item.id, 'carbs', e.target.value)} className="w-full text-center" /></div>
                                    <div><label>Gras</label><input type="number" value={item.fats} onChange={e => handleUpdateItem(item.id, 'fats', e.target.value)} className="w-full text-center" /></div>
                                </div>
                            </details>
                        ))}
                         {pantryItems.length === 0 && <p className="text-center text-slate-500 py-4">Tu despensa está vacía.</p>}
                    </div>
                    <div className="space-y-3 pt-3 border-t border-slate-700">
                        <div className="flex gap-2">
                             <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Nombre del nuevo alimento" className="flex-grow"/>
                             <Button onClick={handleEstimateMacros} isLoading={isEstimating} disabled={!isOnline || isEstimating} variant="secondary" className="!px-3"><BrainIcon size={16}/></Button>
                        </div>
                        {newItem.calories > 0 && (
                             <div className="grid grid-cols-4 gap-2 text-xs animate-fade-in">
                                <div><label>Cal</label><input type="number" value={newItem.calories} onChange={e => setNewItem(p => ({...p, calories: parseFloat(e.target.value) || 0}))} className="w-full text-center" /></div>
                                <div><label>Prot</label><input type="number" value={newItem.protein} onChange={e => setNewItem(p => ({...p, protein: parseFloat(e.target.value) || 0}))} className="w-full text-center" /></div>
                                <div><label>Carb</label><input type="number" value={newItem.carbs} onChange={e => setNewItem(p => ({...p, carbs: parseFloat(e.target.value) || 0}))} className="w-full text-center" /></div>
                                <div><label>Gras</label><input type="number" value={newItem.fats} onChange={e => setNewItem(p => ({...p, fats: parseFloat(e.target.value) || 0}))} className="w-full text-center" /></div>
                            </div>
                        )}
                        <Button onClick={handleAddItem} className="w-full"><PlusIcon/> Añadir a Despensa</Button>
                    </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-white mb-3">Sugerencias de Comidas</h2>
                    <Button onClick={handleGenerateSuggestion} isLoading={isGenerating} disabled={!isOnline || isGenerating || pantryItems.length === 0} className="w-full">
                        <SparklesIcon/> Generar Sugerencias para Hoy
                    </Button>
                    {isGenerating && <SkeletonLoader className="mt-4" lines={4} />}
                    {suggestions && (
                        <div className="space-y-3 mt-4">
                            {suggestions.map((sug, i) => (
                                <div key={i} className="glass-card-nested p-3">
                                    <h4 className="font-semibold text-primary-color">{sug.mealName}</h4>
                                    <ul className="text-sm text-slate-300 list-disc list-inside">
                                        {sug.foods.map((food: any, j: number) => <li key={j}>{food.grams}g de {food.name}</li>)}
                                    </ul>
                                    <div className="text-xs text-slate-400 mt-2">Total: {sug.totalMacros.calories}kcal, {sug.totalMacros.protein}g Prot</div>
                                    <Button onClick={() => handleAddSuggestionAsLog(sug)} variant="secondary" className="!text-xs !py-1 w-full mt-2">Registrar Comida</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SmartMealPlannerView;