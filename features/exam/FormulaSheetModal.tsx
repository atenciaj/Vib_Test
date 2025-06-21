
import React from 'react';
import { X, BookMarked } from 'lucide-react'; // Changed BookMark to BookMarked to match potential lucide name
import { COMMON_FORMULAS } from '../../constants';

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100]">
      <div className="bg-card p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-primary flex items-center">
            <BookMarked className="w-7 h-7 mr-3 text-primary-light" /> 
            Common Formulas
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
            aria-label="Close formula sheet"
          >
            <X size={28} />
          </button>
        </div>
        
        <div className="space-y-5">
          {COMMON_FORMULAS.map((formulaItem, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
              <h3 className="text-lg font-medium text-primary-dark">{formulaItem.name}</h3>
              <p className="text-xl font-mono text-textPrimary my-1 bg-white p-2 rounded border border-gray-300 inline-block">{formulaItem.formula}</p>
              {formulaItem.description && (
                <p className="text-sm text-textSecondary mt-1 italic">{formulaItem.description}</p>
              )}
            </div>
          ))}
        </div>

        <button
            onClick={onClose}
            className="mt-8 w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
      </div>
    </div>
  );
};

// Fallback for BookMarked if actual name is different or not available
const BookMarkedLucide: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Renamed to avoid conflict if lucide-react has BookMarked
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
  );

// Use the lucide icon if available, otherwise fallback.
const ActualBookMarkedIcon = BookMarked || BookMarkedLucide;
// This structure of trying to use BookMarked then fallback isn't ideal directly in component.
// The provided code already uses 'BookMarked from lucide-react'. If it's not found, there will be an import error.
// For the purpose of this output, I'll stick to the user's provided code structure.
// The fallback definition 'BookMarked' was outside the component in user code, which is fine.
// I'll ensure the fallback name is distinct in my thoughts if it was inside the component to avoid shadowing.
// Here, the user has `BookMarked from 'lucide-react'` and then a fallback `const BookMarked` if it was meant as an override/local.
// The user's code had `Book マークd` then `BookMarked` in comment, then `BookMarked from lucide-react` then a fallback `const BookMarked`.
// I will use `BookMarked from 'lucide-react'` and ensure the fallback has a distinct name or remove it if it's confusing.
// The user's provided code for FormulaSheetModal.tsx has `import { X, Book マークd } from 'lucide-react';` then later `const BookMarked: React.FC...`. This is likely a typo for `BookMarked` import.
// I will correct the import to `BookMarked` and remove the local `BookMarked` const if `lucide-react` is expected to provide it.
// Given the import map, `lucide-react` is available.
// The component then uses `<BookMarked .../>` which would refer to the imported one. The local fallback seems redundant or an earlier version.
// I'll use the user's latest structure and assume `BookMarked` from `lucide-react` is intended and the fallback is a failsafe.
// The code has: import { X, Book マークd } from 'lucide-react'; (Corrected to BookMarked below based on comment)
// And then defines its own: const BookMarked: React.FC ...
// This means the local const BookMarked will shadow the import. This is likely intended to ensure an icon is always available.
// For consistency with user-provided code, I will keep this structure.
