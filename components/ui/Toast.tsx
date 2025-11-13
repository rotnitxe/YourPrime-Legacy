// components/ui/Toast.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircleIcon, TrophyIcon, LightbulbIcon, XIcon, AlertTriangleIcon } from '../icons';
import { ToastData } from '../../types';

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

const ICONS = {
    success: <CheckCircleIcon className="text-green-300" />,
    achievement: <TrophyIcon className="text-yellow-300" />,
    suggestion: <LightbulbIcon className="text-sky-300" />,
    danger: <AlertTriangleIcon className="text-red-400" />,
};

const BORDER_COLORS = {
    success: 'border-green-500/50',
    achievement: 'border-yellow-500/50',
    suggestion: 'border-sky-500/50',
    danger: 'border-red-500/50',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300); // Wait for exit animation
  }, [onDismiss, toast.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast, handleDismiss]);

  return (
    <div
      className={`relative w-full max-w-md p-3 sm:p-4 rounded-xl shadow-2xl z-[100] pointer-events-auto
                  bg-slate-800/80 backdrop-blur-md border ${BORDER_COLORS[toast.type]}
                  transition-all duration-300 ease-in-out
                  ${isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
        <div className="flex-grow">
          <p className="font-bold text-white">{toast.title || 'Notificación'}</p>
          <p className="text-sm text-slate-300">{toast.message}</p>
        </div>
        <button onClick={handleDismiss} className="p-1 -m-1 text-slate-400 hover:text-white flex-shrink-0" aria-label="Cerrar">
          <XIcon size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;