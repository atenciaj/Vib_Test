import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, AuthUser } from '../types';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../constants';
import { useNavigate } from 'react-router-dom';
import { PendingUser, savePendingUser } from '../utils/tempStorage';
import { generateClientToken } from '../utils/validation';
import { BREVO_PROXY_VERIFICATION_ENDPOINT } from '../constants';

interface AuthContextType {
  currentUser: AuthUser | null;
  login: (usernameInput: string, passwordInput: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'registrationDate' | 'password'> & {password?: string}) => Promise<boolean>; // Password becomes optional for Brevo
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'vibTestAuth';
// USERS_STORAGE_KEY is no longer used for new registrations, only for local login of pre-existing users or admin.
const USERS_STORAGE_KEY = 'vibTestRegisteredUsers';

// Define the backend proxy endpoint URL
// IMPORTANT: In a production environment, this URL should be read from environment variables
// or a configuration file, not hardcoded. For local development, this is fine.
// MODIFICADO: Apunta a la URL de la función de Firebase desplegada
const BREVO_PROXY_REGISTER_ENDPOINT = 'https://us-central1-vib-test-d5aec.cloudfunctions.net/api/brevo-proxy/register-contact'; // Reemplaza con la URL real de tu función si es diferente

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const authData: AuthUser = JSON.parse(storedAuth);
        setCurrentUser(authData);
      } catch (e) {
        console.error("Error parsing stored auth data:", e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
      const adminUser: AuthUser = { id: 'admin_id', username: ADMIN_USERNAME, name: 'Admin', userType: 'admin' };
      setCurrentUser(adminUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      return true;
    }

    // This part will only work for users registered with the old localStorage method.
    // New users registered via Brevo won't be found here for login.
    const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]') as User[];
    const foundUser = storedUsers.find(
      (user) => user.username === usernameInput && user.password === passwordInput
    );

    if (foundUser) {
      const authUser: AuthUser = { id: foundUser.id, username: foundUser.username, name: foundUser.name, userType: 'user' };
      setCurrentUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (userData: Omit<User, 'id' | 'registrationDate' | 'password'> & { password?: string }): Promise<boolean> => {
    // Generar token de verificación
    const verificationToken = generateClientToken();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 horas
    
    // Crear usuario pendiente de verificación
    const pendingUser: PendingUser = {
      ...userData,
      verificationToken,
      verificationTokenExpiry,
      createdAt: new Date().toISOString(),
      isEmailVerified: false,
      registrationStatus: 'pending'
    };
    
    // Guardar usuario pendiente localmente
    savePendingUser(pendingUser);
    
    // Preparar payload para el backend (nuevo endpoint de verificación)
    const payloadToSendToBackend = {
      email: userData.email,
      attributes: {
        FIRSTNAME: userData.name,
        LASTNAME: userData.lastName,
        COUNTRY: userData.country,
        USERNAME: userData.username
      },
      verificationToken,
      frontendUrl: window.location.origin // URL base de tu frontend
    };

    try {
      // Llamar al nuevo endpoint de verificación
      const response = await fetch(BREVO_PROXY_VERIFICATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify(payloadToSendToBackend),
      });

      if (response.ok) {
        console.log("Email de verificación enviado exitosamente.");
        return true;
      } else {
        const errorData = await response.json();
        console.error('Error enviando email de verificación:', errorData);
        let errorMessage = 'Error enviando email de verificación. Intenta nuevamente.';
        if (errorData && errorData.message) {
          if (errorData.code === 'duplicate_parameter') {
            errorMessage = 'Este email ya está registrado.';
          } else {
            errorMessage = `Error: ${errorData.message}`;
          }
        }
        alert(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error de red enviando email de verificación:', error);
      alert('Error de conexión. Intenta nuevamente más tarde.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    navigate('/login');
  }, [navigate]);

  const isAuthenticated = useCallback((): boolean => {
    return !!currentUser;
  }, [currentUser]);


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading authentication...</p></div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};