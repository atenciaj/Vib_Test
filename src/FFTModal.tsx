import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface FFTModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FFTModal: React.FC<FFTModalProps> = ({ isOpen, onClose }) => {
  const FFT_SIM_URL = 'https://fft-sim-12345.web.app';
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isFullscreen) {
      onClose();
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const modalClasses = isFullscreen 
    ? "fixed inset-0 bg-white z-50 flex flex-col" 
    : "bg-white rounded-lg shadow-xl w-full h-5/6 flex flex-col";

  const containerClasses = isFullscreen
    ? "fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
    : "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4";

  const maxWidth = isFullscreen ? "" : "max-w-7xl"; // Aumentado de max-w-6xl a max-w-7xl

  return (
    <div 
      className={containerClasses}
      onClick={handleBackdropClick}
    >
      <div className={`${modalClasses} ${maxWidth}`} style={isFullscreen ? {} : { height: '95vh', width: '98vw' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-semibold text-gray-800">FFT-SIM</h2>
            <span className="text-sm text-gray-500">Simulador FFT</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {isFullscreen ? 'Pantalla Completa' : 'Modal'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 mr-1" /> : <Maximize2 className="w-4 h-4 mr-1" />}
              {isFullscreen ? 'Reducir' : 'Ampliar'}
            </button>
            <a
              href={FFT_SIM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors rounded-md hover:bg-blue-50"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Nueva pestaña
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-2 sm:p-4 overflow-hidden">
          <iframe
            src={FFT_SIM_URL}
            className="w-full h-full border border-gray-200 rounded-lg shadow-inner"
            title="FFT-SIM Application"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            style={{ minHeight: '500px' }}
          />
        </div>

        {/* Footer - Solo mostrar si no está en fullscreen */}
        {!isFullscreen && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 flex items-center space-x-4">
              <span>
                Presiona <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd> para cerrar
              </span>
              <span className="text-gray-400">|</span>
              <button 
                onClick={toggleFullscreen}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clic en "Ampliar" para pantalla completa
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Ampliar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};