import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User, AuthUser } from '../types';
import { ADMIN_USERNAME, ADMIN_PASSWORD, BREVO_API_KEY, BREVO_API_URL_CONTACTS } from '../constants';
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

  const register = useCallback(async (userData: Omit<User, 'id' | 'registrationDate' | 'password'> & {password?: string}): Promise<boolean> => {
    // IMPORTANT: BREVO_API_KEY is used here directly. 
    // In a production environment, this key should be managed securely on a backend server 
    // and not exposed in the frontend client code. This is for demonstration purposes only.
    if (!BREVO_API_KEY) {
        console.error("Brevo API key is not configured.");
        alert("Registration service is currently unavailable. Missing API configuration.");
        return false;
    }

    const brevoPayload = {
      email: userData.email,
      attributes: {
        FIRSTNAME: userData.name,
        LASTNAME: userData.lastName,
        COUNTRY: userData.country,
        USERNAME: userData.username // Assuming USERNAME is a custom attribute in Brevo
      },
      // You might want to add new contacts to a specific list in Brevo
      // listIds: [YOUR_BREVO_LIST_ID] 
    };

    try {
      const response = await fetch(BREVO_API_URL_CONTACTS, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': BREVO_API_KEY,
          'content-type': 'application/json',
        },
        body: JSON.stringify(brevoPayload),
      });

      if (response.ok) { // Status 201 (Created) or 204 (Contact updated) are typical success
        // const responseData = await response.json(); // Brevo might return contact ID or empty on 204
        // console.log("Brevo contact created/updated:", responseData);
        // Registration with Brevo successful, but user is NOT logged into the local system.
        // The local login system relies on localStorage which is not populated here.
        return true;
      } else {
        const errorData = await response.json();
        console.error('Brevo API error:', errorData);
        let errorMessage = 'Registration failed. Please try again.';
        if (errorData && errorData.message) {
            if (errorData.code === 'duplicate_parameter') {
                errorMessage = 'This email address is already registered.';
            } else {
                errorMessage = `Registration failed: ${errorData.message}`;
            }
        }
        alert(errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Error registering contact with Brevo:', error);
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