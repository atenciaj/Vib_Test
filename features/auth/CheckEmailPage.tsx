// src/features/auth/CheckEmailPage.tsx
import React, { useState } from 'react';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CheckEmailPage: React.FC = () => {
  const [isResending, setIsResending] = useState(false);
  
  const handleResendEmail = async () => {
    setIsResending(true);
    // Por ahora solo simulamos el reenvío
    setTimeout(() => {
      setIsResending(false);
      alert('Email reenviado (funcionalidad pendiente de implementar)');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <Mail className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Verifica tu Email</h2>
        <p className="text-gray-600 mb-6">
          Hemos enviado un email de verificación a tu dirección de correo. 
          Haz clic en el enlace del email para activar tu cuenta.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="flex items-center justify-center w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            {isResending ? 'Enviando...' : 'Reenviar Email'}
          </button>
          
          <Link 
            to="/login"
            className="flex items-center justify-center w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
};