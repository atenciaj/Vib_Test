// src/utils/validation.ts
export const generateClientToken = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };
  
  export const isTokenExpired = (expiryDate: string): boolean => {
    return new Date() > new Date(expiryDate);
  };
  
  export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };