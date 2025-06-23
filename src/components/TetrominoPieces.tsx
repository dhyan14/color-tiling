import React from 'react';

interface TetrominoPieceProps {
  rotation?: number;
  isReflected?: boolean;
}

export const StraightPiece: React.FC<TetrominoPieceProps> = ({ rotation = 0 }) => {
  const isVertical = rotation === 90 || rotation === 270;
  return (
    <div className="relative w-8 h-8">
      <div 
        className={`absolute bg-blue-500 transform origin-center transition-transform duration-200 ${
          isVertical ? 'h-32 w-8' : 'w-32 h-8'
        }`}
        style={{ transform: `rotate(${rotation}deg)` }}
      />
    </div>
  );
};

export const TPiece: React.FC<TetrominoPieceProps> = ({ rotation = 0 }) => {
  return (
    <div className="relative w-8 h-8">
      <div 
        className="absolute bg-purple-500 w-24 h-8"
        style={{ transform: `rotate(${rotation}deg) translate(8px, 0)` }}
      />
      <div 
        className="absolute bg-purple-500 w-8 h-16"
        style={{ transform: `rotate(${rotation}deg) translate(16px, 8px)` }}
      />
    </div>
  );
};

export const SquarePiece: React.FC = () => {
  return (
    <div className="relative w-16 h-16">
      <div className="absolute bg-yellow-500 w-full h-full" />
    </div>
  );
};

export const LPiece: React.FC<TetrominoPieceProps> = ({ rotation = 0, isReflected = false }) => {
  return (
    <div className="relative w-8 h-8">
      <div 
        className="absolute bg-orange-500 w-8 h-24"
        style={{ 
          transform: `rotate(${rotation}deg) ${isReflected ? 'scaleX(-1)' : ''} translate(0, 8px)` 
        }}
      />
      <div 
        className="absolute bg-orange-500 w-16 h-8"
        style={{ 
          transform: `rotate(${rotation}deg) ${isReflected ? 'scaleX(-1)' : ''} translate(8px, 24px)` 
        }}
      />
    </div>
  );
};

export const SkewPiece: React.FC<TetrominoPieceProps> = ({ rotation = 0, isReflected = false }) => {
  return (
    <div className="relative w-8 h-8">
      <div 
        className="absolute bg-green-500 w-16 h-8"
        style={{ 
          transform: `rotate(${rotation}deg) ${isReflected ? 'scaleX(-1)' : ''} translate(0, 0)` 
        }}
      />
      <div 
        className="absolute bg-green-500 w-16 h-8"
        style={{ 
          transform: `rotate(${rotation}deg) ${isReflected ? 'scaleX(-1)' : ''} translate(8px, 8px)` 
        }}
      />
    </div>
  );
}; 