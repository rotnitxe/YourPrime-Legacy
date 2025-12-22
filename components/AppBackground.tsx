
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const AppBackground: React.FC = () => { 
    const { ongoingWorkout, activeSession, settings } = useAppContext(); 
    // Fallback to settings background if no session is active, assuming settings.appBackground is the user pref
    const activeImage = ongoingWorkout?.session?.background?.value || activeSession?.background?.value || (settings.appBackground?.type === 'image' ? settings.appBackground.value : undefined);

    return (
        <div className="fixed inset-0 z-[-1] bg-black">
            {/* Gradiente Base */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black" />
            
            {/* Imagen de Fondo Dinámica con Transición */}
            {activeImage && (
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-30 blur-2xl scale-110"
                    style={{ backgroundImage: `url(${activeImage})` }}
                />
            )}
            {/* Malla de puntos (opcional, estilo V3) */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>
    );
}; 

export default AppBackground;
