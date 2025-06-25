import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, AuthUser } from '../types';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../constants';
import { useNavigate } from 'react-router-dom';

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
    // Prepare the payload to send to the backend proxy
    // The backend proxy expects email and attributes
    const payloadToSendToBackend = {
      email: userData.email,
      attributes: {
        FIRSTNAME: userData.name,
        LASTNAME: userData.lastName,
        COUNTRY: userData.country,
        USERNAME: userData.username // Assuming USERNAME is a custom attribute in Brevo
      },
    }

    try {
      // Call the backend proxy endpoint
      const response = await fetch(BREVO_PROXY_REGISTER_ENDPOINT, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
        },
        body: JSON.stringify(payloadToSendToBackend), // Send the payload to the backend
      });

      // The backend proxy should return 200 OK on success
      if (response.ok) {
        // Backend successfully called Brevo API and it succeeded
        console.log("Registration successful via backend proxy.");
        // Depending on your needs, you might want to read response.json() here
        // const responseData = await response.json();
        // console.log("Backend proxy response:", responseData);
        return true;
      } else {
        // The backend proxy returned an error status (e.g., 400, 409, 500)
        const errorData = await response.json();
        // Asegúrate de que error.response exista antes de acceder a status
        const errorStatus = error && error.response && error.response.status ? error.response.status : 'Unknown';
        console.error('Backend proxy registration error:', errorStatus, errorData); // Log backend error
        let errorMessage = 'Registration failed. Please try again.';
        if (errorData && errorData.message) {
            // Customize error messages based on backend response structure
            if (errorData.code === 'duplicate_parameter') { // Assuming backend passes Brevo's code
                errorMessage = 'This email address is already registered.';
            } else {
                errorMessage = `Registration failed: ${errorData.message}`;
            }
        }
        alert(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Network error or unhandled error calling backend proxy:', error);
      alert('An unexpected error occurred during registration. Please try again later.');
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
