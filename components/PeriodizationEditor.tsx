// components/PeriodizationEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Program, Session, Mesocycle, Exercise, ExerciseSet, ChatMessage, GenerateContentResponse, ProgramWeek, Macrocycle } from '../types';
import Button from './ui/Button';
import Modal from './ui/Modal';
// FIX: Import from aiService instead of geminiService
import { getPeriodizationCoachStream, generateImage } from '../services/aiService';
import { SparklesIcon, CoachIcon, PlusIcon, TrashIcon, PencilIcon, ChevronRightIcon, XIcon, ArrowUpIcon, ArrowDownIcon, UploadIcon, ImageIcon } from './icons';
import useLocalStorage from '../hooks/useLocalStorage';
import PeriodizationTemplateModal from './PeriodizationTemplateModal';
import { useAppState } from '../contexts/AppContext';

// --- Internal Components ---

const AICoachModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}> = ({ isOpen, onClose, isOnline }) => {
    const { settings } = useAppState();
    const [messages, setMessages] = useLocalStorage<ChatMessage[]>('periodization-coach-chat-history', []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleClearHistory = () => {
        if (window.confirm('¿Estás seguro de que quieres borrar el historial de este chat?')) {
            setMessages([]);
        }
    };


    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !isOnline) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const stream: AsyncGenerator<GenerateContentResponse> = await getPeriodizationCoachStream(input, messages, settings);
            let newBotMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
            setMessages(prev => [...prev, newBotMessage]);

            for await (const chunk of stream) {
                newBotMessage.parts[0].text += chunk.text;
                setMessages(prev => [...prev.slice(0, -1), { ...newBotMessage }]);
            }
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "Lo siento, ocurrió un error." }] };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Consultar al Coach de IA">
            <div className="flex flex-col h-[70vh]">
                 {messages.length > 0 && (
                    <div className="flex justify-end pr-2 pb-2">
                        <button onClick={handleClearHistory} title="Borrar historial" className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                            <TrashIcon size={16} />
                        </button>
                    </div>
                )}
                <div className="flex-grow bg-slate-950/70 p-4 rounded-lg overflow-y-auto flex flex-col gap-4">
                    {messages.length === 0 && <div className="m-auto text-center text-slate-400"><p>¿Dudas sobre periodización?</p><p className="text-sm">Pregúntame sobre macrociclos, mesociclos, RPE, volumen, etc.</p></div>}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-[var(--primary-color-600)]' : 'bg-slate-800'}`}>
                                <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: msg.parts[0].text.replace(/\n/g, '<br />') }} />
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="mt-4 flex gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={!isOnline ? "Sin conexión" : "Escribe tu pregunta..."} disabled={isLoading || !isOnline} className="flex-grow bg-slate-800 border-slate-700 rounded-md px-4 py-2" />
                    <Button type="submit" isLoading={isLoading} disabled={!input.trim() || !isOnline}>Enviar</Button>
                </form>
            </div>
        </Modal>
    );
};

