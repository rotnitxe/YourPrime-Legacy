// components/YourLab.tsx
import React, { useState, useMemo } from 'react';
import { ExerciseMuscleInfo, ExercisePlaylist, View } from '../types';
import { SearchIcon, ChevronRightIcon, PlusIcon, DumbbellIcon, ClipboardListIcon, TrashIcon, TrophyIcon, BrainIcon, ActivityIcon, TargetIcon, DatabaseIcon, SparklesIcon } from './icons';
import { useAppContext } from '../contexts/AppContext';
import Button from './ui/Button';
import Card from './ui/Card';
import Modal from './ui/Modal';
import { generateExerciseCollection } from '../services/aiService';
import SkeletonLoader from './ui/SkeletonLoader';

type ActiveTab = 'explore' | 'lists';

const AICollectionModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { settings, isOnline, exerciseList, addOrUpdatePlaylist, addToast } = useAppContext();
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ collectionName: string; exercises: { name: string; justification: string }[] } | null>(null);

    const handleGenerate = async () => {
        if (!purpose.trim()) return;
        setIsLoading(true);
        setResult(null);
        try {
            const res = await generateExerciseCollection(purpose, settings);
            setResult(res);
        } catch (e) {
            console.error(e);
            addToast("Error al generar la colección.", "danger");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (!result) return;
        const exerciseIds = result.exercises.map(ex => {
            const found = exerciseList.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
            return found?.id;
        }).filter((id): id is string => !!id);
        
        const newPlaylist: ExercisePlaylist = {
            id: crypto.randomUUID(),
            name: result.collectionName,
            exerciseIds: exerciseIds,
        };
        addOrUpdatePlaylist(newPlaylist);
        addToast(`Colección "${result.collectionName}" creada!`, 'success');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Colección con IA">
            <div className="space-y-4">
                {!result && (
                    <>
                        <textarea value={purpose} onChange={e => setPurpose(e.target.value)} rows={3} placeholder="Describe tu objetivo... (ej: Calentamiento para día de pierna, finisher metabólico de 10 minutos)" className="w-full" />
                        <Button onClick={handleGenerate} isLoading={isLoading} disabled={!isOnline || !purpose.trim()} className="w-full">
                            <SparklesIcon /> Generar Colección
                        </Button>
                    </>
                )}

                {isLoading && <SkeletonLoader lines={5}/>}

                {result && (
                    <div className="animate-fade-in space-y-4">
                        <h3 className="text-lg font-bold text-white">{result.collectionName}</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {result.exercises.map((ex, i) => (
                                <div key={i} className="bg-slate-800/50 p-3 rounded-lg">
                                    <p className="font-semibold text-primary-color">{ex.name}</p>
                                    <p className="text-xs text-slate-400 italic">"{ex.justification}"</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={() => setResult(null)} variant="secondary" className="flex-1">Atrás</Button>
                             <Button onClick={handleSave} className="flex-1">Guardar Colección</Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};


const ExerciseItem: React.FC<{ exercise: ExerciseMuscleInfo }> = React.memo(({ exercise }) => {
    const { navigateTo } = useAppContext();
    return (
        <div
            onClick={() => navigateTo('exercise-detail', { exerciseId: exercise.id })}
            className="p-3 flex justify-between items-center cursor-pointer list-none hover:bg-slate-800/50 rounded-lg transition-colors"
        >
            <div>
                <h3 className="font-semibold text-white text-md">{exercise.name}</h3>
                <p className="text-xs text-slate-400">{exercise.type} • {exercise.equipment}</p>
            </div>
            <ChevronRightIcon className="text-slate-500" />
        </div>
    );
});

const YourLab: React.FC = () => {
    const { exerciseList, exercisePlaylists, navigateTo, addOrUpdatePlaylist, deletePlaylist, muscleHierarchy } = useAppContext();
    const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const handleCreatePlaylist = () => {
        if (!newPlaylistName.trim()) return;
        const newPlaylist: ExercisePlaylist = {
            id: crypto.randomUUID(),
            name: newPlaylistName.trim(),
            exerciseIds: [],
        };
        addOrUpdatePlaylist(newPlaylist);
        setNewPlaylistName('');
        setIsCreatingNew(false);
    };

    const handleDeletePlaylist = (playlistId: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta colección?")) {
            deletePlaylist(playlistId);
        }
    }
    
    const hallOfFameExercises = useMemo(() => exerciseList.filter(ex => ex.isHallOfFame), [exerciseList]);
    const bodyPartCategories = useMemo(() => Object.keys(muscleHierarchy.bodyPartHierarchy).sort((a, b) => a.localeCompare(b)), [muscleHierarchy]);
    const specialCategories = useMemo(() => Object.keys(muscleHierarchy.specialCategories || {}).filter(cat => cat !== 'Core'), [muscleHierarchy]);

    const filteredExercises = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        return exerciseList.filter(ex => 
            ex.name.toLowerCase().includes(query) || 
            (ex.alias && ex.alias.toLowerCase().includes(query)) ||
            ex.involvedMuscles.some(m => m.muscle.toLowerCase().includes(query))
        ).slice(0, 20);
    }, [searchQuery, exerciseList]);

    const renderExploreTab = () => (
        <div className="space-y-6">
            {searchQuery.length > 0 ? (
                <div>
                     <h2 className="text-2xl font-bold pt-4 mb-4">Resultados de Búsqueda</h2>
                     <div className="space-y-2">
                        {filteredExercises.length > 0 ? (
                            filteredExercises.map(ex => <ExerciseItem key={ex.id} exercise={ex} />)
                        ) : (
                            <p className="text-slate-400 text-center">No se encontraron ejercicios.</p>
                        )}
                     </div>
                </div>
            ) : (
                <>
                    <div onClick={() => navigateTo('body-lab')} className="glass-card !p-4 border-2 border-sky-600/50 bg-gradient-to-br from-sky-900/20 to-transparent cursor-pointer flex justify-between items-center"><div className="flex items-center gap-4"><BrainIcon size={24} className="text-sky-300"/><div><h2 className="text-xl font-bold text-sky-300">BodyLab</h2><p className="text-xs text-slate-400">Descubre tu perfil de atleta único con IA.</p></div></div><ChevronRightIcon className="text-sky-400" /></div>
                    <div onClick={() => navigateTo('training-purpose')} className="glass-card !p-4 border-2 border-purple-600/50 bg-gradient-to-br from-purple-900/20 to-transparent cursor-pointer flex justify-between items-center"><div className="flex items-center gap-4"><TargetIcon size={24} className="text-purple-300"/><div><h2 className="text-xl font-bold text-purple-300">Laboratorio de Propósitos</h2><p className="text-xs text-slate-400">Encuentra ejercicios para tus metas específicas.</p></div></div><ChevronRightIcon className="text-purple-400" /></div>
                    <div onClick={() => navigateTo('mobility-lab')} className="glass-card !p-4 border-2 border-green-600/50 bg-gradient-to-br from-green-900/20 to-transparent cursor-pointer flex justify-between items-center"><div className="flex items-center gap-4"><ActivityIcon size={24} className="text-green-300"/><div><h2 className="text-xl font-bold text-green-300">Laboratorio de Movilidad</h2><p className="text-xs text-slate-400">Genera rutinas de calentamiento personalizadas.</p></div></div><ChevronRightIcon className="text-green-400" /></div>
                    <div onClick={() => navigateTo('exercise-database')} className="glass-card !p-4 border-2 border-slate-600/50 bg-gradient-to-br from-slate-900/20 to-transparent cursor-pointer flex justify-between items-center"><div className="flex items-center gap-4"><DatabaseIcon size={24} className="text-slate-300"/><div><h2 className="text-xl font-bold text-slate-300">Base de Datos de Ejercicios</h2><p className="text-xs text-slate-400">Explora la biblioteca completa de {exerciseList.length}+ ejercicios.</p></div></div><ChevronRightIcon className="text-slate-400" /></div>
                    <div onClick={() => navigateTo('chain-detail', { chainId: 'Core' })} className="glass-card !p-4 border-2 border-yellow-600/50 bg-gradient-to-br from-yellow-900/20 to-transparent cursor-pointer flex justify-between items-center"><h2 className="text-xl font-bold text-yellow-300">Core y Estabilidad</h2><ChevronRightIcon className="text-yellow-400" /></div>
                    {specialCategories.length > 0 && (<div><h2 className="text-2xl font-bold pt-4 mb-4">Grupos Funcionales</h2><div className="grid grid-cols-2 gap-4">{specialCategories.map(categoryName => (<Card key={categoryName} onClick={() => navigateTo('chain-detail', { chainId: categoryName })} className="cursor-pointer text-center !py-6"><h3 className="font-bold text-white text-lg">{categoryName}</h3></Card>))}</div></div>)}
                    
                    <div>
                        <h2 className="text-2xl font-bold pt-4 mb-4">Explorar por Anatomía</h2>
                        <div className="space-y-3">
                            {bodyPartCategories.map(categoryName => (
                                <div 
                                    key={categoryName} 
                                    onClick={() => navigateTo('muscle-category', { categoryName })} 
                                    className="glass-card p-4 flex justify-between items-center cursor-pointer list-none hover:border-primary-color"
                                >
                                    <h2 className="text-xl font-bold text-white">{categoryName}</h2>
                                    <ChevronRightIcon className="details-arrow transition-transform" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {hallOfFameExercises.length > 0 && (<Card><div className="flex justify-between items-center mb-3"><h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2"><TrophyIcon /> Hall Of Fame</h2><Button onClick={() => navigateTo('hall-of-fame')} variant="secondary" className="!text-xs !py-1">Ver todo</Button></div><div className="relative"><div className="flex overflow-x-auto snap-x snap-mandatory space-x-3 pb-3 -mx-4 px-4 hide-scrollbar">{hallOfFameExercises.map(ex => (<div key={ex.id} className="snap-center flex-shrink-0 w-3/5 sm:w-2/5"><div onClick={() => navigateTo('exercise-detail', { exerciseId: ex.id })} className="h-full bg-slate-900 rounded-lg p-4 flex flex-col justify-between cursor-pointer border-2 border-yellow-900/80 hover:border-yellow-400/50 transition-colors"><h3 className="font-bold text-white">{ex.name}</h3><p className="text-xs text-slate-400">{ex.involvedMuscles?.find(m => m.role === 'primary')?.muscle}</p></div></div>))}</div></div></Card>)}
                </>
            )}
        </div>
    );
    
    const renderListsTab = () => (
         <div className="space-y-4">
            <AICollectionModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={() => setIsCreatingNew(true)} variant="secondary">
                    <PlusIcon /> Crear Colección Manual
                </Button>
                <Button onClick={() => setIsAIModalOpen(true)}>
                    <SparklesIcon /> Crear con IA
                </Button>
            </div>
            {isCreatingNew && (
                <div className="glass-card p-4 space-y-3 animate-fade-in">
                    <input type="text" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} placeholder="Nombre de la nueva colección" className="w-full" autoFocus />
                    <div className="flex gap-2"><Button onClick={() => setIsCreatingNew(false)} variant="secondary" className="flex-1">Cancelar</Button><Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()} className="flex-1">Crear</Button></div>
                </div>
            )}
            {Array.isArray(exercisePlaylists) && exercisePlaylists.length > 0 ? (
                exercisePlaylists.map(playlist => (
                    <details key={playlist.id} className="glass-card !p-0">
                        <summary className="p-4 cursor-pointer list-none flex justify-between items-center">
                            <div><h3 className="font-bold text-white text-lg">{playlist.name}</h3><p className="text-sm text-slate-400">{playlist.exerciseIds.length} ejercicios</p></div>
                            <div className="flex items-center gap-2"><button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeletePlaylist(playlist.id); }} className="p-2 text-slate-500 hover:text-red-400"><TrashIcon size={16}/></button><ChevronRightIcon className="details-arrow transition-transform" /></div>
                        </summary>
                        <div className="border-t border-slate-700/50 p-2 space-y-1">{playlist.exerciseIds.length > 0 ? playlist.exerciseIds.map(exId => {const exercise = exerciseList.find(e => e.id === exId); return exercise ? <ExerciseItem key={exId} exercise={exercise} /> : null;}) : <p className="text-sm text-slate-500 text-center p-4">Esta colección está vacía.</p>}</div>
                    </details>
                ))
            ) : (!isCreatingNew && <p className="text-center text-slate-500 pt-8">Aún no has creado ninguna colección.</p>)}

             <div className="mt-8 opacity-50">
                <h3 className="text-xl font-bold text-white mb-3">Colecciones de la Comunidad</h3>
                <Card>
                    <p className="text-center text-sm text-slate-400">Próximamente: Explora y guarda las colecciones más efectivas creadas por otros usuarios.</p>
                </Card>
            </div>
        </div>
    );


    return (
        <div className="animate-fade-in">
            <div className="sticky top-0 z-20 bg-[var(--header-bg-color-fallback)] backdrop-blur-[var(--header-bg-blur)] border-b border-[var(--header-border-color-fallback)] -mx-4 px-4 py-3 space-y-3">
                 <div className="flex bg-panel-color-light p-1 rounded-full">
                    <button onClick={() => setActiveTab('explore')} className={`w-full py-1.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'explore' ? 'bg-primary-color text-white' : 'text-slate-300'}`}><DumbbellIcon size={16}/> Explorar</button>
                    <button onClick={() => setActiveTab('lists')} className={`w-full py-1.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'lists' ? 'bg-primary-color text-white' : 'text-slate-300'}`}><ClipboardListIcon size={16}/> Colecciones</button>
                </div>

                {activeTab === 'explore' && (
                    <div className="space-y-2 animate-fade-in">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar ejercicio, músculo..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-color"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        </div>
                    </div>
                )}
            </div>

            <div className="max-w-4xl mx-auto pb-28 mt-4">
               {activeTab === 'explore' ? renderExploreTab() : renderListsTab()}
            </div>
        </div>
    );
};

export default YourLab;