// src/features/auth/EmailVerificationPage.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { findPendingUserByToken, removePendingUser } from '../../utils/tempStorage';
import { isTokenExpired } from '../../utils/validation';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setVerificationStatus('invalid');
      setMessage('Token de verificación no encontrado en la URL');
      return;
    }
    
    verifyEmail(token);
  }, [searchParams]);

  // Contador para redirección automática
  useEffect(() => {
    if (verificationStatus === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (verificationStatus === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [verificationStatus, countdown, navigate]);
  
  const verifyEmail = (token: string) => {
    try {
      // Buscar usuario pendiente por token
      const pendingUser = findPendingUserByToken(token);
      
      if (!pendingUser) {
        setVerificationStatus('invalid');
        setMessage('Token de verificación inválido o no encontrado');
        return;
      }
      
      // Verificar si el token ha expirado
      if (isTokenExpired(pendingUser.verificationTokenExpiry)) {
        setVerificationStatus('expired');
        setMessage('El token de verificación ha expirado. Solicita un nuevo registro.');
        return;
      }
      
      // Si llegamos aquí, la verificación es exitosa
      // TODO: Aquí deberías llamar al backend para completar el registro en Brevo
      // Por ahora solo removemos de pendientes
      removePendingUser(pendingUser.email);
      
      setVerificationStatus('success');
      setMessage('¡Email verificado exitosamente! Tu cuenta ha sido activada.');
      
    } catch (error) {
      console.error('Error verificando email:', error);
      setVerificationStatus('error');
      setMessage('Error interno al verificar el email. Intenta nuevamente.');
    }
  };
  
  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Verificando email...</h2>
            <p className="text-gray-600">Por favor espera mientras procesamos tu verificación.</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">¡Verificación Exitosa!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Redirigiendo al login en {countdown} segundos...
            </p>
            <Link 
              to="/login"
              className="inline-flex items-center bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Ir al Login ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        );
        
      case 'expired':
        return (
          <div className="text-center">
            <Clock className="mx-auto h-16 w-16 text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Token Expirado</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <Link 
              to="/register"
              className="inline-flex items-center bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600"
            >
              Registrarse nuevamente
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        );
        
      case 'error':
      case 'invalid':
        return (
          <div className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Error de Verificación</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="space-y-2">
              <Link 
                to="/register"
                className="block w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
              >
                Intentar registro nuevamente
              </Link>
              <Link 
                to="/login"
                className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                Ir al Login
              </Link>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  );
};