const InlineSessionEditor: React.FC<{
  session: Session;
  onSave: (updatedSession: Session) => void;
  onClose: () => void;
}> = ({ session: initialSession, onSave, onClose }) => {
    const [session, setSession] = useState<Session>(JSON.parse(JSON.stringify(initialSession)));

    const handleExerciseChange = (exIndex: number, field: keyof Exercise, value: any) => {
        const updatedExercises = [...session.exercises];
        updatedExercises[exIndex] = { ...updatedExercises[exIndex], [field]: value };
        setSession({ ...session, exercises: updatedExercises });
    };

    const handleSetChange = (exIndex: number, setIndex: number, field: keyof ExerciseSet, value: string) => {
        const updatedExercises = [...session.exercises];
        const numValue = parseInt(value, 10);
        updatedExercises[exIndex].sets[setIndex] = { ...updatedExercises[exIndex].sets[setIndex], [field]: isNaN(numValue) ? undefined : numValue };
        setSession({ ...session, exercises: updatedExercises });
    };

    const handleAddSet = (exIndex: number) => {
      const updatedExercises = [...session.exercises];
      const lastSet = updatedExercises[exIndex].sets.slice(-1)[0] || { targetReps: 8, targetRPE: 7 };
      updatedExercises[exIndex].sets.push({ ...lastSet, id: crypto.randomUUID() });
      setSession({ ...session, exercises: updatedExercises });
    }

    const handleRemoveSet = (exIndex: number, setIndex: number) => {
        if (session.exercises[exIndex].sets.length <= 1) return;
        const updatedExercises = [...session.exercises];
        updatedExercises[exIndex].sets = updatedExercises[exIndex].sets.filter((_, i) => i !== setIndex);
        setSession({ ...session, exercises: updatedExercises });
    }
    
    const handleAddExercise = () => {
        const newExercise: Exercise = { id: crypto.randomUUID(), name: '', sets: [{ id: crypto.randomUUID(), targetReps: 8, targetRPE: 7}], restTime: 90, isFavorite: false, trainingMode: 'reps' };
        setSession({ ...session, exercises: [...session.exercises, newExercise]});
    }

    const handleRemoveExercise = (exIndex: number) => {
        setSession({ ...session, exercises: session.exercises.filter((_, i) => i !== exIndex) });
    }


    return (
        <Modal isOpen={true} onClose={onClose} title="Editar Sesión">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <input type="text" value={session.name} onChange={e => setSession({...session, name: e.target.value})} placeholder="Nombre de la Sesión" className="w-full text-lg font-bold bg-slate-800 border-slate-700 rounded-md p-2 mb-4" />
                
                {session.exercises.map((ex, exIndex) => (
                    <div key={ex.id || exIndex} className="bg-slate-900 p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <input type="text" value={ex.name} onChange={e => handleExerciseChange(exIndex, 'name', e.target.value)} placeholder="Nombre del Ejercicio" className="font-semibold bg-transparent w-full" />
                            <button onClick={() => handleRemoveExercise(exIndex)}><TrashIcon className="text-slate-500 hover:text-red-500" size={16} /></button>
                        </div>
                         {ex.sets.map((set, setIndex) => (
                            <div key={set.id || setIndex} className="grid grid-cols-12 gap-2 items-center">
                                <span className="text-sm text-slate-400 col-span-1">S{setIndex+1}</span>
                                <input type="number" value={set.targetReps || ''} onChange={e => handleSetChange(exIndex, setIndex, 'targetReps', e.target.value)} placeholder="Reps" className="col-span-3 bg-slate-800 rounded p-1 text-center" />
                                <div className="col-span-3 flex items-center">
                                    <span className="text-sm text-slate-400 mr-1">@</span>
                                    <input type="number" step="0.5" value={set.targetRPE || ''} onChange={e => handleSetChange(exIndex, setIndex, 'targetRPE', e.target.value)} placeholder="RPE" className="w-full bg-slate-800 rounded p-1 text-center" />
                                </div>
                                <input type="number" step="5" value={ex.restTime} onChange={e => handleExerciseChange(exIndex, 'restTime', e.target.value)} placeholder="Descanso" className="col-span-4 bg-slate-800 rounded p-1 text-center" />
                                <button onClick={() => handleRemoveSet(exIndex, setIndex)} className="col-span-1"><XIcon size={14} className="text-slate-500 hover:text-red-500" /></button>
                            </div>
                         ))}
                        <Button onClick={() => handleAddSet(exIndex)} variant="secondary" className="!text-xs !py-1"><PlusIcon size={14}/> Añadir Serie</Button>
                    </div>
                ))}
                <Button onClick={handleAddExercise} className="w-full mt-4"><PlusIcon /> Añadir Ejercicio</Button>

            </div>
             <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-700">
                <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                <Button onClick={() => onSave(session)}>Guardar Sesión</Button>
            </div>
        </Modal>
    );
};