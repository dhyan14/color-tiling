'use client';

import React, { FC } from 'react';

type TetrominoPieceProps = {
  rotation?: number;
  isReflected?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const StraightPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isSelected = false }) => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-black`} />
  );

  return (
    <div className="relative w-[48px] h-[48px] sm:w-[80px] sm:h-[80px] transition-transform hover:scale-105" 
         style={{ transform: `rotate(${rotation}deg)` }}>
      {rotation === 0 ? (
        // Horizontal orientation
        <>
          <DominoCell
            className={`${baseCell} left-[0px] top-[18px] sm:top-[20px]`}
            borders="border-[2px] sm:border-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[12px] sm:left-[20px] top-[18px] sm:top-[20px]`}
            borders="border-[2px] sm:border-[3px] border-l-0"
          />
          <DominoCell
            className={`${baseCell} left-[24px] sm:left-[40px] top-[18px] sm:top-[20px]`}
            borders="border-[2px] sm:border-[3px] border-l-0"
          />
          <DominoCell
            className={`${baseCell} left-[36px] sm:left-[60px] top-[18px] sm:top-[20px]`}
            borders="border-[2px] sm:border-[3px] border-l-0"
          />
        </>
      ) : (
        // Vertical orientation
        <>
          <DominoCell
            className={`${baseCell} left-[18px] sm:left-[20px] top-[0px]`}
            borders="border-[2px] sm:border-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[18px] sm:left-[20px] top-[12px] sm:top-[20px]`}
            borders="border-[2px] sm:border-[3px] border-t-0"
          />
          <DominoCell
            className={`${baseCell} left-[18px] sm:left-[20px] top-[24px] sm:top-[40px]`}
            borders="border-[2px] sm:border-[3px] border-t-0"
          />
          <DominoCell
            className={`${baseCell} left-[18px] sm:left-[20px] top-[36px] sm:top-[60px]`}
            borders="border-[2px] sm:border-[3px] border-t-0"
          />
        </>
      )}
    </div>
  );
};

export const TPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isSelected = false }) => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-black`} />
  );

  return (
    <div className="relative w-[36px] h-[36px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105" 
         style={{ transform: `rotate(${rotation}deg)` }}>
      {/* Top horizontal row */}
      <DominoCell 
        className={`${baseCell} left-[0px] top-[0px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell 
        className={`${baseCell} left-[12px] sm:left-[20px] top-[0px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
      <DominoCell 
        className={`${baseCell} left-[24px] sm:left-[40px] top-[0px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
      {/* Bottom stem */}
      <DominoCell 
        className={`${baseCell} left-[12px] sm:left-[20px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px]"
      />
    </div>
  );
};

export const SquarePiece: FC<TetrominoPieceProps> = ({ isSelected = false }) => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-black`} />
  );

  return (
    <div className="relative w-[36px] h-[36px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105">
      {/* 2x2 Square */}
      <DominoCell
        className={`${baseCell} left-[6px] sm:left-[10px] top-[6px] sm:top-[10px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[18px] sm:left-[30px] top-[6px] sm:top-[10px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
      <DominoCell
        className={`${baseCell} left-[6px] sm:left-[10px] top-[18px] sm:top-[30px]`}
        borders="border-[2px] sm:border-[3px] border-t-0"
      />
      <DominoCell
        className={`${baseCell} left-[18px] sm:left-[30px] top-[18px] sm:top-[30px]`}
        borders="border-[2px] sm:border-[3px] border-l-0 border-t-0"
      />
    </div>
  );
};

export const LPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isReflected = false, isSelected = false }) => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-black`} />
  );

  const containerStyle = {
    transform: `${isReflected ? 'scaleX(-1) ' : ''}rotate(${rotation}deg)`,
  };

  return (
    <div className="relative w-[36px] h-[36px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105" 
         style={containerStyle}>
      <DominoCell
        className={`${baseCell} left-[0px] top-[0px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[0px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px] border-t-0"
      />
      <DominoCell
        className={`${baseCell} left-[0px] top-[24px] sm:top-[40px]`}
        borders="border-[2px] sm:border-[3px] border-t-0"
      />
      <DominoCell
        className={`${baseCell} left-[12px] sm:left-[20px] top-[24px] sm:top-[40px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
    </div>
  );
};

export const SkewPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isReflected = false, isSelected = false }) => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-black`} />
  );

  const containerStyle = {
    transform: `${isReflected ? 'scaleX(-1) ' : ''}rotate(${rotation}deg)`,
  };

  return (
    <div className="relative w-[36px] h-[36px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105" 
         style={containerStyle}>
      <DominoCell
        className={`${baseCell} left-[12px] sm:left-[20px] top-[0px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[24px] sm:left-[40px] top-[0px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
      <DominoCell
        className={`${baseCell} left-[0px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[12px] sm:left-[20px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
    </div>
  );
};
