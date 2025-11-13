// components/TasksView.tsx
import React, { useState } from 'react';
import { useAppState, useAppDispatch } from '../contexts/AppContext';
import { Task } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import { PlusIcon, TrashIcon, CheckCircleIcon } from './icons';

const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const { toggleTask, deleteTask } = useAppDispatch();

    return (
        <div className={`glass-card-nested p-4 transition-opacity duration-300 ${task.completed ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <button 
                        onClick={() => toggleTask(task.id)}
                        className="mt-1 flex-shrink-0"
                        aria-label={task.completed ? 'Marcar como no completada' : 'Marcar como completada'}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${task.completed ? 'bg-primary-color' : 'border-2 border-slate-600'}`}>
                            {task.completed && <CheckCircleIcon size={20} className="text-white"/>}
                        </div>
                    </button>
                    <div className="flex-grow">
                        <h3 className={`font-bold text-white ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                        {task.description && <p className={`text-sm text-slate-400 mt-1 ${task.completed ? 'line-through' : ''}`}>{task.description}</p>}
                    </div>
                </div>
                <button 
                    onClick={() => deleteTask(task.id)} 
                    className="p-2 text-slate-500 hover:text-red-400 flex-shrink-0"
                    aria-label="Eliminar tarea"
                >
                    <TrashIcon size={18}/>
                </button>
            </div>
        </div>
    );
};

const TasksView: React.FC = () => {
    const { tasks } = useAppState();
    const { addTask } = useAppDispatch();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        addTask({ title, description });
        setTitle('');
        setDescription('');
    };

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold uppercase tracking-wider">Mis Tareas</h1>
            
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título de la nueva tarea..."
                        className="w-full text-lg"
                        required
                    />
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descripción opcional..."
                        rows={2}
                        className="w-full text-sm"
                    />
                    <Button type="submit" className="w-full">
                        <PlusIcon /> Crear Tarea
                    </Button>
                </form>
            </Card>

            <div className="space-y-3">
                <h2 className="text-2xl font-bold">Pendientes</h2>
                {tasks.filter(t => !t.completed).length > 0 ? (
                    tasks.filter(t => !t.completed).map(task => <TaskItem key={task.id} task={task} />)
                ) : (
                    <p className="text-slate-500 text-center py-4">¡No tienes tareas pendientes!</p>
                )}

                <h2 className="text-2xl font-bold pt-6">Completadas</h2>
                {tasks.filter(t => t.completed).length > 0 ? (
                     tasks.filter(t => t.completed).map(task => <TaskItem key={task.id} task={task} />)
                ) : (
                    <p className="text-slate-500 text-center py-4">Aún no has completado ninguna tarea.</p>
                )}
            </div>
        </div>
    );
};

export default TasksView;