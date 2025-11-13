// components/Settings.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Settings, Program, WorkoutLog, BodyProgressLog, NutritionLog, LocalSnapshot, SessionBackground, SkippedWorkoutLog } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import { Volume2Icon, VolumeXIcon, SaveIcon, DownloadIcon, UploadIcon, TypeIcon, TrashIcon, CloudIcon, UploadCloudIcon, DownloadCloudIcon, KeyIcon, PaletteIcon, BellIcon, PlusCircleIcon, DumbbellIcon, ChevronRightIcon, PencilIcon, SettingsIcon, Wand2Icon, CheckIcon } from './icons';
import { UseGoogleDriveReturn } from '../hooks/useGoogleDrive';
import useStorage from '../hooks/useLocalStorage';
import { storageService } from '../services/storageService';
import BackgroundEditorModal from './SessionBackgroundModal';
import { useAppDispatch } from '../contexts/AppContext';

interface SettingsProps {
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  setHistory: React.Dispatch<React.SetStateAction<WorkoutLog[]>>;
  setSkippedLogs: React.Dispatch<React.SetStateAction<SkippedWorkoutLog[]>>;
  setBodyProgress: React.Dispatch<React.SetStateAction<BodyProgressLog[]>>;
  setNutritionLogs: React.Dispatch<React.SetStateAction<NutritionLog[]>>;
  drive: UseGoogleDriveReturn;
  installPromptEvent: any;
  setInstallPromptEvent: (event: any) => void;
  isOnline: boolean;
}

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = false }) => (
    <details className="settings-card" open={defaultOpen}>
        <summary>
            <h3 className="text-xl font-bold text-white flex items-center gap-3">{icon} {title}</h3>
            <ChevronRightIcon className="details-arrow transition-transform text-slate-400" />
        </summary>
        <div className="card-content">
            {children}
        </div>
    </details>
);

const PRESET_CARD_COLORS = [
    '#1A1D2A', // Default Slate Blue
    '#1F1D36', // Deep Purple
    '#1A2E29', // Forest Green
    '#3B1F2B', // Maroon
    '#0D2B30', // Deep Teal
    '#39302B', // Earthy Brown
    '#313131', // Neutral Gray
    '#111827', // Tailwind Gray 900
];

