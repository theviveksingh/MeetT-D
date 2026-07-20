import { useState, useEffect } from 'react';
import { useRoom } from '../context/RoomContext';

export default function Bottle() {
  const { selectedPlayer, gameState } = useRoom();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (selectedPlayer) {
      const targetRotation = Math.floor(Math.random() * 360) + 1800;
      setIsSpinning(true);
      
      let currentRotation = rotation;
      const steps = 60;
      let currentStep = 0;
      
      const animate = () => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = rotation + (targetRotation - rotation) * easeOut;
        setRotation(currentRotation);
        
        if (currentStep < steps) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [selectedPlayer?.userId]);

  if (!gameState.isActive) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-white/10 p-4">
      <h3 className="text-white font-semibold mb-4 text-center">Spin the Bottle</h3>
      <div className="relative h-48 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-red-500 rounded-full" />
        </div>
        
        <svg
          viewBox="0 0 100 200"
          className="w-24 h-48"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'none' : 'transform 0.3s ease-out'
          }}
        >
          <defs>
            <linearGradient id="bottleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="liquidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          
          <ellipse cx="50" cy="30" rx="15" ry="20" fill="url(#bottleGradient)" />
          <rect x="35" y="30" width="30" height="15" fill="url(#bottleGradient)" />
          
          <path
            d="M 35 45 Q 30 50 25 60 L 25 180 Q 25 190 50 190 Q 75 190 75 180 L 75 60 Q 70 50 65 45 Z"
            fill="url(#bottleGradient)"
            stroke="#166534"
            strokeWidth="1"
          />
          
          <path
            d="M 30 80 Q 50 75 70 80 L 70 175 Q 50 180 30 175 Z"
            fill="url(#liquidGradient)"
            opacity="0.8"
          />
          
          <ellipse cx="50" cy="30" rx="12" ry="5" fill="#166534" />
          
          <ellipse cx="40" cy="100" rx="3" ry="8" fill="rgba(255,255,255,0.3)" />
        </svg>

        {selectedPlayer && !isSpinning && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold animate-bounce">
            {selectedPlayer.displayName}
          </div>
        )}
      </div>
      
      <p className="text-gray-400 text-sm text-center mt-2">
        {isSpinning ? 'Spinning...' : selectedPlayer ? 'Selected!' : 'Ready to spin'}
      </p>
    </div>
  );
}
