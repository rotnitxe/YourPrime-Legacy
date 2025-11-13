// components/WeeklyProgressAnalysis.tsx
import React, { useState } from 'react';
import { useAppState } from '../contexts/AppContext';
import { generateImprovementSuggestions } from '../services/aiService';
import { ImprovementSuggestion } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { SparklesIcon, BarChartIcon, TrendingUpIcon, ZapIcon, ClockIcon } from './icons';
import SkeletonLoader from './ui/SkeletonLoader';

const ICON_MAP: Record<ImprovementSuggestion['category'], React.FC<any>> = {
    Progression: TrendingUpIcon,
    Volume: BarChartIcon,
    Intensity: ZapIcon,
    Recovery: ClockIcon,
};

const WeeklyProgressAnalysis: React.FC = () => {
    const { history, programs, settings, isOnline } = useAppState();
    const [suggestions, setSuggestions] = useState<ImprovementSuggestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!isOnline) {
            setError("La función de IA requiere conexión a internet.");
            return;
        }
        if (history.length < 3) {
            setError("Se necesitan al menos 3 entrenamientos registrados para un análisis significativo.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateImprovementSuggestions(history, programs, settings);
            setSuggestions(result);
        } catch (err: any) {
            setError(err.message || 'Ocurrió un error al generar el análisis.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <SparklesIcon/> Sugerencias del Coach
            </h3>
            
            {isLoading && <SkeletonLoader lines={5} />}
            {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
            
            {!isLoading && suggestions && (
                <div className="space-y-4 animate-fade-in">
                    {suggestions.map((item, index) => {
                        const Icon = ICON_MAP[item.category] || SparklesIcon;
                        return (
                            <div key={index} className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-primary-color">
                                <h4 className="font-bold text-white flex items-center gap-2"><Icon size={16}/> {item.title}</h4>
                                <p className="text-sm text-slate-300 mt-1">{item.suggestion}</p>
                            </div>
                        );
                    })}
                     <Button onClick={handleAnalyze} variant="secondary" className="!text-xs !py-1 mt-4 w-full">
                        Regenerar Sugerencias
                     </Button>
                </div>
            )}
            
            {!isLoading && !suggestions && !error && (
                 <div className="text-center py-4 space-y-3">
                    <p className="text-sm text-slate-400">Obtén sugerencias personalizadas de la IA para optimizar tu plan de entrenamiento actual.</p>
                    <Button onClick={handleAnalyze} disabled={!isOnline || history.length < 3}>
                        Analizar Mi Progreso
                    </Button>
                </div>
             )}
        </Card>
    );
};

export default WeeklyProgressAnalysis;