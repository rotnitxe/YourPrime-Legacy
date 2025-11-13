// components/SessionBackgroundModal.tsx
import React, { useState, useRef } from 'react';
import { SessionBackground } from '../types';
import { generateImage } from '../services/aiService';
import { optimizeImage } from '../services/imageService';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { SparklesIcon, UploadIcon, PaletteIcon } from './icons';
import { useAppState } from '../contexts/AppContext';

interface BackgroundEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (background?: SessionBackground) => void;
  initialBackground?: SessionBackground;
  previewTitle: string;
  isOnline: boolean;
}

const PRESET_COLORS = [
  '#000000',
  '#1e293b', '#334155', '#475569', // Slate
  '#3f3f46', '#52525b', '#71717a', // Zinc
  '#b91c1c', '#dc2626', '#f87171', // Red
  '#c2410c', '#ea580c', '#fb923c', // Orange
  '#166534', '#16a34a', '#4ade80', // Green
  '#1d4ed8', '#2563eb', '#60a5fa', // Blue
  '#7e22ce', '#9333ea', '#c084fc', // Purple
  '#be185d', '#db2777', '#f472b6', // Pink
];

const BackgroundEditorModal: React.FC<BackgroundEditorModalProps> = ({ isOpen, onClose, onSave, initialBackground, previewTitle, isOnline }) => {
  const { settings } = useAppState();
  const [activeTab, setActiveTab] = useState<'color' | 'ai' | 'upload'>('color');
  const [background, setBackground] = useState<SessionBackground | undefined>(initialBackground);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateBg = (bg: Partial<SessionBackground>) => {
    setBackground(prev => ({ ...(prev || { type: 'color', value: '' }), ...bg }));
  };
  
  const handleUpdateStyle = (style: Partial<SessionBackground['style']>) => {
    setBackground(prev => {
        if (!prev || prev.type !== 'image') return prev;
        return { ...prev, style: { ...(prev.style || { blur: 2, brightness: 0.5 }), ...style }};
    });
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt || !isOnline) return;
    setIsLoading(true);
    try {
        const fullPrompt = `cinematic fitness wallpaper, ${aiPrompt}, dramatic lighting, high quality photo`;
        const rawImageUrl = await generateImage(fullPrompt, settings);
        const optimizedUrl = await optimizeImage(rawImageUrl);
        handleUpdateBg({ type: 'image', value: optimizedUrl, style: { blur: 2, brightness: 0.5 } });
    } catch (error) {
        console.error("Error generating image", error);
        alert("No se pudo generar la imagen. Inténtalo de nuevo.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawImageUrl = reader.result as string;
        const optimizedUrl = await optimizeImage(rawImageUrl);
        handleUpdateBg({ type: 'image', value: optimizedUrl, style: { blur: 2, brightness: 0.5 } });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
      onSave(background);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Fondo para: ${previewTitle}`}>
      <div className="space-y-4">
        {/* Preview */}
        <div className="relative glass-card h-28 w-full !rounded-xl overflow-hidden flex items-center justify-center p-2">
            {background && (
                 <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300 z-0"
                    style={{
                        backgroundColor: background.type === 'color' ? background.value : 'transparent',
                        backgroundImage: background.type === 'image' ? `url(${background.value})` : 'none',
                        filter: background.type === 'image' ? `blur(${background.style?.blur || 0}px) brightness(${background.style?.brightness ?? 0.7})` : 'none',
                    }}
                 />
            )}
             {background?.type === 'image' && <div className="absolute inset-0 bg-black/40 z-0" />}
            <span className="relative z-10 text-white font-bold text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{previewTitle}</span>
        </div>

        {/* Image Style Controls */}
        {background?.type === 'image' && (
            <div className="bg-slate-900/50 p-3 rounded-lg space-y-3 animate-fade-in">
                <div>
                    <label htmlFor="blur" className="text-sm font-medium text-slate-300">Desenfoque: {background.style?.blur || 0}px</label>
                    <input id="blur" type="range" min="0" max="20" step="1" value={background.style?.blur || 0} onChange={(e) => handleUpdateStyle({ blur: parseInt(e.target.value, 10)})} className="w-full" />
                </div>
                 <div>
                    <label htmlFor="brightness" className="text-sm font-medium text-slate-300">Brillo: {Math.round((background.style?.brightness || 0.5) * 100)}%</label>
                    <input id="brightness" type="range" min="0.1" max="1" step="0.05" value={background.style?.brightness || 0.5} onChange={(e) => handleUpdateStyle({ brightness: parseFloat(e.target.value)})} className="w-full" />
                </div>
            </div>
        )}

        {/* Tabs */}
        <div className="flex bg-slate-800 p-1 rounded-full">
            <button onClick={() => setActiveTab('color')} className={`flex-1 py-1 rounded-full text-sm flex items-center justify-center gap-1 ${activeTab === 'color' ? 'bg-primary-color' : ''}`}><PaletteIcon size={14}/> Color</button>
            <button onClick={() => setActiveTab('ai')} disabled={!isOnline} className={`flex-1 py-1 rounded-full text-sm flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'ai' ? 'bg-primary-color' : ''}`}><SparklesIcon size={14}/> Generar IA</button>
            <button onClick={() => setActiveTab('upload')} className={`flex-1 py-1 rounded-full text-sm flex items-center justify-center gap-1 ${activeTab === 'upload' ? 'bg-primary-color' : ''}`}><UploadIcon size={14}/> Subir</button>
        </div>

        {/* Tab Content */}
        <div>
            {activeTab === 'color' && (
                <div className="grid grid-cols-6 gap-2 animate-fade-in">
                    {PRESET_COLORS.map(color => (
                        <button key={color} onClick={() => handleUpdateBg({type: 'color', value: color})} style={{backgroundColor: color}} className={`w-full h-10 rounded-md border-2 ${background?.value === color ? 'border-white' : 'border-transparent'}`}></button>
                    ))}
                </div>
            )}
            {activeTab === 'ai' && (
                <div className="space-y-2 animate-fade-in">
                    <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Ej: Atleta levantando pesas" className="w-full bg-slate-800 border-slate-700 rounded-md p-2" disabled={isLoading || !isOnline}/>
                    <Button onClick={handleGenerateImage} isLoading={isLoading} disabled={!aiPrompt || !isOnline} className="w-full"><SparklesIcon size={16}/> Generar</Button>
                </div>
            )}
            {activeTab === 'upload' && (
                <div className="animate-fade-in">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleUploadImage} />
                    <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full"><UploadIcon size={16}/> Subir desde Dispositivo</Button>
                </div>
            )}
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center gap-2 pt-4 border-t border-slate-700">
            <Button onClick={() => setBackground(undefined)} variant="danger">Quitar Fondo</Button>
            <div className="flex gap-2">
                 <Button onClick={onClose} variant="secondary">Cancelar</Button>
                <Button onClick={handleSave} variant="primary">Guardar</Button>
            </div>
        </div>
      </div>
    </Modal>
  );
};

export default BackgroundEditorModal;