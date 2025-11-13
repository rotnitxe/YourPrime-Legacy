// components/PhysicalProgress.tsx
// FIX: Imported `useEffect` from React to resolve 'Cannot find name' errors.
import React, { useState, useMemo, useEffect } from 'react';
import { BodyProgressLog, NutritionLog, Settings, Program, WorkoutLog, View } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import BodyWeightChart from './BodyWeightChart';
import { PlusIcon, SparklesIcon, TargetIcon, SaveIcon, BodyIcon } from './icons';
import { InfoTooltip } from './ui/InfoTooltip';
import DailyProgressView from './DailyProgressView';
import PersonalRecordsView from './PersonalRecordsView';
import useAchievements from '../hooks/useAchievements';
import AchievementsView from './AchievementsView';
import WeeklyBurnSummary from './WeeklyBurnSummary';
import BodyMeasurementsChart from './BodyMeasurementsChart';
import { useAppState } from '../contexts/AppContext';
import { generateWeightProjection } from '../services/aiService';
import SkeletonLoader from './ui/SkeletonLoader';

const WeightProjectionWidget: React.FC = () => {
    const { nutritionLogs, bodyProgress, settings, isOnline } = useAppState();
    const [projection, setProjection] = useState<{ projection: string; summary: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculationData = useMemo(() => {
        const targetWeight = settings.userVitals?.targetWeight;
        const userWeight = settings.userVitals?.weight;
        if (!targetWeight || !userWeight || nutritionLogs.length < 7) {
            return null;
        }

        const recentLogs = nutritionLogs.slice(-30);
        const avgIntake = recentLogs.reduce((sum, log) => sum + (log.calories || 0), 0) / recentLogs.length;

        const { age, height, gender, activityLevel } = settings.userVitals;
        if (!age || !height || !gender || !activityLevel) return null;

        let bmr = (10 * userWeight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
        const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        const tdee = bmr * activityMultipliers[activityLevel];

        const weightHistory = bodyProgress.slice(-10).map(log => ({ date: log.date, weight: log.weight })).filter(log => log.weight);

        return { avgIntake, tdee, weightHistory, targetWeight };
    }, [nutritionLogs, bodyProgress, settings.userVitals]);

    const handleGenerate = async () => {
        if (!calculationData || !isOnline) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateWeightProjection(
                calculationData.avgIntake,
                calculationData.tdee,
                calculationData.weightHistory,
                calculationData.targetWeight,
                settings
            );
            setProjection(result);
        } catch (err: any) {
            setError(err.message || "Error al generar la proyección.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!calculationData) {
        return (
            <Card>
                <h3 className="text-xl font-bold mb-2">Proyección de Peso Corporal</h3>
                <p className="text-sm text-slate-400 text-center py-4">
                    Registra tus datos personales, tu peso objetivo y al menos 7 días de ingesta calórica en "Mis Objetivos" para activar esta función.
                </p>
            </Card>
        );
    }

    return (
        <Card>
            <h3 className="text-xl font-bold mb-3">Proyección de Peso Corporal</h3>
            {isLoading && <SkeletonLoader lines={3} />}
            {error && <p className="text-red-400 text-center">{error}</p>}
            {projection && (
                <div className="space-y-3 animate-fade-in">
                    <div className="glass-card-nested p-3 text-center">
                        <p className="font-bold text-lg text-primary-color">{projection.projection}</p>
                    </div>
                    <p className="text-sm text-slate-300 italic">"{projection.summary}"</p>
                </div>
            )}
            <Button onClick={handleGenerate} disabled={!isOnline || isLoading} isLoading={isLoading} className="w-full mt-4">
                <SparklesIcon /> {projection ? 'Recalcular Proyección' : 'Calcular Proyección'}
            </Button>
        </Card>
    );
};


interface ProgressGoalsProps {
    settings: Settings;
    onSettingsChange: (newSettings: Partial<Settings>) => void;
    progress: BodyProgressLog[];
}

const ProgressGoals: React.FC<ProgressGoalsProps> = ({ settings, onSettingsChange, progress }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    
    const initialManualGoals = {
        calories: settings.dailyCalorieGoal || 0,
        protein: settings.dailyProteinGoal || 0,
        carbs: settings.dailyCarbGoal || 0,
        fats: settings.dailyFatGoal || 0,
    };
    const [manualGoals, setManualGoals] = useState(initialManualGoals);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const ffmiData = useMemo(() => {
        const heightCm = localSettings.userVitals.height;
        if (!heightCm || heightCm <= 0) return null;

        const latestLogWithData = [...progress]
            .reverse()
            .find(log => log.weight && log.weight > 0 && log.bodyFatPercentage && log.bodyFatPercentage > 0);
        
        if (!latestLogWithData) return null;

        const weightKg = latestLogWithData.weight!;
        const bodyFatPercent = latestLogWithData.bodyFatPercentage!;
        const heightM = heightCm / 100;

        const leanBodyMass = weightKg * (1 - (bodyFatPercent / 100));
        const ffmi = leanBodyMass / (heightM * heightM);
        const normalizedFfmi = ffmi + 6.1 * (1.8 - heightM);

        let interpretation = 'Desconocido';
        if (normalizedFfmi < 18) interpretation = 'Por debajo del promedio';
        else if (normalizedFfmi < 20) interpretation = 'Promedio';
        else if (normalizedFfmi < 22) interpretation = 'Por encima del promedio';
        else if (normalizedFfmi < 24) interpretation = 'Musculoso';
        else if (normalizedFfmi < 26) interpretation = 'Muy Musculoso';
        else interpretation = 'Nivel Élite / Genética Superior';

        return {
            ffmi: ffmi.toFixed(1),
            normalizedFfmi: normalizedFfmi.toFixed(1),
            interpretation,
            leanBodyMass: leanBodyMass.toFixed(1)
        };
    }, [progress, localSettings.userVitals]);


    const calculatedGoals = useMemo(() => {
        const { age, weight, height, gender, activityLevel } = localSettings.userVitals;
        if (!age || !weight || !height || !gender || !activityLevel) {
            return null;
        }

        let bmr: number;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        const activityMultipliers = {
            sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
        };
        const tdee = bmr * activityMultipliers[activityLevel];

        let calorieGoal: number;
        switch (localSettings.calorieGoalObjective) {
            case 'deficit': calorieGoal = tdee - 500; break;
            case 'surplus': calorieGoal = tdee + 300; break;
            default: calorieGoal = tdee; break;
        }
        
        const proteinGrams = Math.round((calorieGoal * 0.40) / 4);
        const carbGrams = Math.round((calorieGoal * 0.40) / 4);
        const fatGrams = Math.round((calorieGoal * 0.20) / 9);

        return {
            bmr: Math.round(bmr), tdee: Math.round(tdee), calorieGoal: Math.round(calorieGoal),
            proteinGoal: proteinGrams, carbGoal: carbGrams, fatGoal: fatGrams,
        };
    }, [localSettings.userVitals, localSettings.calorieGoalObjective]);
    
    useEffect(() => {
        if (calculatedGoals) {
            setManualGoals({
                calories: calculatedGoals.calorieGoal, protein: calculatedGoals.proteinGoal,
                carbs: calculatedGoals.carbGoal, fats: calculatedGoals.fatGoal,
            });
        }
    }, [calculatedGoals]);

    const handleVitalsChange = <K extends keyof Settings['userVitals']>(key: K, value: Settings['userVitals'][K]) => {
        setLocalSettings(prev => ({ ...prev, userVitals: { ...prev.userVitals, [key]: value } }));
    };

    const handleMacroChange = (macro: 'protein' | 'carbs' | 'fats', value: string) => {
        const numValue = parseInt(value, 10) || 0;
        setManualGoals(prevGoals => {
            const newMacros = { ...prevGoals, [macro]: numValue };
            const newCalories = (newMacros.protein * 4) + (newMacros.carbs * 4) + (newMacros.fats * 9);
            return { ...newMacros, calories: Math.round(newCalories) };
        });
    };

    const handleCalorieChange = (value: string) => {
        const numValue = parseInt(value, 10) || 0;
        setManualGoals(prev => ({ ...prev, calories: numValue }));
    };

    const handleSave = () => {
        const newSettings = {
            ...localSettings,
            dailyCalorieGoal: manualGoals.calories,
            dailyProteinGoal: manualGoals.protein,
            dailyCarbGoal: manualGoals.carbs,
            dailyFatGoal: manualGoals.fats,
        };
        onSettingsChange(newSettings);
    };
    
    const hasChanges = useMemo(() => {
        return JSON.stringify(settings) !== JSON.stringify(localSettings) ||
               settings.dailyCalorieGoal !== manualGoals.calories ||
               settings.dailyProteinGoal !== manualGoals.protein ||
               settings.dailyCarbGoal !== manualGoals.carbs ||
               settings.dailyFatGoal !== manualGoals.fats;
    }, [settings, localSettings, manualGoals]);


    return (
        <div className="space-y-8">
            <Card>
                <h3 className="text-xl font-bold mb-4">Tus Datos</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Edad</label>
                        <input type="number" value={localSettings.userVitals.age || ''} onChange={e => handleVitalsChange('age', parseInt(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Altura (cm)</label>
                        <input type="number" value={localSettings.userVitals.height || ''} onChange={e => handleVitalsChange('height', parseInt(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Peso Actual ({settings.weightUnit})</label>
                        <input type="number" step="0.1" value={localSettings.userVitals.weight || ''} onChange={e => handleVitalsChange('weight', parseFloat(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded-md p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm text-slate-300 mb-1">Género</label>
                        <select value={localSettings.userVitals.gender || ''} onChange={e => handleVitalsChange('gender', e.target.value as any)} className="w-full bg-slate-800 border-slate-700 rounded-md p-2">
                            <option value="">Seleccionar...</option>
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                         <label className="block text-sm text-slate-300 mb-1">Nivel de Actividad</label>
                         <select value={localSettings.userVitals.activityLevel || ''} onChange={e => handleVitalsChange('activityLevel', e.target.value as any)} className="w-full bg-slate-800 border-slate-700 rounded-md p-2">
                             <option value="">Seleccionar...</option>
                             <option value="sedentary">Sedentario (poco o nada de ejercicio)</option>
                             <option value="light">Ligero (1-3 días/semana)</option>
                             <option value="moderate">Moderado (3-5 días/semana)</option>
                             <option value="active">Activo (6-7 días/semana)</option>
                             <option value="very_active">Muy Activo (trabajo físico + ejercicio)</option>
                         </select>
                    </div>
                </div>
            </Card>
            
             <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TargetIcon /> Tu Objetivo</h3>
                 <div className="space-y-4">
                    <div>
                         <label className="block text-sm text-slate-300 mb-1">Mi meta es...</label>
                        <div className="flex bg-slate-800 p-1 rounded-full">
                            <button onClick={() => setLocalSettings(p => ({...p, calorieGoalObjective: 'deficit'}))} className={`w-full py-1 rounded-full text-sm ${localSettings.calorieGoalObjective === 'deficit' ? 'bg-red-600' : ''}`}>Perder Peso</button>
                            <button onClick={() => setLocalSettings(p => ({...p, calorieGoalObjective: 'maintenance'}))} className={`w-full py-1 rounded-full text-sm ${localSettings.calorieGoalObjective === 'maintenance' ? 'bg-sky-600' : ''}`}>Mantener</button>
                            <button onClick={() => setLocalSettings(p => ({...p, calorieGoalObjective: 'surplus'}))} className={`w-full py-1 rounded-full text-sm ${localSettings.calorieGoalObjective === 'surplus' ? 'bg-green-600' : ''}`}>Ganar Músculo</button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Peso Objetivo ({settings.weightUnit})</label>
                        <input type="number" step="0.1" value={localSettings.userVitals.targetWeight || ''} onChange={e => handleVitalsChange('targetWeight', parseFloat(e.target.value))} className="w-full bg-slate-800 border-slate-700 rounded-md p-2"/>
                    </div>
                 </div>
            </Card>
            
            <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BodyIcon /> Tu Composición Corporal
                </h3>
                {ffmiData ? (
                    <div className="space-y-4">
                        <div className="text-center">
                            <label className="block text-sm text-slate-400 mb-1 flex items-center justify-center gap-1">
                                FFMI Normalizado
                                <InfoTooltip term="FFMI Normalizado" />
                            </label>
                            <p className="text-6xl font-black text-primary-color">{ffmiData.normalizedFfmi}</p>
                            <p className="font-semibold text-white">{ffmiData.interpretation}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                             <div className="text-center">
                                <label className="block text-xs text-slate-400">Masa Magra Estimada</label>
                                <p className="text-xl font-bold text-white">{ffmiData.leanBodyMass} kg</p>
                            </div>
                            <div className="text-center">
                                <label className="block text-xs text-slate-400">FFMI (No normalizado)</label>
                                <p className="text-xl font-bold text-white">{ffmiData.ffmi}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-slate-400">
                        <p>Introduce tu altura, y registra tu peso y % de grasa corporal para calcular tu FFMI (Índice de Masa Libre de Grasa).</p>
                    </div>
                )}
            </Card>

            {(calculatedGoals || settings.dailyCalorieGoal) && (
                <Card className="animate-fade-in">
                    <h3 className="text-xl font-bold mb-4">Metas Diarias</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg space-y-4">
                        <div className="text-center">
                            <label className="block text-xs text-slate-400">Objetivo de Calorías Diarias</label>
                             <input type="number" value={manualGoals.calories} onChange={e => handleCalorieChange(e.target.value)} className="w-48 mx-auto text-4xl font-bold text-primary-color bg-transparent text-center focus:outline-none"/>
                        </div>
                        <div className="grid grid-cols-3 text-center pt-3 border-t border-slate-700">
                             <div>
                                <input type="number" value={manualGoals.protein} onChange={e => handleMacroChange('protein', e.target.value)} className="w-24 mx-auto font-bold text-lg bg-transparent text-center focus:outline-none"/>
                                <p className="text-xs text-blue-400">Proteína (g)</p>
                             </div>
                             <div>
                                <input type="number" value={manualGoals.carbs} onChange={e => handleMacroChange('carbs', e.target.value)} className="w-24 mx-auto font-bold text-lg bg-transparent text-center focus:outline-none"/>
                                <p className="text-xs text-orange-400">Carbs (g)</p>
                             </div>
                             <div>
                                <input type="number" value={manualGoals.fats} onChange={e => handleMacroChange('fats', e.target.value)} className="w-24 mx-auto font-bold text-lg bg-transparent text-center focus:outline-none"/>
                                <p className="text-xs text-yellow-400">Grasas (g)</p>
                             </div>
                        </div>
                         {calculatedGoals && <p className="text-xs text-slate-500 text-center pt-2">Sugerencia IA basada en TMB: {calculatedGoals.bmr} kcal, TDEE: {calculatedGoals.tdee} kcal</p>}
                    </div>
                </Card>
            )}

            <div className="flex justify-end mt-8">
                <Button onClick={handleSave} disabled={!hasChanges}>
                    <SaveIcon size={16}/> Guardar Objetivos
                </Button>
            </div>
        </div>
    );
};


interface PhysicalProgressProps {
  progress: BodyProgressLog[];
  setProgress: React.Dispatch<React.SetStateAction<BodyProgressLog[]>>;
  nutritionLogs: NutritionLog[];
  setNutritionLogs: React.Dispatch<React.SetStateAction<NutritionLog[]>>;
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  isOnline: boolean;
  programs: Program[];
  history: WorkoutLog[];
  onNavigate: (view: View) => void;
  setIsBodyLogModalOpen: (isOpen: boolean) => void;
  setIsNutritionLogModalOpen: (isOpen: boolean) => void;
}

const PhysicalProgress: React.FC<PhysicalProgressProps> = ({ progress, setProgress, nutritionLogs, setNutritionLogs, settings, onSettingsChange, isOnline, programs, history, onNavigate, setIsBodyLogModalOpen, setIsNutritionLogModalOpen }) => {
    const { unlockedAchievements } = useAchievements();
    const [activeTab, setActiveTab] = useState<'summary' | 'charts' | 'records' | 'goals' | 'achievements'>('summary');

    const renderContent = () => {
        switch (activeTab) {
            case 'summary':
                return <DailyProgressView nutritionLogs={nutritionLogs} bodyProgressLogs={progress} settings={settings} setNutritionLogs={setNutritionLogs} />;
            case 'charts':
                return (
                    <div className="space-y-6">
                        <BodyWeightChart progress={progress} settings={settings} />
                        <BodyMeasurementsChart progress={progress} />
                        <WeeklyBurnSummary history={history} settings={settings} />
                        {progress.length < 2 && (
                             <Card><p className="text-center text-sm text-slate-500 py-4">Añade al menos dos registros de peso para ver tu gráfico de progreso.</p></Card>
                        )}
                    </div>
                );
             case 'records':
                return <PersonalRecordsView programs={programs} history={history} settings={settings} />;
            case 'goals':
                return (
                    <div className="space-y-8">
                        <ProgressGoals settings={settings} onSettingsChange={onSettingsChange} progress={progress} />
                        <WeightProjectionWidget />
                    </div>
                );
            case 'achievements':
                return <AchievementsView unlocked={unlockedAchievements} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-4xl font-bold uppercase tracking-wider">Progreso</h1>
                </div>
                 <div className="flex gap-2">
                    <Button onClick={() => setIsBodyLogModalOpen(true)} variant="secondary"><PlusIcon size={16}/> Peso</Button>
                    <Button onClick={() => setIsNutritionLogModalOpen(true)}><PlusIcon size={16}/> Comida</Button>
                </div>
            </div>
            
            <div className="mb-6">
                <div className="flex space-x-1 bg-panel-color-light p-1 rounded-full text-xs sm:text-sm overflow-x-auto hide-scrollbar">
                    <button onClick={() => setActiveTab('summary')} className={`py-2 px-3 rounded-full font-semibold transition-colors flex-shrink-0 ${activeTab === 'summary' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Resumen Diario</button>
                    <button onClick={() => setActiveTab('charts')} className={`py-2 px-3 rounded-full font-semibold transition-colors flex-shrink-0 ${activeTab === 'charts' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Gráficos</button>
                    <button onClick={() => setActiveTab('records')} className={`py-2 px-3 rounded-full font-semibold transition-colors flex-shrink-0 ${activeTab === 'records' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Mis Récords</button>
                    <button onClick={() => setActiveTab('goals')} className={`py-2 px-3 rounded-full font-semibold transition-colors flex-shrink-0 ${activeTab === 'goals' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Mis Objetivos</button>
                    <button onClick={() => setActiveTab('achievements')} className={`py-2 px-3 rounded-full font-semibold transition-colors flex-shrink-0 ${activeTab === 'achievements' ? 'bg-primary-color text-white' : 'text-slate-300'}`}>Mis Logros</button>
                </div>
            </div>
            
            <div key={activeTab} className="animate-fade-in">
                {renderContent()}
            </div>

        </div>
    );
};

export default PhysicalProgress;