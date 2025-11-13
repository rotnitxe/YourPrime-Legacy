// components/ExerciseDetailView.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../contexts/AppContext';
import { ExerciseMuscleInfo, MuscleHierarchy } from '../types';
import { getAICoachAnalysis, getCommunityOpinionForExercise, generateImage, searchGoogleImages, searchWebForExerciseVideos, estimateSFR, getPrimeStarsRating } from '../services/aiService';
// FIX: Imported UsersIcon to resolve "Cannot find name" error.
import { StarIcon, SparklesIcon, BrainIcon, UploadIcon, VideoIcon, ImageIcon, PlusIcon, TrendingUpIcon, CheckCircleIcon, XCircleIcon, ChevronRightIcon, DumbbellIcon, ActivityIcon, TrophyIcon, UsersIcon } from './icons';
import Button from './ui/Button';
import { ExerciseLink } from './ExerciseLink';
import { InfoTooltip } from './ui/InfoTooltip';
import ImageSearchModal from './ImageSearchModal';

// --- Sub-components ---

const StarRating: React.FC<{ rating: number; onSetRating?: (rating: number) => void; colorClass?: string }> = ({ rating, onSetRating, colorClass = "text-yellow-400" }) => (
    <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={onSetRating ? () => onSetRating(star) : undefined} disabled={!onSetRating} aria-label={`Calificar con ${star} estrellas`}>
                <StarIcon size={20} filled={star <= rating} className={`${colorClass} ${onSetRating ? 'cursor-pointer' : ''}`} />
            </button>
        ))}
    </div>
);

const TagWithTooltip: React.FC<{ label: string }> = ({ label }) => (
    <div className="flex items-center px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
        <span className="text-xs font-semibold">{label}</span>
        <InfoTooltip term={label} />
    </div>
);

const IndicatorBar: React.FC<{ label: string; value: number; max?: number; details?: string }> = ({ label, value, max = 10, details }) => {
    const percentage = (value / max) * 100;
    const hue = (value/max * 120); // 0=red(0), 10=green(120)
    const reversedHue = 120 - (value / max * 120); // 10=red(0), 1=green(108)

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-semibold text-slate-200">{label}</span>
                <span className="text-sm font-bold text-white">{value}/{max}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: `hsl(${label.includes('Riesgo') ? reversedHue : hue}, 70%, 45%)` }}></div>
            </div>
            {details && <p className="text-xs text-slate-400 mt-1">{details}</p>}
        </div>
    );
};

