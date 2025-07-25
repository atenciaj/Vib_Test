import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react'; // CAMBIADO: Mail en lugar de UserIcon
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(''); // CAMBIADO: email en lugar de username
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const success = await login(email, password); // CAMBIADO: email en lugar de username
      if (success) {
        // Check if admin to redirect appropriately
        if (email === 'admin') { // CAMBIADO: email en lugar de username
            navigate('/admin/dashboard');
        } else {
            navigate('/');
        }
      } else {
        setError('Invalid email or password.'); // CAMBIADO: mensaje de error
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const inputBaseClasses = "w-full py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light";
  const darkInputClasses = `${inputBaseClasses} bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400`;
  const darkInputWithIconClasses = `${darkInputClasses} pl-10 pr-3`;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-textPrimary">Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">
              Email or Admin {/* CAMBIADO: Clarificar que acepta admin también */}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" /> {/* CAMBIADO: Mail icon */}
              </div>
              <input
                id="email" /* CAMBIADO: id */
                name="email" /* CAMBIADO: name */
                type="text" /* CORREGIDO: text en lugar de email para permitir "admin" */
                autoComplete="email" /* CAMBIADO: autoComplete */
                required
                value={email} /* CAMBIADO: value */
                onChange={(e) => setEmail(e.target.value)} /* CAMBIADO: onChange */
                className={darkInputWithIconClasses}
                placeholder="Enter your email or admin" /* CAMBIADO: placeholder más claro */
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={darkInputWithIconClasses}
                placeholder="4 digits for users"
              />
            </div>
            <p className="mt-1 text-xs text-textSecondary">Password: 4 numeric digits for users.</p>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size={20} /> : <LogIn className="h-5 w-5 mr-2" />}
              Login
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-textSecondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};