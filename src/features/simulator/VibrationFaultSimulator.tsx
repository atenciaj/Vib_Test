import React, { useState, useEffect, useCallback } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
}

interface FaultSimulationProps {}

const FaultSimulation: React.FC<FaultSimulationProps> = () => {
  const [shaftSpeed, setShaftSpeed] = useState(1000); // in RPM
  const [bearingDiameter, setBearingDiameter] = useState(10); // in mm
  const [ballDiameter, setBallDiameter] = useState(5); // in mm
  const [numberOfBalls, setNumberOfBalls] = useState(10);
  const [contactAngle, setContactAngle] = useState(0); // in degrees
  const [samplingFrequency, setSamplingFrequency] = useState(5000); // in Hz
  const [duration, setDuration] = useState(2); // in seconds
  const [ballPassFrequencyOuterRace, setBPFO] = useState(0);
  const [ballPassFrequencyInnerRace, setBPFI] = useState(0);
  const [ballSpinFrequency, setBSF] = useState(0);
  const [fundamentalTrainFrequency, setFTF] = useState(0);
  const [spectrumData, setSpectrumData] = useState<DataPoint[]>([]);
  const [timeWaveformData, setTimeWaveformData] = useState<DataPoint[]>([]);
  const [faultType, setFaultType] = useState<'none' | 'outer' | 'inner' | 'ball' | 'cage'>('none');
  const [showFormulas, setShowFormulas] = useState(false);

  // Convert shaft speed from RPM to Hz
  const shaftSpeedHz = shaftSpeed / 60;

  // Calculate characteristic frequencies
  useEffect(() => {
    const angleRad = (contactAngle * Math.PI) / 180;
    const d = bearingDiameter;
    const b = ballDiameter;
    const n = numberOfBalls;
    const s = shaftSpeedHz;

    const bpfo = (n / 2) * s * (1 - (b / d) * Math.cos(angleRad));
    const bpfi = (n / 2) * s * (1 + (b / d) * Math.cos(angleRad));
    const bsf = (d / (2 * b)) * s * (1 - ((b / d) * Math.cos(angleRad)) ** 2);
    const ftf = (1 / 2) * s * (1 - (b / d) * Math.cos(angleRad));

    setBPFO(bpfo);
    setBPFI(bpfi);
    setBSF(bsf);
    setFTF(ftf);
  }, [shaftSpeed, bearingDiameter, ballDiameter, numberOfBalls, contactAngle, shaftSpeedHz]);

  const generateSignal = useCallback(() => {
    const numSamples = samplingFrequency * duration;
    const timeData: DataPoint[] = [];
    const frequencyData: number[] = new Array(numSamples).fill(0); // For FFT

    for (let i = 0; i < numSamples; i++) {
      const time = i / samplingFrequency;
      let amplitude = 0;

      // Add base signal (e.g., shaft speed vibration)
      amplitude += 0.5 * Math.sin(2 * Math.PI * shaftSpeedHz * time);

      // Add fault frequencies
      switch (faultType) {
        case 'outer':
          amplitude += 0.3 * Math.sin(2 * Math.PI * ballPassFrequencyOuterRace * time);
          amplitude += 0.1 * Math.sin(2 * Math.PI * (2 * ballPassFrequencyOuterRace) * time); // Harmonics
          break;
        case 'inner':
          amplitude += 0.4 * Math.sin(2 * Math.PI * ballPassFrequencyInnerRace * time);
          amplitude += 0.15 * Math.sin(2 * Math.PI * (2 * ballPassFrequencyInnerRace) * time);
          break;
        case 'ball':
          amplitude += 0.2 * Math.sin(2 * Math.PI * ballSpinFrequency * time);
          amplitude += 0.08 * Math.sin(2 * Math.PI * (2 * ballSpinFrequency) * time);
          break;
        case 'cage':
          amplitude += 0.15 * Math.sin(2 * Math.PI * fundamentalTrainFrequency * time);
          break;
        default:
          break;
      }

      // Add some random noise
      amplitude += (Math.random() - 0.5) * 0.05;

      timeData.push({ x: time, y: amplitude });
      frequencyData[i] = amplitude;
    }

    setTimeWaveformData(timeData);

    // Simple FFT approximation (for visualization purposes)
    // A proper FFT implementation is complex and beyond the scope here,
    // but this provides a basic frequency spectrum shape.
    const spectrum: DataPoint[] = [];
    const step = samplingFrequency / numSamples;
    for (let i = 0; i < numSamples / 2; i++) {
      const frequency = i * step;
      // Simplified magnitude calculation (sum of absolute values)
      let magnitude = 0;
      for(let j = 0; j < numSamples; j++) {
          magnitude += Math.abs(frequencyData[j] * Math.sin(2 * Math.PI * frequency * (j / samplingFrequency)));
      }
      spectrum.push({ x: frequency, y: magnitude / numSamples }); // Normalize
    }
    setSpectrumData(spectrum);

  }, [shaftSpeedHz, ballPassFrequencyOuterRace, ballPassFrequencyInnerRace, ballSpinFrequency, fundamentalTrainFrequency, faultType, samplingFrequency, duration]);

  useEffect(() => {
    generateSignal();
  }, [generateSignal]);

  const toggleFormulas = () => {
    setShowFormulas(!showFormulas);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Vibration Fault Simulator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Input Parameters */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Simulation Parameters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shaft Speed (RPM)</label>
              <input
                type="number"
                value={shaftSpeed}
                onChange={(e) => setShaftSpeed(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bearing Diameter (mm)</label>
              <input
                type="number"
                value={bearingDiameter}
                onChange={(e) => setBearingDiameter(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ball Diameter (mm)</label>
              <input
                type="number"
                value={ballDiameter}
                onChange={(e) => setBallDiameter(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Balls</label>
              <input
                type="number"
                value={numberOfBalls}
                onChange={(e) => setNumberOfBalls(Math.max(1, Math.round(Number(e.target.value))))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Angle (degrees)</label>
              <input
                type="number"
                value={contactAngle}
                onChange={(e) => setContactAngle(Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="90"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Sampling Frequency (Hz)</label>
              <input
                type="number"
                value={samplingFrequency}
                onChange={(e) => setSamplingFrequency(Math.max(100, Number(e.target.value)))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="100"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Duration (seconds)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Fault Type</label>
              <select
                value={faultType}
                onChange={(e) => setFaultType(e.target.value as any)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="none">No Fault</option>
                <option value="outer">Outer Race Fault</option>
                <option value="inner">Inner Race Fault</option>
                <option value="ball">Ball Fault</option>
                <option value="cage">Cage Fault (FTF)</option>
              </select>
            </div>
          </div>
           <button
            onClick={generateSignal}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Generate Simulation
          </button>
        </div>

        {/* Calculated Frequencies */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Calculated Frequencies (Hz)</h2>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-medium">Shaft Speed:</span> {shaftSpeedHz.toFixed(2)} Hz
            </p>
            <p className="text-gray-700">
              <span className="font-medium">BPFO (Ball Pass Frequency Outer Race):</span> {ballPassFrequencyOuterRace.toFixed(2)} Hz
            </p>
            <p className="text-gray-700">
              <span className="font-medium">BPFI (Ball Pass Frequency Inner Race):</span> {ballPassFrequencyInnerRace.toFixed(2)} Hz
            </p>
            <p className="text-gray-700">
              <span className="font-medium">BSF (Ball Spin Frequency):</span> {ballSpinFrequency.toFixed(2)} Hz
            </p>
            <p className="text-gray-700">
              <span className="font-medium">FTF (Fundamental Train Frequency):</span> {fundamentalTrainFrequency.toFixed(2)} Hz
            </p>
          </div>

          <div className="mt-6">
             <button
              onClick={toggleFormulas}
              className="flex items-center text-blue-600 hover:underline focus:outline-none"
            >
              {showFormulas ? <ChevronDown size={20} className="mr-1" /> : <ChevronRight size={20} className="mr-1" />}
              Show Formulas
            </button>
            {showFormulas && (
              <div className="mt-4 text-sm text-gray-700 leading-relaxed">
                <p>Shaft Speed (Hz) = Shaft Speed (RPM) / 60</p>
                <p>BPFO = (Number of Balls / 2) * Shaft Speed (Hz) * (1 - (Ball Diameter / Bearing Diameter) * cos(Contact Angle))</p>
                <p>BPFI = (Number of Balls / 2) * Shaft Speed (Hz) * (1 + (Ball Diameter / Bearing Diameter) * cos(Contact Angle))</p>
                <p>BSF = (Bearing Diameter / (2 * Ball Diameter)) * Shaft Speed (Hz) * (1 - ((Ball Diameter / Bearing Diameter) * cos(Contact Angle))²)</p>
                <p>FTF = (1 / 2) * Shaft Speed (Hz) * (1 - (Ball Diameter / Bearing Diameter) * cos(Contact Angle))</p>
                <p>Contact Angle must be in radians for calculations (degrees * π / 180).</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Waveform */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Time Waveform</h2>
         <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeWaveformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(tick) => tick.toFixed(2)}
                label={{ value: 'Time (s)', position: 'insideBottom', offset: 0 }}
              />
              <YAxis label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value.toFixed(4)} labelFormatter={(label) => `Time: ${label.toFixed(2)} s`} />
              <Line type="monotone" dataKey="y" stroke="#3b82f6" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
      </div>

      {/* Frequency Spectrum */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Frequency Spectrum (Simplified)</h2>
         <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={spectrumData}>
              <CartesianGrid strokeDasharray="3 3" />
               <XAxis
                dataKey="x"
                type="number"
                domain={[0, samplingFrequency / 2]}
                 tickFormatter={(tick) => tick.toFixed(0)}
                label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: 0 }}
              />
              <YAxis label={{ value: 'Magnitude', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value.toFixed(4)} labelFormatter={(label) => `Frequency: ${label.toFixed(2)} Hz`} />
              <Area type="monotone" dataKey="y" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="mt-4 text-sm text-gray-600">
            Note: This frequency spectrum is generated using a simplified method for visualization and is not a true Fast Fourier Transform (FFT). It aims to show the general presence of fault frequencies.
          </p>
      </div>
    </div>
  );
};

export default FaultSimulation;