const MuscleActivationView: React.FC<{
    involvedMuscles: ExerciseMuscleInfo['involvedMuscles'];
    muscleHierarchy: MuscleHierarchy;
}> = ({ involvedMuscles = [], muscleHierarchy }) => {
    
    const childToParentMap = useMemo(() => {
        const map = new Map<string, string>();
        Object.values(muscleHierarchy.bodyPartHierarchy).flat().forEach(group => {
            if (typeof group === 'object' && group !== null) {
                const parent = Object.keys(group)[0];
                const children = Object.values(group)[0];
                children.forEach(child => map.set(child, parent));
            }
        });
        return map;
    }, [muscleHierarchy]);
    
    const roleConfig = {
        primary: { label: 'Primarios', color: 'bg-green-500' },
        secondary: { label: 'Secundarios', color: 'bg-sky-500' },
        stabilizer: { label: 'Estabilizadores', color: 'bg-emerald-500' },
    };

    return (
        <div className="space-y-4">
            {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map(role => {
                const musclesForRole = involvedMuscles.filter(m => m.role === role);
                if (!musclesForRole.length) return null;

                const rootMuscles = musclesForRole.filter(m => {
                    const parent = childToParentMap.get(m.muscle);
                    return !parent || !musclesForRole.some(other => other.muscle === parent);
                });

                return (
                    <div key={role}>
                        <h4 className={`font-bold text-lg mb-2 text-white`}>{roleConfig[role].label}</h4>
                        <div className="space-y-3">
                        {rootMuscles.sort((a,b) => b.activation - a.activation).map((rootMuscle, index) => {
                            const children = musclesForRole.filter(m => childToParentMap.get(m.muscle) === rootMuscle.muscle);
                            return (
                                <div key={index}>
                                    <div>
                                        <div className="flex justify-between items-baseline mb-1 text-sm">
                                            <span className="font-semibold text-slate-300">{rootMuscle.muscle}</span>
                                            <span className="font-mono text-slate-400">{Math.round(rootMuscle.activation * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                                            <div className={`${roleConfig[role].color} h-2.5 rounded-full`} style={{ width: `${rootMuscle.activation * 100}%` }}></div>
                                        </div>
                                    </div>
                                    {children.length > 0 && (
                                        <div className="pl-4 mt-2 space-y-2 border-l-2 border-slate-700">
                                            {children.map((child, childIndex) => (
                                                 <div key={childIndex}>
                                                    <div className="flex justify-between items-baseline mb-1 text-xs">
                                                        <span className="font-semibold text-slate-400">{child.muscle}</span>
                                                        <span className="font-mono text-slate-500">{Math.round(child.activation * 100)}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                                        <div className={`${roleConfig[role].color}/80 h-2 rounded-full`} style={{ width: `${child.activation * 100}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ImageVideoGallery: React.FC<{
    images: string[];
    videos: string[];
    exerciseName: string;
    isOnline: boolean;
    onUpdate: (images: string[], videos: string[]) => void;
}> = ({ images, videos, exerciseName, isOnline, onUpdate }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState<'ai' | 'webImage' | 'webVideo' | null>(null);
    const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
    const { settings } = useAppState();

    const handleGenerateImage = async () => {
        setIsLoading('ai');
        const newImage = await generateImage(`Professional fitness photo of someone doing ${exerciseName}`, settings);
        onUpdate([...images, newImage], videos);
        setIsLoading(null);
    };
    
    const handleSelectImageFromSearch = (imageUrl: string) => {
        onUpdate([...images, imageUrl], videos);
    };
    
    const handleSearchVideos = async () => {
        setIsLoading('webVideo');
        const webVideos = await searchWebForExerciseVideos(exerciseName, settings);
        onUpdate(images, [...videos, ...webVideos.videoUrls]);
        setIsLoading(null);
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onUpdate([...images, event.target!.result as string], videos);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const addVideoUrl = () => {
        const url = prompt("Pega la URL del video (YouTube, Instagram, etc.):");
        if (url) {
            onUpdate(images, [...videos, url]);
        }
    };

    const hasMedia = images.length > 0 || videos.length > 0;

    return (
        <>
            <ImageSearchModal
                isOpen={isImageSearchOpen}
                onClose={() => setIsImageSearchOpen(false)}
                onSelectImage={handleSelectImageFromSearch}
                initialQuery={exerciseName}
            />
            <div className="glass-card p-4">
                <h3 className="font-bold text-lg text-white mb-3">Galería Multimedia</h3>
                <div className="relative">
                    <div className="flex overflow-x-auto snap-x snap-mandatory space-x-3 pb-3 hide-scrollbar">
                        {images.map((img, i) => (
                            <div key={`img-${i}`} className="snap-center flex-shrink-0 w-4/5 sm:w-3/5">
                                 <img src={img} alt={`${exerciseName} ${i+1}`} className="aspect-video w-full object-cover rounded-lg shadow-md" />
                            </div>
                        ))}
                        {videos.map((vid, i) => (
                             <div key={`vid-${i}`} className="snap-center flex-shrink-0 w-4/5 sm:w-3/5">
                                <a href={vid} target="_blank" rel="noopener noreferrer" className="aspect-video bg-black rounded-lg flex items-center justify-center text-white w-full h-full shadow-md">
                                    <VideoIcon size={32} />
                                </a>
                            </div>
                        ))}
                        {!hasMedia && (
                            <div className="flex-shrink-0 w-full text-center text-slate-500 text-sm py-8 bg-slate-900/50 rounded-lg">
                                No hay imágenes ni videos. <br/> ¡Añade algunos!
                            </div>
                        )}
                    </div>
                     {hasMedia && (
                        <div className="absolute top-0 right-0 bottom-3 w-8 bg-gradient-to-l from-black/50 to-transparent pointer-events-none flex items-center justify-center">
                            <ChevronRightIcon className="text-white/50 animate-pulse"/>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                    <Button onClick={() => fileInputRef.current?.click()} variant="secondary"><UploadIcon size={12}/> Subir</Button>
                    <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden"/>
                    <Button onClick={handleGenerateImage} variant="secondary" isLoading={isLoading === 'ai'} disabled={!isOnline || !!isLoading}><SparklesIcon size={12}/> Generar IA</Button>
                    <Button onClick={() => setIsImageSearchOpen(true)} variant="secondary" disabled={!isOnline || !!isLoading}><ImageIcon size={12}/> Buscar Imagen</Button>
                    <Button onClick={addVideoUrl} variant="secondary" disabled={!!isLoading}><PlusIcon size={12}/> Video URL</Button>
                    <Button onClick={handleSearchVideos} variant="secondary" isLoading={isLoading === 'webVideo'} disabled={!isOnline || !!isLoading}><VideoIcon size={12}/> Buscar Video</Button>
                </div>
            </div>
        </>
    )
};

const RecommendedMobility: React.FC<{ exerciseNames?: string[] }> = ({ exerciseNames }) => {
    if (!exerciseNames || exerciseNames.length === 0) return null;

    return (
        <div className="glass-card p-4">
            <h3 className="font-bold text-lg text-white mb-3">Movilidad Recomendada (Pre-sesión)</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                {exerciseNames.map((name, i) => (
                    <li key={i}>
                        <ExerciseLink name={name} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- Main Component ---

interface ExerciseDetailViewProps {
    exerciseId: string;
    isOnline: boolean;
}

export const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({ exerciseId, isOnline }) => {
    const { settings, exerciseList, muscleHierarchy, programs } = useAppState();
    const { setCurrentBackgroundOverride, addOrUpdateCustomExercise } = useAppDispatch();
    const [exercise, setExercise] = useState<ExerciseMuscleInfo | null>(null);
    const [isLoading, setIsLoading] = useState({ analysis: false, community: false, rating: false, sfr: false });
    
    useEffect(() => {
        const foundExercise = exerciseList.find(e => e.id === exerciseId);
        if (foundExercise) {
            setExercise(foundExercise);
        }
    }, [exerciseId, exerciseList]);

    const registeredVariants = useMemo(() => {
        if (!exercise) return [];
        const variants = new Set<string>();
        programs.forEach(p => 
            p.macrocycles.forEach(m => 
                m.mesocycles.forEach(meso => 
                    meso.weeks.forEach(w => 
                        w.sessions.forEach(s => 
                            s.exercises.forEach(ex => {
                                if (ex.exerciseDbId === exercise.id && ex.variantName) {
                                    variants.add(ex.variantName);
                                }
                            })
                        )
                    )
                )
            )
        );
        return Array.from(variants);
    }, [exercise, programs]);


    useEffect(() => {
        const mainImage = exercise?.images?.[0];
        if (mainImage) {
            setCurrentBackgroundOverride({ type: 'image', value: mainImage, style: { blur: 16, brightness: 0.4 } });
        } else {
             setCurrentBackgroundOverride(undefined);
        }
        return () => setCurrentBackgroundOverride(undefined);
    }, [exercise, setCurrentBackgroundOverride]);


    useEffect(() => {
        const foundExercise = exerciseList.find(e => e.id === exerciseId);
        if (foundExercise && isOnline) {
            if (!foundExercise.aiCoachAnalysis) fetchAICoachAnalysis(foundExercise);
            if (!foundExercise.communityOpinion) fetchCommunityOpinion(foundExercise);
            if (!foundExercise.primeStars) fetchPrimeStarsRating(foundExercise);
            if (!foundExercise.sfr) fetchSFR(foundExercise);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exerciseId, isOnline]); // Fetch AI data only when ID changes

    const updateExerciseState = (updatedData: Partial<ExerciseMuscleInfo>) => {
        setExercise(prev => {
            if (!prev) return null;
            const newExercise = { ...prev, ...updatedData };
            addOrUpdateCustomExercise(newExercise); // Persist changes
            return newExercise;
        });
    };

    const fetchAICoachAnalysis = async (ex: ExerciseMuscleInfo) => {
        setIsLoading(prev => ({ ...prev, analysis: true }));
        try {
            const analysis = await getAICoachAnalysis(ex.name, settings);
            updateExerciseState({ aiCoachAnalysis: analysis });
        } catch (e) { console.error(e); } finally {
            setIsLoading(prev => ({ ...prev, analysis: false }));
        }
    };
    
    const fetchCommunityOpinion = async (ex: ExerciseMuscleInfo) => {
        setIsLoading(prev => ({ ...prev, community: true }));
        try {
            const opinions = await getCommunityOpinionForExercise(ex.name, settings);
            updateExerciseState({ communityOpinion: opinions });
        } catch (e) { console.error(e); } finally {
            setIsLoading(prev => ({ ...prev, community: false }));
        }
    };

    const fetchPrimeStarsRating = async (ex: ExerciseMuscleInfo) => {
         setIsLoading(prev => ({ ...prev, rating: true }));
        try {
            const ratingData = await getPrimeStarsRating(ex.name, settings);
            updateExerciseState({ primeStars: ratingData });
        } catch (e) { console.error(e); } finally {
            setIsLoading(prev => ({ ...prev, rating: false }));
        }
    };
    
    const fetchSFR = async (ex: ExerciseMuscleInfo) => {
        setIsLoading(prev => ({ ...prev, sfr: true }));
        try {
            const sfr = await estimateSFR(ex.name, settings);
            updateExerciseState({ sfr });
        } catch (e) { console.error(e); } finally {
            setIsLoading(prev => ({ ...prev, sfr: false }));
        }
    };

    const handleUserRating = (rating: number) => updateExerciseState({ userRating: rating });
    const handleFavoriteToggle = () => updateExerciseState({ isFavorite: !exercise?.isFavorite });
    const handleMediaUpdate = (images: string[], videos: string[]) => updateExerciseState({ images, videos });

    if (!exercise) {
        return <div className="pt-24 text-center">Cargando ejercicio...</div>;
    }

    const primaryMuscle = exercise.involvedMuscles?.find(m => m.role === 'primary')?.muscle || 'Desconocido';

    const getSfrColor = (score: number) => {
        const hue = score * 12; // 1 -> 12 (red), 10 -> 120 (green)
        return `hsl(${hue}, 80%, 45%)`;
    };

    return (
        <div className="pb-28 pt-[65px] animate-fade-in">
            <header className="relative h-48">
                <div className="absolute bottom-4 left-4 right-4 z-10">
                     <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                         <button onClick={handleFavoriteToggle} aria-label="Marcar como favorito">
                            <StarIcon size={28} filled={exercise.isFavorite} className={exercise.isFavorite ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}/>
                         </button>
                         {exercise.name}
                         {exercise.isHallOfFame && <span title="Hall of Fame" className="p-1 bg-yellow-400/20 rounded-full"><TrophyIcon size={16} className="text-yellow-400"/></span>}
                    </h1>
                    {exercise.alias && <p className="text-slate-400 text-sm ml-10 italic">{exercise.alias}</p>}
                    <p className="text-slate-300 ml-10 mt-1">{primaryMuscle}</p>
                </div>
            </header>
            
            <div className="space-y-6 mt-6">
                <div className="flex flex-wrap gap-2">
                    <TagWithTooltip label={exercise.category} />
                    <TagWithTooltip label={exercise.type} />
                    <TagWithTooltip label={exercise.equipment} />
                    {exercise.force && <TagWithTooltip label={exercise.force} />}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-3 text-center">
                        <label className="text-xs text-slate-400">Tu Calificación</label>
                        <StarRating rating={exercise.userRating || 0} onSetRating={handleUserRating} />
                    </div>
                     <div className="glass-card p-3 text-center">
                        <label className="text-xs text-slate-400">PrimeStars (IA)</label>
                        {isLoading.rating ? <div className="h-5 w-24 bg-slate-700 animate-pulse mx-auto mt-1 rounded"/> : <StarRating rating={exercise.primeStars?.score || 0} colorClass="text-sky-400"/>}
                    </div>
                </div>

                {exercise.primeStars && !isLoading.rating && (
                     <blockquote className="glass-card !p-3 text-sm italic text-slate-300 border-l-4 border-sky-400">
                        {exercise.primeStars.justification}
                    </blockquote>
                )}
                
                <ImageVideoGallery images={exercise.images || []} videos={exercise.videos || []} exerciseName={exercise.name} isOnline={isOnline} onUpdate={handleMediaUpdate} />

                <div className="glass-card p-4">
                     <h3 className="font-bold text-lg text-white mb-2">Descripción</h3>
                    <p className="whitespace-pre-wrap text-slate-300">{exercise.description}</p>
                </div>
                
                {registeredVariants.length > 0 && (
                    <div className="glass-card p-4">
                         <h3 className="font-bold text-lg text-white mb-2">Variantes Registradas</h3>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                            {registeredVariants.map((variant, i) => <li key={i}>{variant}</li>)}
                        </ul>
                    </div>
                )}


                 <div className="glass-card p-4">
                    <h3 className="font-bold text-lg text-white mb-3">Indicadores Clave</h3>
                    <div className="space-y-4">
                        {exercise.setupTime && <IndicatorBar label="Tiempo de Set-Up" value={exercise.setupTime} />}
                        {exercise.technicalDifficulty && <IndicatorBar label="Dificultad Técnica" value={exercise.technicalDifficulty} />}
                        {exercise.injuryRisk && <IndicatorBar label="Riesgo Lesivo (con mala técnica)" value={exercise.injuryRisk.level} details={exercise.injuryRisk.details} />}
                        {exercise.transferability && <IndicatorBar label="Transferencia Funcional" value={exercise.transferability} />}
                    </div>
                </div>

                {exercise.sportsRelevance && exercise.sportsRelevance.length > 0 && (
                    <div className="glass-card p-4">
                        <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2"><ActivityIcon/> Relevancia Deportiva</h3>
                        <div className="flex flex-wrap gap-2">
                            {exercise.sportsRelevance.map(sport => (
                                <TagWithTooltip key={sport} label={sport} />
                            ))}
                        </div>
                    </div>
                )}
                
                <RecommendedMobility exerciseNames={exercise.recommendedMobility} />

                 <div className="glass-card p-4">
                     <h3 className="font-bold text-lg text-white mb-3">Activación Muscular</h3>
                     <MuscleActivationView involvedMuscles={exercise.involvedMuscles} muscleHierarchy={muscleHierarchy} />
                </div>

                 <div className="glass-card p-4">
                     <h3 className="font-bold text-lg text-white mb-3 flex items-center gap-2"><TrendingUpIcon/> Ratio Estímulo-Fatiga (SFR)</h3>
                     {isLoading.sfr ? <div className="h-4 w-1/2 bg-slate-700 animate-pulse rounded"/> : (
                        exercise.sfr ? (
                            <div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-xl" style={{color: getSfrColor(exercise.sfr.score)}}>{exercise.sfr.score}/10</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{ width: `${exercise.sfr.score * 10}%`, backgroundColor: getSfrColor(exercise.sfr.score) }}></div>
                                </div>
                                <p className="text-sm text-slate-400 mt-2 italic">"{exercise.sfr.justification}"</p>
                            </div>
                        ) : <p className="text-sm text-slate-500">No se pudo estimar el SFR.</p>
                     )}
                </div>

                <div className="glass-card p-4">
                     <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2"><SparklesIcon/> Análisis del Coach IA</h3>
                     {isLoading.analysis ? <div className="space-y-2"><div className="h-4 w-full bg-slate-700 animate-pulse rounded"/><div className="h-4 w-3/4 bg-slate-700 animate-pulse rounded"/></div> : (
                        exercise.aiCoachAnalysis ? (
                            <div className="space-y-4">
                                <p className="text-sm text-slate-300 italic">"{exercise.aiCoachAnalysis.summary}"</p>
                                <div>
                                    <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-1"><CheckCircleIcon size={16}/>Pros</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                        {exercise.aiCoachAnalysis.pros.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                                 <div>
                                    <h4 className="font-semibold text-red-400 flex items-center gap-2 mb-1"><XCircleIcon size={16}/>Contras</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                                        {exercise.aiCoachAnalysis.cons.map((item, index) => <li key={index}>{item}</li>)}
                                    </ul>
                                </div>
                            </div>
                        ) : <p className="text-sm text-slate-500">Análisis no disponible.</p>
                     )}
                </div>

                 <div className="glass-card p-4">
                     <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2"><UsersIcon/> Opinión de la Comunidad</h3>
                      {isLoading.community ? <div className="space-y-2"><div className="h-4 w-full bg-slate-700 animate-pulse rounded"/><div className="h-4 w-3/4 bg-slate-700 animate-pulse rounded"/></div> : (
                        exercise.communityOpinion && exercise.communityOpinion.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                                {exercise.communityOpinion.map((op, index) => <li key={index}>{op}</li>)}
                            </ul>
                        ) : <p className="text-sm text-slate-500">Opiniones no disponibles.</p>
                      )}
                </div>
            </div>
        </div>
    );
};