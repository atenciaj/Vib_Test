
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
  isRunning: boolean;
}

export const Timer: React.FC<TimerProps> = ({ durationMinutes, onTimeUp, isRunning }) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60); // in seconds

  useEffect(() => {
    setTimeLeft(durationMinutes * 60); // Reset timer when duration changes
  }, [durationMinutes]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <=0 && isRunning) onTimeUp(); // Call onTimeUp only if it just reached zero while running
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onTimeUp, isRunning]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const timeColor = timeLeft < 60 ? 'text-red-500' : timeLeft < 300 ? 'text-yellow-500' : 'text-accent';

  return (
    <div className={`flex items-center space-x-2 p-3 bg-card rounded-lg shadow ${timeColor}`}>
      <Clock size={24} />
      <span className="text-lg font-semibold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};