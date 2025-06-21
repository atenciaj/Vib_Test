
import React, { useState } from 'react';
import { GlossaryTerm, StandardLink } from '../../types';
import { BookOpen, HelpCircle, ExternalLink, Search, ChevronDown, ChevronRight } from 'lucide-react';

const initialGlossaryTerms: GlossaryTerm[] = [
  { term: 'Amplitude', definition: 'The maximum displacement or distance moved by a point on a vibrating body or wave measured from its equilibrium position.' },
  { term: 'Frequency', definition: 'The number of occurrences of a repeating event per unit of time. For vibration, typically measured in Hertz (Hz) or cycles per minute (CPM).' },
  { term: 'FFT (Fast Fourier Transform)', definition: 'An algorithm that samples a signal over a period of time (or space) and divides it into its frequency components.' },
  { term: 'Resonance', definition: 'The phenomenon that occurs when the frequency of an applied force is close to a natural frequency of the system, resulting in large amplitude vibrations.' },
  { term: 'Phase', definition: 'A measure of the relative timing between two sinusoidal signals of the same frequency, or between a force and the resulting vibration.' },
  { term: 'Accelerometer', definition: 'A transducer that measures acceleration, commonly used for vibration analysis.' },
  { term: 'Time Waveform', definition: 'A plot of vibration amplitude versus time, showing the raw signal from a transducer.' },
  { term: 'Spectrum (Frequency Spectrum)', definition: 'A plot of vibration amplitude versus frequency, typically derived from an FFT of the time waveform.' },
  { term: 'Unbalance', definition: 'A condition where the center of mass of a rotating component is not coincident with its center of rotation.' },
  { term: 'Misalignment', definition: 'A condition where the centerlines of two coupled shafts are not collinear or parallel.' },
  { term: 'Enveloping (Demodulation)', definition: 'A signal processing technique used to detect high-frequency impacts associated with bearing and gear faults.'},
  { term: 'Critical Speed', definition: 'A rotational speed at which a rotor becomes dynamically unstable due to resonance with one of its natural frequencies.' },
  { term: 'Overall Vibration', definition: 'A single value representing the total energy of vibration over a specified frequency range.' },
];

const isoStandards: StandardLink[] = [
  { name: 'ISO 18436-1', description: 'Condition monitoring and diagnostics of machines — Requirements for qualification and assessment of personnel — Part 1: Requirements for assessment bodies and the assessment process', url: 'https://www.iso.org/standard/56763.html' },
  { name: 'ISO 18436-2', description: 'Condition monitoring and diagnostics of machines — Requirements for qualification and assessment of personnel — Part 2: Vibration condition monitoring and diagnostics', url: 'https://www.iso.org/standard/74400.html' },
  { name: 'ISO 18436-3', description: 'Condition monitoring and diagnostics of machines — Requirements for qualification and assessment of personnel — Part 3: Requirements for training bodies and the training process', url: 'https://www.iso.org/standard/56765.html' },
  { name: 'ISO 10816-1', description: 'Mechanical vibration — Evaluation of machine vibration by measurements on non-rotating parts — Part 1: General guidelines', url: 'https://www.iso.org/standard/63199.html' },
  { name: 'ISO 20816-1', description: 'Mechanical vibration — Measurement and evaluation of machine vibration — Part 1: General guidelines (supersedes parts of ISO 10816)', url: 'https://www.iso.org/standard/62295.html' },
  { name: 'ISO 13373-1', description: 'Condition monitoring and diagnostics of machines — Vibration condition monitoring — Part 1: General procedures', url: 'https://www.iso.org/standard/74495.html' },
];

export const ResourcesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAccordion, setActiveAccordion] = useState<string | null>('glossary');

  const filteredGlossary = initialGlossaryTerms.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (id: string) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const AccordionItem: React.FC<{id: string; title: string; icon: React.ReactNode; children: React.ReactNode;}> = ({ id, title, icon, children }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
        <button
            onClick={() => toggleAccordion(id)}
            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none transition-colors"
        >
            <span className="flex items-center text-lg font-medium text-primary">
                {icon}
                <span className="ml-3">{title}</span>
            </span>
            {activeAccordion === id ? <ChevronDown size={24} className="text-primary"/> : <ChevronRight size={24} className="text-gray-500"/>}
        </button>
        {activeAccordion === id && (
            <div className="p-5 border-t border-gray-200 bg-white">
                {children}
            </div>
        )}
    </div>
  );


  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10 text-center">
        <BookOpen className="w-20 h-20 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-textPrimary">Learning Resources</h1>
        <p className="text-lg text-textSecondary mt-2">
          Explore key vibration analysis terms and relevant ISO standards to support your certification preparation.
        </p>
      </header>

      <div> {/* Removed space-y-8 from here, AccordionItem handles its own margin */}
        <AccordionItem id="glossary" title="Glossary of Terms" icon={<HelpCircle size={24}/>}>
            <div className="mb-6 relative">
                <input
                type="text"
                placeholder="Search glossary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {filteredGlossary.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {filteredGlossary.map(item => (
                    <div key={item.term} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-md font-semibold text-primary-dark">{item.term}</h3>
                    <p className="text-sm text-textSecondary mt-1">{item.definition}</p>
                    </div>
                ))}
                </div>
            ) : (
                <p className="text-textSecondary text-center py-4">No terms match your search.</p>
            )}
        </AccordionItem>
        
        <AccordionItem id="standards" title="Relevant ISO Standards" icon={<ExternalLink size={24}/>}>
            <div className="space-y-4">
                {isoStandards.map(standard => (
                <div key={standard.name} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <h3 className="text-md font-semibold text-primary-dark">{standard.name}</h3>
                    <p className="text-sm text-textSecondary mt-1 mb-2">{standard.description}</p>
                    <a
                    href={standard.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-secondary hover:text-secondary-dark font-medium transition-colors"
                    >
                    View Standard <ExternalLink size={16} className="ml-1.5" />
                    </a>
                </div>
                ))}
            </div>
        </AccordionItem>
      </div>
    </div>
  );
};