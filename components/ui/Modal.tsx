import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from '../icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className = '' }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Body overflow is handled by a global useEffect in App.tsx
      window.addEventListener('keydown', handleKeyDown);
    } 

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[65] flex items-center justify-center p-4 overflow-hidden"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 w-full max-w-lg modal-content rounded-2xl shadow-xl overflow-hidden flex flex-col
                   animate-modal-enter max-h-[90vh] ${className}`}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border-color flex-shrink-0">
            <h2 id="modal-title" className="text-xl font-bold text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <XIcon size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;