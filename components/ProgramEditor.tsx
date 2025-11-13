import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Program, Macrocycle, Mesocycle, ProgramWeek, Session, SessionBackground } from '../types';
import Button from './ui/Button';
import { generateImage } from '../services/aiService';
import { SparklesIcon, UploadIcon, ImageIcon, PlusIcon, TrashIcon, ChevronRightIcon, Wand2Icon } from './icons';
import { storageService } from '../services/storageService';
import BackgroundEditorModal from './SessionBackgroundModal';
import { useAppContext } from '../contexts/AppContext';

interface ProgramEditorProps {
  onSave: (program: Program) => void;
  onCancel: () => void;
  existingProgram: Program | null;
  isOnline: boolean;
  saveTrigger: number;
}

const PROGRAM_DRAFT_KEY = 'program-editor-draft';

const isProgramComplex = (p: Program | null): boolean => {
    if (!p) return false;
    // It's complex if it has more than one macrocycle.
    if (p.macrocycles.length > 1) return true;
    // It's complex if its single macrocycle has more than one mesocycle.
    if (p.macrocycles.length === 1 && p.macrocycles[0].mesocycles.length > 1) return true;
    return false;
};

const ProgramEditor: React.FC<ProgramEditorProps> = ({ onSave, onCancel, existingProgram, isOnline, saveTrigger }) => {
  const { settings, setIsDirty, isDirty: isAppContextDirty } = useAppContext();
  const [program, setProgram] = useState<Program>(
    existingProgram || {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      coverImage: '',
      macrocycles: [
        {
          id: crypto.randomUUID(),
          name: 'Macrociclo 1',
          mesocycles: [
            {
              id: crypto.randomUUID(),
              name: 'Mesociclo 1',
              goal: 'Acumulación',
              weeks: [
                { id: crypto.randomUUID(), name: 'Semana 1', sessions: [] }
              ]
            }
          ]
        }
      ]
    }
  );

  const [isPeriodizationMode, setIsPeriodizationMode] = useState(isProgramComplex(existingProgram));
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  
  const prevSaveTriggerRef = useRef(saveTrigger);

  useEffect(() => {
    const initializeEditor = async () => {
        const defaultNewProgram = {
            id: crypto.randomUUID(), name: '', description: '', coverImage: '',
            macrocycles: [{ id: crypto.randomUUID(), name: 'Macrociclo 1', mesocycles: [{ id: crypto.randomUUID(), name: 'Mesociclo 1', goal: 'Acumulación', weeks: [{ id: crypto.randomUUID(), name: 'Semana 1', sessions: [] }] }]}]
        };

        let initialData = existingProgram ? JSON.parse(JSON.stringify(existingProgram)) : defaultNewProgram;
        setIsDirty(false);

        const draft = await storageService.get<{ programData: Program; associatedId: string | null }>(PROGRAM_DRAFT_KEY);
        if (draft) {
            const draftAssociatedId = draft.associatedId;
            const currentId = existingProgram?.id || null;

            if (draftAssociatedId === currentId) {
                if (window.confirm('Se encontró un borrador de programa no guardado. ¿Deseas restaurarlo?')) {
                    initialData = draft.programData;
                    setIsDirty(true);
                } else {
                    await storageService.remove(PROGRAM_DRAFT_KEY);
                }
            }
        }
        setProgram(initialData);
    };

    initializeEditor();
  }, [existingProgram?.id, setIsDirty]);

  useEffect(() => {
    if (isAppContextDirty) {
        storageService.set(PROGRAM_DRAFT_KEY, {
            programData: program,
            associatedId: existingProgram?.id || null,
        });
    }
  }, [program, isAppContextDirty, existingProgram]);


  const handleSave = useCallback(async () => {
      if (program.name && program.name.trim()) {
          onSave(program);
          await storageService.remove(PROGRAM_DRAFT_KEY);
          setIsDirty(false);
      }
  }, [onSave, program, setIsDirty]);

  useEffect(() => {
      if (saveTrigger > prevSaveTriggerRef.current) {
          handleSave();
      }
      prevSaveTriggerRef.current = saveTrigger;
  }, [saveTrigger, handleSave]);


  const handleProgramInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProgram({ ...program, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  const handleProgramFieldChange = <K extends keyof Program>(field: K, value: Program[K]) => {
    setProgram(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };
  
  const handleSaveBackground = (bg?: SessionBackground) => {
    setProgram(p => ({
        ...p,
        background: bg,
        coverImage: (bg?.type === 'image' ? bg.value : '')
    }));
    setIsDirty(true);
  };

  const updateProgramStructure = (updatedMacrocycles: Macrocycle[]) => {
    setProgram(prev => ({ ...prev, macrocycles: updatedMacrocycles }));
    setIsDirty(true);
  };

  // --- Structure Manipulation Handlers ---
  const handleAddMacro = () => {
    const newMacro: Macrocycle = {
      id: crypto.randomUUID(),
      name: `Macrociclo ${program.macrocycles.length + 1}`,
      mesocycles: []
    };
    updateProgramStructure([...program.macrocycles, newMacro]);
  };

  const handleRemoveMacro = (macroIndex: number) => {
    if (window.confirm('¿Seguro que quieres eliminar este macrociclo y todo su contenido?')) {
      updateProgramStructure(program.macrocycles.filter((_, i) => i !== macroIndex));
    }
  };

  const handleMacroChange = (macroIndex: number, newName: string) => {
    const updated = JSON.parse(JSON.stringify(program.macrocycles));
    updated[macroIndex].name = newName;
    updateProgramStructure(updated);
  };
  
  const handleAddMeso = (macroIndex: number) => {
    const updated = JSON.parse(JSON.stringify(program.macrocycles));
    const newMeso: Mesocycle = {
        id: crypto.randomUUID(),
        name: `Mesociclo ${updated[macroIndex].mesocycles.length + 1}`,
        goal: 'Acumulación',
        weeks: []
    };
    updated[macroIndex].mesocycles.push(newMeso);
    updateProgramStructure(updated);
  };

  const handleRemoveMeso = (macroIndex: number, mesoIndex: number) => {
    if (window.confirm('¿Seguro que quieres eliminar este mesociclo y todo su contenido?')) {
        const updated = JSON.parse(JSON.stringify(program.macrocycles));
        updated[macroIndex].mesocycles = updated[macroIndex].mesocycles.filter((_: any, i: number) => i !== mesoIndex);
        updateProgramStructure(updated);
    }
  };
  
  const handleMesoChange = (macroIndex: number, mesoIndex: number, field: keyof Omit<Mesocycle, 'id'|'weeks'>, value: any) => {
    const updated = JSON.parse(JSON.stringify(program.macrocycles));
    (updated[macroIndex].mesocycles[mesoIndex] as any)[field] = value;
    if (field === 'goal' && value !== 'Custom') {
        updated[macroIndex].mesocycles[mesoIndex].customGoal = '';
    }
    updateProgramStructure(updated);
  };
  
  const handleAddWeek = (macroIndex: number, mesoIndex: number) => {
    const updated = JSON.parse(JSON.stringify(program.macrocycles));
    const newWeek: ProgramWeek = {
        id: crypto.randomUUID(),
        name: `Semana ${updated[macroIndex].mesocycles[mesoIndex].weeks.length + 1}`,
        sessions: []
    };
    updated[macroIndex].mesocycles[mesoIndex].weeks.push(newWeek);
    updateProgramStructure(updated);
  };
  
  const handleRemoveWeek = (macroIndex: number, mesoIndex: number, weekIndex: number) => {
     if (window.confirm('¿Seguro que quieres eliminar esta semana y todas sus sesiones?')) {
        const updated = JSON.parse(JSON.stringify(program.macrocycles));
        updated[macroIndex].mesocycles[mesoIndex].weeks = updated[macroIndex].mesocycles[mesoIndex].weeks.filter((_: any, i: number) => i !== weekIndex);
        updateProgramStructure(updated);
    }
  };

  const handleWeekChange = (macroIndex: number, mesoIndex: number, weekIndex: number, newName: string) => {
    const updated = JSON.parse(JSON.stringify(program.macrocycles));
    updated[macroIndex].mesocycles[mesoIndex].weeks[weekIndex].name = newName;
    updateProgramStructure(updated);
  };

  const handleWeekVariantChange = (macroIndex: number, mesoIndex: number, weekIndex: number, variant: ProgramWeek['variant']) => {
    const updated = JSON.parse(JSON.stringify(program.macrocycles));
    updated[macroIndex].mesocycles[mesoIndex].weeks[weekIndex].variant = variant || undefined;
    updateProgramStructure(updated);
  };
  
  const goalOptions: (Mesocycle['goal'])[] = ['Acumulación', 'Intensificación', 'Realización', 'Descarga', 'Custom'];


  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-24">
       {isBgModalOpen && (
            <BackgroundEditorModal 
                isOpen={isBgModalOpen}
                onClose={() => setIsBgModalOpen(false)}
                onSave={handleSaveBackground}
                initialBackground={program.background}
                previewTitle={program.name || "Nuevo Programa"}
                isOnline={isOnline}
            />
        )}
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-100">
            {existingProgram ? 'Editar Programa' : 'Crear Nuevo Programa'}
        </h2>
        
        <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div className="glass-card p-4">
                <h3 className="text-xl font-bold text-white mb-4">Detalles del Programa</h3>
                <div className="space-y-4">
                    <input type="text" name="name" value={program.name} onChange={handleProgramInfoChange} required className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2" placeholder="Ej: Mi Rutina de Hipertrofia de 5 Días" />
                    <textarea name="description" value={program.description} onChange={handleProgramInfoChange} rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2" placeholder="Una breve descripción de los objetivos, duración, etc." />
                </div>
            </div>

            <div className="glass-card p-4">
                 <h3 className="text-xl font-bold text-white mb-4">Fondo y Portada</h3>
                 <div className="aspect-video w-full bg-slate-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-slate-700">
                    {program.coverImage ? <img src={program.coverImage} alt="Cover" className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-slate-600"/>}
                 </div>
                 <Button type="button" onClick={() => setIsBgModalOpen(true)} variant="secondary" className="w-full"><Wand2Icon size={16} /> Editar Fondo</Button>
            </div>

            <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Periodización A/B/C/D</h3>
                    <button type="button" onClick={() => handleProgramFieldChange('periodizationABCD', !program.periodizationABCD)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${program.periodizationABCD ? 'bg-primary-color' : 'bg-slate-600'}`}>
                        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${program.periodizationABCD ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
                <p className="text-sm text-slate-400">Activa esta opción para crear semanas con variantes (A, B, C, D) y poder ciclarlas. Desactívala para una estructura de semanas simple (1, 2, 3...).</p>
            </div>

            <div className="glass-card p-4">
                {isPeriodizationMode ? (
                    <>
                        <h3 className="text-xl font-bold text-white mb-4">Estructura del Programa (Periodización)</h3>
                        <div className="space-y-4">
                        {program.macrocycles.map((macro, macroIndex) => (
                            <details key={macro.id} className="group glass-card overflow-hidden !p-0 border-l-4 border-slate-600" open>
                            <summary className="p-4 cursor-pointer flex justify-between items-center list-none bg-slate-900/50 group-open:border-b group-open:border-slate-700/50">
                                <div className="flex items-center gap-4 flex-grow"><ChevronRightIcon className="details-arrow" /><input value={macro.name} onClick={e => e.preventDefault()} onChange={e => handleMacroChange(macroIndex, e.target.value)} className="font-bold text-xl text-white bg-transparent flex-grow" /></div>
                                <button type="button" onClick={e => { e.preventDefault(); handleRemoveMacro(macroIndex); }} className="ml-4 p-1"><TrashIcon size={16} className="text-slate-500 hover:text-red-500"/></button>
                            </summary>
                            <div className="p-4 space-y-3">
                                {macro.mesocycles.map((meso, mesoIndex) => (
                                <details key={meso.id} className="group bg-slate-900 rounded-lg overflow-hidden !p-0 border-l-4 border-slate-700" open>
                                    <summary className="p-3 cursor-pointer flex justify-between items-center list-none bg-slate-800/50 group-open:border-b group-open:border-slate-700/50">
                                    <div className="flex items-center gap-3 flex-grow"><ChevronRightIcon className="details-arrow" size={20}/><input value={meso.name} onClick={e => e.preventDefault()} onChange={e => handleMesoChange(macroIndex, mesoIndex, 'name', e.target.value)} className="font-semibold text-lg bg-transparent flex-grow" /></div>
                                    <div className="flex items-center gap-2"><select value={meso.goal} onClick={e => e.preventDefault()} onChange={e => handleMesoChange(macroIndex, mesoIndex, 'goal', e.target.value as Mesocycle['goal'])} className="bg-slate-700 rounded-md p-1 text-xs">{goalOptions.map((opt: Mesocycle['goal']) => <option key={opt}>{opt}</option>)}</select><button type="button" onClick={e => { e.preventDefault(); handleRemoveMeso(macroIndex, mesoIndex); }} className="ml-3 p-1"><TrashIcon size={16} className="text-slate-500 hover:text-red-500"/></button></div>
                                    </summary>
                                    <div className="p-3 space-y-2">
                                    {meso.weeks.map((week, weekIndex) => (
                                        <div key={week.id} className="bg-slate-800/50 p-2 rounded-md flex justify-between items-center gap-2">
                                            <input value={week.name} onChange={e => handleWeekChange(macroIndex, mesoIndex, weekIndex, e.target.value)} className="font-semibold text-slate-300 text-sm bg-transparent flex-grow" />
                                            {program.periodizationABCD && (
                                                <select value={week.variant || ''} onChange={e => handleWeekVariantChange(macroIndex, mesoIndex, weekIndex, e.target.value as ProgramWeek['variant'])} className="bg-slate-700 rounded-md p-1 text-xs">
                                                    <option value="">-- Variante --</option>
                                                    <option value="A">Semana A</option>
                                                    <option value="B">Semana B</option>
                                                    <option value="C">Semana C</option>
                                                    <option value="D">Semana D</option>
                                                </select>
                                            )}
                                            <button type="button" onClick={() => handleRemoveWeek(macroIndex, mesoIndex, weekIndex)}><TrashIcon size={14} className="text-slate-500 hover:text-red-500"/></button>
                                        </div>
                                    ))}
                                    <Button type="button" onClick={() => handleAddWeek(macroIndex, mesoIndex)} variant="secondary" className="!text-sm !py-1 mt-2 w-full"><PlusIcon size={14}/> Añadir Semana</Button>
                                    </div>
                                </details>
                                ))}
                                <Button type="button" onClick={() => handleAddMeso(macroIndex)} variant="secondary" className="w-full"><PlusIcon size={16}/> Añadir Mesociclo</Button>
                            </div>
                            </details>
                        ))}
                        <Button type="button" onClick={handleAddMacro} variant="secondary" className="w-full"><PlusIcon size={16}/> Añadir Macrociclo</Button>
                        </div>
                    </>
                ) : (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Semanas del Programa</h3>
                            <Button type="button" onClick={() => {
                                if (window.confirm('¿Activar la periodización por bloques? Esta acción no se puede deshacer y te permitirá organizar semanas en mesociclos y macrociclos.')) {
                                    setIsPeriodizationMode(true);
                                }
                            }} variant="secondary">
                                <SparklesIcon size={16}/> Crear Bloques
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {program.macrocycles[0]?.mesocycles[0]?.weeks.map((week, weekIndex) => (
                                <div key={week.id} className="bg-slate-900/50 p-2 rounded-md flex justify-between items-center gap-2">
                                    <input value={week.name} onChange={e => handleWeekChange(0, 0, weekIndex, e.target.value)} className="font-semibold text-slate-300 text-sm bg-transparent flex-grow" />
                                     {program.periodizationABCD && (
                                        <select value={week.variant || ''} onChange={e => handleWeekVariantChange(0, 0, weekIndex, e.target.value as ProgramWeek['variant'])} className="bg-slate-700 rounded-md p-1 text-xs">
                                            <option value="">-- Variante --</option>
                                            <option value="A">Semana A</option>
                                            <option value="B">Semana B</option>
                                            <option value="C">Semana C</option>
                                            <option value="D">Semana D</option>
                                        </select>
                                    )}
                                    <button type="button" onClick={() => handleRemoveWeek(0, 0, weekIndex)}>
                                        <TrashIcon size={14} className="text-slate-500 hover:text-red-500"/>
                                    </button>
                                </div>
                            ))}
                            <Button type="button" onClick={() => handleAddWeek(0, 0)} variant="secondary" className="!text-sm !py-1 mt-2 w-full">
                                <PlusIcon size={14}/> Añadir Semana
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </form>
    </div>
  );
};

export default ProgramEditor;