const SettingsComponent: React.FC<SettingsProps> = ({ settings, onSettingsChange, setPrograms, setHistory, setSkippedLogs, setBodyProgress, setNutritionLogs, drive, installPromptEvent, setInstallPromptEvent, isOnline }) => {
    const [pendingSettings, setPendingSettings] = useState<Settings>(settings);
    const [hasChanges, setHasChanges] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dbFileInputRef = useRef<HTMLInputElement>(null);
    const { exportExerciseDatabase, importExerciseDatabase } = useAppDispatch();
    const [snapshots, setSnapshots] = useStorage<LocalSnapshot[]>('yourprime-snapshots', []);
    const [isBgModalOpen, setIsBgModalOpen] = useState(false);

    const handleInstallClick = () => {
        if (!installPromptEvent) {
            return;
        }
        installPromptEvent.prompt();
        installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            setInstallPromptEvent(null);
        });
    };

    useEffect(() => {
        // This effect syncs the local pending state with the global settings from props.
        // It's designed to NOT overwrite user's local edits. It will only sync
        // if `hasChanges` is false, meaning the user hasn't made any local edits yet.
        // This allows the component to reflect externally updated settings (like from a cloud sync)
        // without losing the user's current work.
        if (!hasChanges) {
            setPendingSettings(settings);
        }
    }, [settings, hasChanges]);

    const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setPendingSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };
    
    const handleApiKeyChange = (provider: 'gemini' | 'deepseek' | 'gpt', value: string) => {
        setPendingSettings(prev => ({
            ...prev,
            apiKeys: {
                ...prev.apiKeys,
                [provider]: value,
            }
        }));
        setHasChanges(true);
    };

    const handleSaveChanges = () => {
        onSettingsChange(pendingSettings);
        setHasChanges(false);
    };

    const handleDiscardChanges = () => {
        setPendingSettings(settings);
        setHasChanges(false);
    };

    const handleExportData = async () => {
        try {
            const data = await storageService.getAllDataForExport();
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
                JSON.stringify(data, null, 2)
            )}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `yourprime_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } catch (error) {
            alert('Error al exportar los datos.');
            console.error(error);
        }
    };
    
    const handleImportData = () => {
        if (!fileInputRef.current?.files?.length) {
            alert('Por favor, selecciona un archivo primero.');
            return;
        }
        const file = fileInputRef.current.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('El contenido del archivo no es válido.');
                }
                const data = JSON.parse(text);

                if (!data || typeof data !== 'object' || !Array.isArray(data.programs) || !Array.isArray(data.history) || typeof data.settings !== 'object' || data.settings === null) {
                    throw new Error("El archivo de importación es inválido o no tiene el formato correcto.");
                }

                setPrograms(data.programs);
                setHistory(data.history);
                onSettingsChange(data.settings);
                setBodyProgress(data['body-progress'] || []);
                setNutritionLogs(data['nutrition-logs'] || []);
                setSkippedLogs(data['skipped-logs'] || []);

                alert('Datos importados con éxito. La aplicación se recargará.');
                setTimeout(() => window.location.reload(), 500);

            } catch (error) {
                console.error("Error al importar datos:", error);
                alert(`Error al importar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        };
        reader.readAsText(file);
    };

    const handleImportDb = () => {
        if (!dbFileInputRef.current?.files?.length) {
            alert('Por favor, selecciona un archivo de base de datos de ejercicios primero.');
            return;
        }
        const file = dbFileInputRef.current.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') {
                    throw new Error('El contenido del archivo no es válido.');
                }
                importExerciseDatabase(text);
            } catch (error) {
                console.error("Error al importar la base de datos de ejercicios:", error);
                alert(`Error al importar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        };
        reader.readAsText(file);
    };

    const handleCreateSnapshot = async () => {
        const name = prompt("Introduce un nombre para esta copia de seguridad:", `Snapshot ${new Date().toLocaleDateString()}`);
        if (!name) return;
        try {
            const dataToBackup = {
                programs: await storageService.get<Program[]>('programs') || [],
                history: await storageService.get<WorkoutLog[]>('history') || [],
                settings: await storageService.get<Settings>('yourprime-settings') || settings,
                'body-progress': await storageService.get<BodyProgressLog[]>('body-progress') || [],
                'nutrition-logs': await storageService.get<NutritionLog[]>('nutrition-logs') || [],
            };
            const newSnapshot: LocalSnapshot = {
                id: crypto.randomUUID(),
                name,
                date: new Date().toISOString(),
                data: dataToBackup
            };
            setSnapshots(prev => [...prev, newSnapshot]);
            alert("Copia de seguridad local creada con éxito.");
        } catch (error) {
            console.error("Error al crear la copia de seguridad:", error);
            alert("No se pudo crear la copia de seguridad.");
        }
    };

    const handleRestoreSnapshot = (snapshotId: string) => {
        const snapshot = snapshots.find(s => s.id === snapshotId);
        if (!snapshot) return;
        if (window.confirm(`¿Seguro que quieres restaurar la copia "${snapshot.name}"? Esto reemplazará todos tus datos actuales.`)) {
            try {
                setPrograms(snapshot.data.programs);
                setHistory(snapshot.data.history);
                onSettingsChange(snapshot.data.settings);
                setBodyProgress(snapshot.data['body-progress'] || []);
                setNutritionLogs(snapshot.data['nutrition-logs'] || []);
                alert('Datos restaurados con éxito. La aplicación se recargará.');
                setTimeout(() => window.location.reload(), 500);
            } catch (error) {
                 console.error("Error al restaurar la copia de seguridad:", error);
                 alert("No se pudo restaurar la copia de seguridad.");
            }
        }
    };

    const handleDeleteSnapshot = (snapshotId: string) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar esta copia de seguridad?")) {
            setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
             {isBgModalOpen && (
                <BackgroundEditorModal
                    isOpen={isBgModalOpen}
                    onClose={() => setIsBgModalOpen(false)}
                    onSave={(bg) => handleSettingChange('appBackground', bg)}
                    initialBackground={pendingSettings.appBackground}
                    previewTitle="Fondo Global"
                    isOnline={isOnline}
                />
            )}
            <div>
                <h1 className="text-4xl font-bold uppercase tracking-wider">Ajustes</h1>
            </div>
            
            {hasChanges && (
                <div className="sticky top-[75px] z-40 animate-fade-in-up">
                    <div className="glass-card !p-3 flex justify-between items-center">
                        <p className="text-sm font-semibold text-yellow-300">Tienes cambios sin guardar.</p>
                        <div className="flex gap-2">
                             <Button onClick={handleDiscardChanges} variant="secondary" className="!text-xs !py-1">Descartar</Button>
                            <Button onClick={handleSaveChanges} className="!text-xs !py-1">Guardar</Button>
                        </div>
                    </div>
                </div>
            )}

            <SettingsCard title="Proveedor de IA" icon={<KeyIcon/>}>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="apiProvider" className="text-sm text-slate-300">Proveedor Principal</label>
                        <select
                            id="apiProvider"
                            value={pendingSettings.apiProvider || 'gemini'}
                            onChange={e => handleSettingChange('apiProvider', e.target.value as Settings['apiProvider'])}
                            className="w-full mt-1"
                        >
                            <option value="gemini">Gemini (Recomendado)</option>
                            <option value="gpt">GPT</option>
                            <option value="deepseek">DeepSeek</option>
                        </select>
                    </div>
                     <div className="space-y-3 pt-3 border-t border-slate-700/50">
                        <h4 className="text-md font-semibold text-slate-200">Claves de API</h4>
                        <div>
                             <label htmlFor="geminiApiKey" className="text-sm text-slate-300">API Key de Gemini</label>
                             <input type="password" id="geminiApiKey" value={pendingSettings.apiKeys?.gemini || ''} onChange={e => handleApiKeyChange('gemini', e.target.value)} className="w-full mt-1" placeholder="Pega tu clave aquí"/>
                        </div>
                        <div>
                             <label htmlFor="gptApiKey" className="text-sm text-slate-300">API Key de GPT (OpenAI)</label>
                             <input type="password" id="gptApiKey" value={pendingSettings.apiKeys?.gpt || ''} onChange={e => handleApiKeyChange('gpt', e.target.value)} className="w-full mt-1" placeholder="Pega tu clave aquí"/>
                        </div>
                         <div>
                             <label htmlFor="deepseekApiKey" className="text-sm text-slate-300">API Key de DeepSeek</label>
                             <input type="password" id="deepseekApiKey" value={pendingSettings.apiKeys?.deepseek || ''} onChange={e => handleApiKeyChange('deepseek', e.target.value)} className="w-full mt-1" placeholder="Pega tu clave aquí"/>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                        <span className="text-slate-300">Activar respaldo (Fallback)</span>
                        <button 
                            type="button" 
                            onClick={() => handleSettingChange('fallbackEnabled', !pendingSettings.fallbackEnabled)} 
                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.fallbackEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}
                        >
                           <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.fallbackEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                     <p className="text-xs text-slate-500">
                        Si está activado, la app intentará usar otro proveedor si el principal falla.
                    </p>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Personalización Visual" icon={<PaletteIcon/>}>
                <div className="space-y-6">
                     <div>
                        <h4 className="text-lg font-bold text-white mb-3">Fondo de Pantalla Global</h4>
                        <Button onClick={() => setIsBgModalOpen(true)} variant="secondary" className="w-full"><Wand2Icon size={16}/> Personalizar Fondo de la App</Button>
                         <div className="flex justify-between items-center mt-4">
                            <span className="text-slate-300">Efecto Parallax (Scroll)</span>
                            <button type="button" onClick={() => handleSettingChange('enableParallax', !pendingSettings.enableParallax)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.enableParallax ? 'bg-primary-color' : 'bg-slate-600'}`}>
                               <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.enableParallax ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">Aplica un sutil efecto de movimiento al fondo de la app cuando haces scroll. Funciona mejor con imágenes de fondo.</p>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-700/50">
                        <h4 className="text-lg font-bold text-white mb-3">Color de Tarjetas y UI</h4>
                        <div className="flex items-center gap-4">
                            <input 
                                type="color" 
                                value={pendingSettings.cardThemeColor || '#1A1D2A'}
                                onChange={e => handleSettingChange('cardThemeColor', e.target.value)}
                                className="w-16 h-10 p-1 bg-transparent border border-border-color rounded-md"
                            />
                            <p className="text-sm text-slate-400">Elige un color base personalizado o selecciona un preajuste:</p>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mt-3">
                            {PRESET_CARD_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleSettingChange('cardThemeColor', color)}
                                    className="aspect-square rounded-full transition-transform transform hover:scale-110"
                                    style={{ backgroundColor: color }}
                                    aria-label={`Seleccionar color ${color}`}
                                >
                                    {pendingSettings.cardThemeColor === color && (
                                        <div className="w-full h-full flex items-center justify-center bg-black/30 rounded-full ring-2 ring-offset-2 ring-offset-slate-800 ring-white">
                                            <CheckIcon className="text-white" size={24}/>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-slate-700/50">
                        <div>
                            <label htmlFor="cardBgOpacity" className="text-sm text-slate-300">Transparencia de Tarjetas: <span className="font-mono">{Math.round((pendingSettings.cardBgOpacity ?? 0.65) * 100)}%</span></label>
                            <input type="range" id="cardBgOpacity" min="0.1" max="1" step="0.05" value={pendingSettings.cardBgOpacity ?? 0.65} onChange={e => handleSettingChange('cardBgOpacity', parseFloat(e.target.value))} className="w-full"/>
                        </div>
                        <div>
                            <label htmlFor="cardBgBlur" className="text-sm text-slate-300">Desenfoque de Fondo (Blur): <span className="font-mono">{pendingSettings.cardBgBlur ?? 24}px</span></label>
                            <input type="range" id="cardBgBlur" min="0" max="80" step="1" value={pendingSettings.cardBgBlur ?? 24} onChange={e => handleSettingChange('cardBgBlur', parseInt(e.target.value))} className="w-full"/>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <h4 className="text-lg font-bold text-white mb-3">Header</h4>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="headerText" className="text-sm text-slate-300">Texto del Header</label>
                                <input type="text" id="headerText" value={pendingSettings.headerText || 'YourPrime'} onChange={e => handleSettingChange('headerText', e.target.value)} className="w-full mt-1" placeholder="YourPrime"/>
                            </div>
                            <div>
                                <label htmlFor="headerStyle" className="text-sm text-slate-300">Estilo del Texto</label>
                                <select id="headerStyle" value={pendingSettings.headerStyle || 'default'} onChange={e => handleSettingChange('headerStyle', e.target.value as Settings['headerStyle'])} className="w-full mt-1">
                                    <option value="default">Por Defecto</option><option value="gradient">Gradiente</option><option value="outline">Contorno</option><option value="neon">Neón</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="headerFontSize" className="text-sm text-slate-300">Tamaño de Fuente: <span className="font-mono">{pendingSettings.headerFontSize}rem</span></label>
                                <input type="range" id="headerFontSize" min="1.5" max="3.5" step="0.05" value={pendingSettings.headerFontSize || 2.25} onChange={e => handleSettingChange('headerFontSize', parseFloat(e.target.value))} className="w-full"/>
                            </div>
                            <div>
                                <label htmlFor="headerFontWeight" className="text-sm text-slate-300">Grosor de Fuente</label>
                                <select id="headerFontWeight" value={pendingSettings.headerFontWeight || 700} onChange={e => handleSettingChange('headerFontWeight', parseInt(e.target.value))} className="w-full mt-1">
                                    <option value="400">Normal</option><option value="700">Bold</option><option value="900">Black</option>
                                </select>
                            </div>
                            {pendingSettings.headerStyle === 'neon' && (
                              <div className="animate-fade-in">
                                <label htmlFor="headerGlowIntensity" className="text-sm text-slate-300">Intensidad de Neón: <span className="font-mono">{pendingSettings.headerGlowIntensity}</span></label>
                                <input type="range" id="headerGlowIntensity" min="0" max="20" step="1" value={pendingSettings.headerGlowIntensity || 5} onChange={e => handleSettingChange('headerGlowIntensity', parseInt(e.target.value))} className="w-full" />
                              </div>
                            )}
                             <div className="pt-4 border-t border-slate-700/50 space-y-3">
                                 <div className="flex justify-between items-center">
                                    <span className="text-slate-300">Fondo de Header Personalizado</span>
                                    <button type="button" onClick={() => handleSettingChange('headerCustomBgEnabled', !pendingSettings.headerCustomBgEnabled)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.headerCustomBgEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}>
                                       <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.headerCustomBgEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                                {pendingSettings.headerCustomBgEnabled && (
                                    <div className="space-y-3 pl-4 border-l-2 border-slate-700/50 animate-fade-in">
                                         <div className="flex items-center gap-2">
                                            <label htmlFor="headerCustomBgColor" className="text-sm text-slate-300">Color</label>
                                            <input type="color" id="headerCustomBgColor" value={pendingSettings.headerCustomBgColor || '#121212'} onChange={e => handleSettingChange('headerCustomBgColor', e.target.value)} className="w-10 h-8 p-0 border-none rounded bg-transparent"/>
                                        </div>
                                        <div>
                                            <label htmlFor="headerBgOpacity" className="text-sm text-slate-300">Opacidad: <span className="font-mono">{Math.round((pendingSettings.headerBgOpacity || 0.65) * 100)}%</span></label>
                                            <input type="range" id="headerBgOpacity" min="0" max="1" step="0.01" value={pendingSettings.headerBgOpacity || 0.65} onChange={e => handleSettingChange('headerBgOpacity', parseFloat(e.target.value))} className="w-full" />
                                        </div>
                                    </div>
                                )}
                                 <div>
                                    <label htmlFor="headerBgBlur" className="text-sm text-slate-300">Desenfoque Fondo: <span className="font-mono">{pendingSettings.headerBgBlur}px</span></label>
                                    <input type="range" id="headerBgBlur" min="0" max="48" step="1" value={pendingSettings.headerBgBlur || 24} onChange={e => handleSettingChange('headerBgBlur', parseInt(e.target.value))} className="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                        <h4 className="text-lg font-bold text-white mb-3">Editor de Tema Avanzado</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-300">Color Primario (Acento)</label>
                                <input type="color" value={pendingSettings.themePrimaryColor || '#8B5CF6'} onChange={e => handleSettingChange('themePrimaryColor', e.target.value)} className="w-full h-10 p-1 bg-transparent border border-border-color rounded-md"/>
                            </div>
                            <div>
                                <label className="text-sm text-slate-300">Color de Texto</label>
                                <input type="color" value={pendingSettings.themeTextColor || '#F1F5F9'} onChange={e => handleSettingChange('themeTextColor', e.target.value)} className="w-full h-10 p-1 bg-transparent border border-border-color rounded-md"/>
                            </div>
                             <div>
                                <label className="text-sm text-slate-300">Gradiente de Fondo</label>
                                <div className="flex gap-2">
                                    <input type="color" value={pendingSettings.themeBgGradientStart || '#111118'} onChange={e => handleSettingChange('themeBgGradientStart', e.target.value)} className="w-full h-10 p-1 bg-transparent border border-border-color rounded-md" title="Color Superior"/>
                                    <input type="color" value={pendingSettings.themeBgGradientEnd || '#0D0D1A'} onChange={e => handleSettingChange('themeBgGradientEnd', e.target.value)} className="w-full h-10 p-1 bg-transparent border border-border-color rounded-md" title="Color Inferior"/>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm text-slate-300">Color de Barra de Navegación</label>
                                <input type="color" value={pendingSettings.themeTabBarColor || '#172554'} onChange={e => handleSettingChange('themeTabBarColor', e.target.value)} className="w-full h-10 p-1 bg-transparent border border-border-color rounded-md"/>
                            </div>
                             <div>
                                <label htmlFor="themeFontFamily" className="text-sm text-slate-300">Fuente Principal</label>
                                <select id="themeFontFamily" value={pendingSettings.themeFontFamily || 'System'} onChange={e => handleSettingChange('themeFontFamily', e.target.value)} className="w-full mt-1">
                                    <option value="System">System UI (Por defecto)</option>
                                    <option value="Roboto Condensed">Roboto Condensed</option>
                                    <option value="Oswald">Oswald</option>
                                    <option value="Tahoma">Tahoma</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="themeCardStyle" className="text-sm text-slate-300">Estilo de Tarjetas</label>
                                <select id="themeCardStyle" value={pendingSettings.themeCardStyle || 'glass'} onChange={e => handleSettingChange('themeCardStyle', e.target.value as any)} className="w-full mt-1">
                                    <option value="glass">Cristal (Glassmorphism)</option>
                                    <option value="solid">Sólido</option>
                                    <option value="outline">Contorno</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="themeCardBorderRadius" className="text-sm text-slate-300">Radio de Borde (Tarjetas): <span className="font-mono">{pendingSettings.themeCardBorderRadius || 1.25}rem</span></label>
                                <input type="range" id="themeCardBorderRadius" min="0.5" max="2.5" step="0.1" value={pendingSettings.themeCardBorderRadius || 1.25} onChange={e => handleSettingChange('themeCardBorderRadius', parseFloat(e.target.value))} className="w-full"/>
                            </div>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard title="General" icon={<SettingsIcon/>}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">Unidad de Peso</label>
                        <div className="flex gap-2"><Button onClick={() => handleSettingChange('weightUnit', 'kg')} variant={pendingSettings.weightUnit === 'kg' ? 'primary' : 'secondary'} className="flex-1">kg</Button><Button onClick={() => handleSettingChange('weightUnit', 'lbs')} variant={pendingSettings.weightUnit === 'lbs' ? 'primary' : 'secondary'} className="flex-1">lbs</Button></div>
                    </div>
                    <div>
                        <label htmlFor="barbellWeight" className="flex items-center gap-2 text-sm text-slate-300 mb-1"><DumbbellIcon size={16}/> Peso de la Barra ({settings.weightUnit})</label>
                        <input id="barbellWeight" type="number" value={pendingSettings.barbellWeight} onChange={(e) => handleSettingChange('barbellWeight', parseFloat(e.target.value) || 0)} className="w-full"/>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 mb-1">La semana empieza en</label>
                        <div className="flex gap-2"><Button onClick={() => handleSettingChange('startWeekOn', 'lunes')} variant={pendingSettings.startWeekOn === 'lunes' ? 'primary' : 'secondary'} className="flex-1">Lunes</Button><Button onClick={() => handleSettingChange('startWeekOn', 'domingo')} variant={pendingSettings.startWeekOn === 'domingo' ? 'primary' : 'secondary'} className="flex-1">Domingo</Button></div>
                    </div>
                    <div className="flex justify-between items-center"><span className="text-slate-300 flex items-center gap-2">{pendingSettings.soundsEnabled ? <Volume2Icon/> : <VolumeXIcon/>} Sonidos de la app</span><button onClick={() => handleSettingChange('soundsEnabled', !pendingSettings.soundsEnabled)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.soundsEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}><span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.soundsEnabled ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                    <div className="flex justify-between items-center"><span className="text-slate-300">Mostrar PRs en entrenamiento</span><button onClick={() => handleSettingChange('showPRsInWorkout', !pendingSettings.showPRsInWorkout)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.showPRsInWorkout ? 'bg-primary-color' : 'bg-slate-600'}`}><span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.showPRsInWorkout ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                    <div className="flex justify-between items-center"><span className="text-slate-300">Vibración (Haptic Feedback)</span><button onClick={() => handleSettingChange('hapticFeedbackEnabled', !pendingSettings.hapticFeedbackEnabled)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.hapticFeedbackEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}><span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.hapticFeedbackEnabled ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                    <div className="flex justify-between items-center"><span className="text-slate-300">Chequeo de Preparación (Pre-Entreno)</span><button onClick={() => handleSettingChange('readinessCheckEnabled', !pendingSettings.readinessCheckEnabled)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.readinessCheckEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}><span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.readinessCheckEnabled ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                </div>
            </SettingsCard>

            <SettingsCard title="Sincronización y Datos" icon={<CloudIcon/>}>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-white mb-2">Google Drive</h4>
                        {!drive.isSupported ? <p className="text-sm text-yellow-400">La sincronización no está configurada. El desarrollador necesita añadir un Client ID de Google.</p> : drive.isAuthLoading ? <p className="text-sm text-slate-400">Verificando...</p> : drive.isSignedIn && drive.user ? (
                            <div className="space-y-4"><div className="flex items-center gap-3 glass-card-nested p-2 rounded-lg"><img src={drive.user.picture} alt="User" className="w-10 h-10 rounded-full" /><div><p className="font-semibold text-white">{drive.user.name}</p><p className="text-xs text-slate-400">{drive.user.email}</p></div></div><div className="text-xs text-slate-400">Última sinc.: {drive.lastSyncDate ? new Date(drive.lastSyncDate).toLocaleString() : 'Nunca'}</div><div className="grid grid-cols-2 gap-2"><Button onClick={drive.syncToDrive} isLoading={drive.isSyncing} variant="secondary" disabled={!isOnline}><UploadCloudIcon size={16}/> Sincronizar</Button><Button onClick={drive.loadFromDrive} isLoading={drive.isLoading} variant="secondary" disabled={!isOnline}><DownloadCloudIcon size={16}/> Cargar</Button></div><Button onClick={drive.signOut} variant="danger" className="w-full">Cerrar Sesión</Button></div>
                        ) : (
                            <div className="space-y-3"><p className="text-sm text-slate-400">Guarda tus datos de forma segura en tu Google Drive.</p><Button onClick={drive.signIn} className="w-full" disabled={!isOnline}>Iniciar Sesión con Google</Button></div>
                        )}
                        <div className="flex justify-between items-center mt-4"><span className="text-slate-300">Sincronización automática</span><button onClick={() => handleSettingChange('autoSyncEnabled', !pendingSettings.autoSyncEnabled)} disabled={!isOnline} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none disabled:opacity-50 ${pendingSettings.autoSyncEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}><span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                    </div>
                    <div className="pt-4 border-t border-slate-700/50">
                        <h4 className="font-semibold text-white mb-2">Gestión de Datos Locales</h4>
                        <div className="space-y-3">
                            <h5 className="font-medium text-slate-300">Copia de Seguridad (Datos de Usuario)</h5>
                            <div className="grid grid-cols-2 gap-2">
                               <Button onClick={handleExportData} variant="secondary"><DownloadIcon size={16}/> Exportar Datos</Button>
                               <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportData} />
                               <Button onClick={() => fileInputRef.current?.click()} variant="secondary"><UploadIcon size={16}/> Importar Datos</Button>
                            </div>

                            <h5 className="font-medium text-slate-300 pt-3">Base de Datos de Ejercicios</h5>
                            <div className="grid grid-cols-2 gap-2">
                               <Button onClick={exportExerciseDatabase} variant="secondary"><DownloadIcon size={16}/> Exportar DB</Button>
                               <input type="file" ref={dbFileInputRef} className="hidden" accept=".json" onChange={handleImportDb} />
                               <Button onClick={() => dbFileInputRef.current?.click()} variant="secondary"><UploadIcon size={16}/> Importar DB</Button>
                            </div>
                            <p className="text-xs text-slate-500 pt-1">Importar una base de datos reemplazará tu lista de ejercicios actual. Útil para compartir o actualizar la información por defecto de la app.</p>

                            <h5 className="font-medium text-slate-300 pt-3">Snapshots (Datos de Usuario)</h5>
                            <Button onClick={handleCreateSnapshot} className="w-full"><PlusCircleIcon size={16}/> Crear Copia Local</Button>
                            <div className="space-y-2 max-h-48 overflow-y-auto">{snapshots.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(snapshot => (<div key={snapshot.id} className="glass-card-nested p-2 rounded-md flex justify-between items-center text-sm"><div><p className="font-semibold text-slate-200">{snapshot.name}</p><p className="text-xs text-slate-400">{new Date(snapshot.date).toLocaleString()}</p></div><div className="flex gap-1"><Button onClick={() => handleRestoreSnapshot(snapshot.id)} variant="secondary" className="!p-2"><SaveIcon size={14}/></Button><Button onClick={() => handleDeleteSnapshot(snapshot.id)} variant="danger" className="!p-2"><TrashIcon size={14}/></Button></div></div>))}</div>
                        </div>
                    </div>
                </div>
            </SettingsCard>
            
            <SettingsCard title="Notificaciones" icon={<BellIcon/>}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-slate-300">Activar recordatorios</span><button onClick={() => handleSettingChange('remindersEnabled', !pendingSettings.remindersEnabled)} className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none ${pendingSettings.remindersEnabled ? 'bg-primary-color' : 'bg-slate-600'}`}><span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${pendingSettings.remindersEnabled ? 'translate-x-5' : 'translate-x-0'}`} /></button></div>
                    {pendingSettings.remindersEnabled && (
                        <div><label className="block text-sm text-slate-300 mb-1">Hora del recordatorio</label><input type="time" value={pendingSettings.reminderTime || '17:00'} onChange={(e) => handleSettingChange('reminderTime', e.target.value)} className="w-full"/></div>
                    )}
                    <p className="text-xs text-slate-500">Recibirás notificaciones en los días de la semana que tengas sesiones asignadas.</p>
                </div>
            </SettingsCard>

            <SettingsCard title="Instalar Aplicación" icon={<DownloadIcon/>}>
                {installPromptEvent ? (
                    <div><p className="text-sm text-slate-400 mb-4">Instala YourPrime en tu dispositivo para un acceso más rápido y una experiencia de aplicación nativa.</p><Button onClick={handleInstallClick} className="w-full">Instalar en el dispositivo</Button></div>
                ) : (
                    <p className="text-sm text-slate-400">La aplicación ya está instalada o tu navegador no soporta la instalación.</p>
                )}
            </SettingsCard>
        </div>
    );
};

export default SettingsComponent;