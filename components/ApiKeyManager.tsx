
import React, { useState, useEffect } from 'react';
import { Key, X, Eye, EyeOff } from 'lucide-react';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (isSet: boolean) => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, onUpdate }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GEMINI_API_KEY');
      if (storedKey) {
        setApiKey(storedKey);
      } else {
        // Check process.env.API_KEY only if nothing is in local storage.
        // This component primarily manages localStorage for user convenience.
        // process.env.API_KEY is more of a build-time/deployment configuration.
        // For this UI, we focus on what the user can set at runtime.
        const envKey = process.env.API_KEY;
        if(envKey) setApiKey(envKey); // Show it if available from env and not in localstorage.
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      onUpdate(true);
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      onUpdate(false);
    }
    onClose();
  };
  
  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('GEMINI_API_KEY');
    onUpdate(false);
    // onClose(); // Optionally close after clearing, or let user save the empty state
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-textPrimary flex items-center">
            <Key className="w-6 h-6 mr-2 text-primary" />
            Set Gemini API Key
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <p className="text-sm text-textSecondary mb-4">
          Your API key is stored locally in your browser's localStorage and is used for AI-powered features like Case Study generation.
          It is not shared with our servers. If `process.env.API_KEY` is set during build, it may be used as a fallback if no key is set here.
        </p>
        <div className="mb-4 relative">
          <label htmlFor="apiKey" className="block text-sm font-medium text-textSecondary mb-1">
            API Key
          </label>
          <input
            type={showKey ? "text" : "password"}
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            placeholder="Enter your Gemini API Key"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
          >
            {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            Clear Key
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors"
          >
            Save Key
          </button>
        </div>
         <p className="text-xs text-textSecondary mt-4">
          Note: If `process.env.API_KEY` is set in your environment, it will be used by default if no key is saved here. This setting overrides it for your browser session.
        </p>
      </div>
    </div>
  );
};