// components/ImageSearchModal.tsx
import React, { useState, useEffect } from 'react';
import { searchGoogleImages } from '../services/aiService';
import { useAppState } from '../contexts/AppContext';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { SearchIcon } from './icons';
import SkeletonLoader from './ui/SkeletonLoader';

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  initialQuery: string;
}

const ImageSearchModal: React.FC<ImageSearchModalProps> = ({ isOpen, onClose, onSelectImage, initialQuery }) => {
  const { settings, isOnline } = useAppState();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setResults([]);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen, initialQuery]);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || !isOnline) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const response = await searchGoogleImages(query, settings);
      setResults(response.imageUrls);
      if (response.imageUrls.length === 0) {
          setError("No se encontraron imágenes para esta búsqueda.");
      }
    } catch (err: any) {
      setError(err.message || 'Error al buscar imágenes.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageClick = (url: string) => {
    onSelectImage(url);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Imagen en la Web">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar imágenes..."
            className="flex-grow"
            disabled={!isOnline}
          />
          <Button type="submit" isLoading={isLoading} disabled={isLoading || !isOnline}>
            <SearchIcon size={16} /> Buscar
          </Button>
        </form>

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-700/50 rounded-lg animate-pulse" />
            ))}
          </div>
        )}
        
        {error && <p className="text-center text-red-400">{error}</p>}
        
        {results.length > 0 && !isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto">
            {results.map((url, i) => (
              <button key={i} onClick={() => handleImageClick(url)} className="aspect-square bg-slate-800 rounded-lg overflow-hidden focus:outline-none focus:ring-2 ring-primary-color ring-offset-2 ring-offset-slate-900">
                <img src={url} alt={`Search result ${i + 1}`} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageSearchModal;
