import React, { useState } from 'react';
import { Session, Exercise } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import { PlusIcon, TrashIcon } from './icons';

interface SessionEditorProps {
    onSave: (session: Session) => void;
    onCancel: () => void;
    existingSessionInfo?: { session: Session; programId: string };
    isOnline?: boolean;
    settings?: any;
    saveTrigger?: number;
    addExerciseTrigger?: number;
    exerciseList?: any[];
}

const SessionEditor: React.FC<SessionEditorProps> = ({ onSave, onCancel, existingSessionInfo }) => { 
    const [session, setSession] = useState<Session>(existingSessionInfo?.session || { id: crypto.randomUUID(), name: 'Nueva Sesión', description: '', exercises: [] });

    const addExercise = () => {
        const newEx: Exercise = { id: crypto.randomUUID(), name: 'Nuevo Ejercicio', restTime: 90, sets: [], isFavorite: false, trainingMode: 'reps' };
        setSession(prev => ({ ...prev, exercises: [...prev.exercises, newEx] }));
    };

    return (
        <div className="space-y-6 pb-20">
            <Card>
                <label className="block text-sm text-slate-400">Nombre</label>
                <input type="text" value={session.name} onChange={e => setSession({...session, name: e.target.value})} className="w-full bg-transparent text-xl font-bold text-white border-b border-slate-700 pb-2 mb-4"/>
                <textarea value={session.description} onChange={e => setSession({...session, description: e.target.value})} className="w-full bg-slate-900 p-2 rounded text-sm text-slate-300" placeholder="Descripción..."/>
            </Card>
            <div className="space-y-4">
                {session.exercises.map((ex, i) => (
                    <Card key={ex.id}>
                        <div className="flex justify-between items-center mb-2">
                            <input value={ex.name} onChange={e => {const newEx = [...session.exercises]; newEx[i].name = e.target.value; setSession({...session, exercises: newEx})}} className="bg-transparent font-bold text-white flex-1" placeholder="Nombre Ejercicio"/>
                            <button onClick={() => {const newEx = [...session.exercises]; newEx.splice(i, 1); setSession({...session, exercises: newEx})}}><TrashIcon className="text-red-400" size={18}/></button>
                        </div>
                        <div className="text-xs text-slate-500">Configuración simplificada</div>
                    </Card>
                ))}
                <Button onClick={addExercise} variant="secondary" className="w-full"><PlusIcon/> Añadir Ejercicio</Button>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-800 flex gap-4 z-50">
                <Button onClick={onCancel} variant="secondary" className="flex-1">Cancelar</Button>
                <Button onClick={() => onSave(session)} className="flex-1">Guardar</Button>
            </div>
        </div>
    );
}; 
export default SessionEditor;