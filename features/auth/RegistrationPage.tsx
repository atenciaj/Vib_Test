import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User as UserIcon, Lock, Mail, MapPin, UserPlus } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const RegistrationPage: React.FC = () => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState(''); // Password field remains for form structure, but not sent to Brevo
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Eliminado: Validación del dominio del correo electrónico
    // if (!email.toLowerCase().endsWith('@vib-test.ltd')) {
    //   setError('Registration email must be from the vib-test.ltd domain.');
    //   setIsLoading(false);
    //   return;
    // }

    // Basic password validation for the field, even if not used by Brevo
    if (password.length > 0 && (password.length < 4 || !/^\d{4,}$/.test(password))) {
        setError("If providing a password, it must be at least 4 numeric digits.");
        setIsLoading(false);
        return;
    }

    try {
      // Pass all fields; AuthContext's register function will decide what to send to Brevo
      const success = await register({ name, lastName, email, username, country, password });
      if (success) {
        alert('Registration successful! Your contact has been added. You will be redirected to the login page.');
        navigate('/login');
      } else {
        // Error handling is managed within AuthContext (e.g., alerts for existing user or API errors)
        // setError('Registration failed. Please check the details and try again.'); // This might be redundant if AuthContext alerts.
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClasses = "w-full py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-light";
  const darkInputClasses = `${inputBaseClasses} bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400`;
  const darkInputWithIconClasses = `${darkInputClasses} pl-10 pr-3`;
  const darkInputNoIconClasses = `${darkInputClasses} px-3`;


  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 bg-background">
      <div className="w-full max-w-lg p-8 space-y-8 bg-card rounded-xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-textPrimary">User Registration</h1>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-textSecondary mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={darkInputNoIconClasses}
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-textSecondary mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={darkInputNoIconClasses}
                placeholder="Your last name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={darkInputWithIconClasses}
                placeholder="your.name@example.com" // Changed placeholder
              />
            </div>
            {/* Eliminado: Mensaje de restricción de dominio */}
            {/* <p className="mt-1 text-xs text-textSecondary">Email must be from the vib-test.ltd domain.</p> */}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-textSecondary mb-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={darkInputWithIconClasses}
                placeholder="Username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-textSecondary mb-1">
              Country
            </label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="country"
                name="country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={darkInputWithIconClasses}
                placeholder="Enter your country"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-1">
              Password (Optional, min 4 digits)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                // not strictly required if Brevo is the main sink
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={darkInputWithIconClasses}
                placeholder="4 numeric digits (optional)"
              />
            </div>
            <p className="mt-1 text-xs text-textSecondary">Password (if provided) must be 4 numeric digits. Not used for Brevo.</p>
          </div>

          {error && <p className="text-sm text-red-600 text-center py-2">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-accent hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size={20} /> : <UserPlus className="h-5 w-5 mr-2" />}
              Register
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-textSecondary">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
