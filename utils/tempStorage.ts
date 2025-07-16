// src/utils/tempStorage.ts
export interface PendingUser {
    name: string;
    lastName: string;
    email: string;
    username: string;
    country: string;
    password?: string;
    verificationToken: string;
    verificationTokenExpiry: string;
    createdAt: string;
    isEmailVerified: boolean;
    registrationStatus: 'pending' | 'verified' | 'expired';
  }
  
  const PENDING_USERS_KEY = 'vibTestPendingUsers';
  
  export const savePendingUser = (userData: PendingUser): void => {
    const pending = getPendingUsers();
    pending.push(userData);
    localStorage.setItem(PENDING_USERS_KEY, JSON.stringify(pending));
  };
  
  export const getPendingUsers = (): PendingUser[] => {
    const stored = localStorage.getItem(PENDING_USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  };
  
  export const removePendingUser = (email: string): void => {
    const pending = getPendingUsers();
    const filtered = pending.filter(user => user.email !== email);
    localStorage.setItem(PENDING_USERS_KEY, JSON.stringify(filtered));
  };
  
  export const findPendingUserByToken = (token: string): PendingUser | null => {
    const pending = getPendingUsers();
    return pending.find(user => user.verificationToken === token) || null;
  };