import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Home, ListChecks, FileText, BookOpen, Brain, Activity, Settings, AlertTriangle, ChevronDown, ChevronRight, X, Menu, LogIn, UserPlus, LogOut, ShieldCheck, UserCog, Terminal } from 'lucide-react';

import { DashboardPage } from './features/dashboard/DashboardPage';
import { ExamSelectionPage } from './features/exam/ExamSelectionPage';
import { ExamInProgressPage } from './features/exam/ExamInProgressPage';
import { ExamResultsPage } from './features/exam/ExamResultsPage';
import { CaseStudyGeneratorPage } from './features/case-studies/CaseStudyGeneratorPage';
import { ResourcesPage } from './features/resources/ResourcesPage';
import { ExamProvider } from './contexts/ExamContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ApiKeyManager } from './components/ApiKeyManager';
import { FFTModal } from './src/FFTModal';

// Auth Pages
import { LoginPage } from './features/auth/LoginPage';
import { RegistrationPage } from './features/auth/RegistrationPage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { EmailVerificationPage } from './features/auth/EmailVerificationPage';
import { CheckEmailPage } from './features/auth/CheckEmailPage';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home, requiresAuth: false },
  { path: '/exam-selection', label: 'Exam Simulation', icon: ListChecks, requiresAuth: false },
  { path: '/case-studies', label: 'AI Case Studies', icon: Brain, requiresAuth: false },
  { path: '/resources', label: 'Resources', icon: BookOpen, requiresAuth: false },
];

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { currentUser, isAuthenticated } = useAuth();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && currentUser?.userType !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showFFTModal, setShowFFTModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    const key = localStorage.getItem('GEMINI_API_KEY') || process.env.API_KEY;
    setIsApiKeySet(!!key);
  }, [location.pathname]); 

  useEffect(() => {
    setIsMobileMenuOpen(false); 
  }, [location.pathname]);

  const handleApiKeyUpdate = (isSet: boolean) => {
    setIsApiKeySet(isSet);
    setShowApiKeyModal(false);
  };

  const NavLinkItem: React.FC<{ path: string; label: string; icon: React.ElementType, onClick?: () => void }> = ({ path, label, icon: Icon, onClick }) => (
    <NavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out ${
          isActive ? 'bg-primary-dark text-white shadow-md' : 'text-gray-200 hover:bg-primary-light hover:text-white'
        }`
      }
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </NavLink>
  );
  
  const AuthLinkItem: React.FC<{ path: string; label: string; icon: React.ElementType, onClick?: () => void, className?: string }> = ({ path, label, icon: Icon, onClick, className }) => (
     <Link
      to={path}
      onClick={onClick}
      className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors ${className}`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </Link>
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* Estilos CSS para el botón Gaming/Terminal */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes glitch {
          0% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          100% { transform: translateX(0); }
        }

        .fft-gaming-button {
          background: #0d1117;
          color: #00ff41;
          border: 2px solid #00ff41;
          padding: 10px 20px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 13px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 0 10px rgba(0, 255, 65, 0.3),
            inset 0 0 10px rgba(0, 255, 65, 0.1);
        }

        .fft-gaming-button::before {
          content: '>';
          position: absolute;
          left: 8px;
          animation: blink 1.5s infinite;
          font-weight: bold;
        }

        .fft-gaming-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.2), transparent);
          transition: left 0.5s;
        }

        .fft-gaming-button:hover {
          background: #00ff41;
          color: #0d1117;
          box-shadow: 
            0 0 20px #00ff41,
            0 0 40px rgba(0, 255, 65, 0.5),
            inset 0 0 20px rgba(0, 255, 65, 0.1);
          animation: glitch 0.3s ease-in-out;
        }

        .fft-gaming-button:hover::after {
          left: 100%;
        }

        .fft-gaming-button .fft-text {
          margin-left: 12px;
          position: relative;
        }

        .fft-gaming-button:hover .fft-text {
          text-shadow: 0 0 5px rgba(13, 17, 23, 0.8);
        }

        /* Versión móvil */
        .fft-gaming-button-mobile {
          background: #0d1117;
          color: #00ff41;
          border: 2px solid #00ff41;
          width: 100%;
          padding: 12px 16px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 14px;
          font-family: 'Courier New', 'Monaco', 'Lucida Console', monospace;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 
            0 0 10px rgba(0, 255, 65, 0.3),
            inset 0 0 10px rgba(0, 255, 65, 0.1);
        }

        .fft-gaming-button-mobile::before {
          content: '>';
          animation: blink 1.5s infinite;
          font-weight: bold;
        }

        .fft-gaming-button-mobile:hover {
          background: #00ff41;
          color: #0d1117;
          box-shadow: 
            0 0 20px #00ff41,
            0 0 40px rgba(0, 255, 65, 0.5);
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .fft-gaming-button .fft-text {
            display: none;
          }
          .fft-gaming-button {
            padding: 10px 16px;
          }
        }
      `}</style>

      <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="text-2xl font-bold flex items-center">
              <Activity className="w-8 h-8 mr-2 text-secondary-light" /> Vib-Test
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => <NavLinkItem key={item.path} {...item} />)}
              {currentUser?.userType === 'admin' && (
                <NavLinkItem path="/admin/dashboard" label="Admin" icon={UserCog} />
              )}
              
              {/* FFT-SIM Button - Gaming Style */}
              <button
                onClick={() => setShowFFTModal(true)}
                className="fft-gaming-button ml-2"
                title="Ejecutar FFT-SIM"
              >
                <Terminal className="w-4 h-4" />
                <span className="fft-text">FFT-SIM</span>
              </button>
              
               <button
                onClick={() => setShowApiKeyModal(true)}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-primary hover:bg-primary-dark text-white transition-colors ml-2"
                title={isApiKeySet ? "API Key is Set" : "Set API Key"}
              >
                <Settings className="w-5 h-5 mr-1 sm:mr-2" /> 
                <span className="hidden sm:inline">API Key</span>
                {isApiKeySet ? <span className="ml-2 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full"></span> : <span className="ml-2 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>}
              </button>
              {isAuthenticated() ? (
                <button onClick={logout} className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-secondary hover:bg-secondary-dark text-white transition-colors">
                    <LogOut className="w-5 h-5 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <>
                  <AuthLinkItem path="/login" label="Login" icon={LogIn} className="bg-accent hover:bg-green-600" />
                  <AuthLinkItem path="/register" label="Register" icon={UserPlus} className="bg-secondary hover:bg-secondary-dark" />
                </>
              )}
            </div>
            <div className="md:hidden flex items-center">
                {isAuthenticated() ? (
                    <button onClick={logout} className="p-2 mr-2 text-white hover:text-gray-300">
                        <LogOut size={22} />
                    </button>
                ) : (
                    <Link to="/login" className="p-2 mr-2 text-white hover:text-gray-300">
                        <LogIn size={22} />
                    </Link>
                )}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white focus:outline-none">
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-primary-dark">
            <nav className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navItems.map(item => <NavLinkItem key={item.path} {...item} onClick={() => setIsMobileMenuOpen(false)} />)}
              {currentUser?.userType === 'admin' && (
                 <NavLinkItem path="/admin/dashboard" label="Admin Dashboard" icon={UserCog} onClick={() => setIsMobileMenuOpen(false)} />
              )}
              
              {/* FFT-SIM Button Mobile - Gaming Style */}
              <button
                onClick={() => { setShowFFTModal(true); setIsMobileMenuOpen(false); }}
                className="fft-gaming-button-mobile mt-2"
              >
                <Terminal className="w-5 h-5" />
                FFT-SIM
              </button>
              
              <button
                onClick={() => { setShowApiKeyModal(true); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary-light text-gray-200 hover:text-white transition-colors mt-1"
                title={isApiKeySet ? "API Key is Set" : "Set API Key"}
              >
                <Settings className="w-5 h-5 mr-3" /> API Key
                {isApiKeySet ? <span className="ml-auto w-3 h-3 bg-accent rounded-full"></span> : <span className="ml-auto w-3 h-3 bg-red-500 rounded-full"></span>}
              </button>
               {!isAuthenticated() && (
                 <>
                    <NavLinkItem path="/login" label="Login" icon={LogIn} onClick={() => setIsMobileMenuOpen(false)} />
                    <NavLinkItem path="/register" label="Register" icon={UserPlus} onClick={() => setIsMobileMenuOpen(false)} />
                 </>
               )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isApiKeySet && location.pathname.includes('case-studies') && (
          <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
            <div className="flex">
              <div className="py-1"><AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" /></div>
              <div>
                <p className="font-bold">API Key Not Set</p>
                <p className="text-sm">Some features like AI Case Study generation require a Gemini API Key. Please set it using the 'API Key' button in the header.</p>
              </div>
            </div>
          </div>
        )}
        {children}
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Vib-Test. All rights reserved.</p>
        <p className="text-sm">Prepare for your Vibration Analyst Certification with AI.</p>
      </footer>

      {showApiKeyModal && <ApiKeyManager isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} onUpdate={handleApiKeyUpdate} />}
      
      {/* FFT Modal */}
      <FFTModal 
        isOpen={showFFTModal} 
        onClose={() => setShowFFTModal(false)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <ExamProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/exam-selection" element={<ExamSelectionPage />} />
              <Route path="/exam/:category" element={<ExamInProgressPage />} />
              <Route path="/results/:category" element={<ExamResultsPage />} />
              <Route path="/case-studies" element={<CaseStudyGeneratorPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/check-email" element={<CheckEmailPage />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Layout>
        </ExamProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;