'use client';

import React, { FC, HTMLAttributes } from 'react';
import { JSX } from 'react/jsx-runtime';

interface TetrominoPieceProps extends HTMLAttributes<HTMLDivElement> {
  rotation?: number;
  isSelected?: boolean;
  isTromino?: boolean;
  isReflected?: boolean;
}

interface DominoCellProps extends HTMLAttributes<HTMLDivElement> {
  className: string;
  borders: string;
}

export const StraightPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isSelected = false, isTromino = false, ...props }): JSX.Element => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  const DominoCell: FC<DominoCellProps> = ({ className, borders, ...props }): JSX.Element => (
    <div className={`${className} bg-white ${borders} border-black`} {...props} />
  );

  return (
    <div 
      className="relative w-[36px] h-[36px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105" 
      style={{ transform: `rotate(${rotation}deg)` }}
      {...props}
    >
      {/* Horizontal row */}
      <DominoCell
        className={`${baseCell} left-[0px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[12px] sm:left-[20px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
      <DominoCell
        className={`${baseCell} left-[24px] sm:left-[40px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
      {!isTromino && (
        <DominoCell
          className={`${baseCell} left-[36px] sm:left-[60px] top-[12px] sm:top-[20px]`}
          borders="border-[2px] sm:border-[3px] border-l-0"
        />
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

export const SquarePiece: FC<TetrominoPieceProps> = ({ isTromino = false }) => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  if (isTromino) {
    // Single block for puzzle 7 and 8
    return (
      <div className="relative w-[36px] h-[36px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105">
        <div className={`${baseCell} left-[12px] sm:left-[20px] top-[12px] sm:top-[20px] bg-white border-[2px] sm:border-[3px] border-black`} />
      </div>
    );
  }

  // 2x2 square for other puzzles (like puzzle 5)
  return (
    <div className="relative w-[36px] h-[36px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105">
      <div className={`${baseCell} left-[6px] sm:left-[10px] top-[6px] sm:top-[10px] bg-white border-[2px] sm:border-[3px] border-black`} />
      <div className={`${baseCell} left-[18px] sm:left-[30px] top-[6px] sm:top-[10px] bg-white border-[2px] sm:border-[3px] border-l-0 border-black`} />
      <div className={`${baseCell} left-[6px] sm:left-[10px] top-[18px] sm:top-[30px] bg-white border-[2px] sm:border-[3px] border-t-0 border-black`} />
      <div className={`${baseCell} left-[18px] sm:left-[30px] top-[18px] sm:top-[30px] bg-white border-[2px] sm:border-[3px] border-t-0 border-l-0 border-black`} />
    </div>
  );
};

export const LPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isReflected = false, isSelected = false }) => {
  const cellSize = "w-[12px] h-[12px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-black`} />
  );

  return (
    <div className="relative w-[48px] h-[48px] sm:w-[80px] sm:h-[80px] transition-transform hover:scale-105"
         style={{ 
           transform: `rotate(${rotation}deg) scaleX(${isReflected ? -1 : 1})`,
           transformOrigin: 'center'
         }}>
      {/* Base vertical line */}
      <DominoCell
        className={`${baseCell} left-[18px] sm:left-[30px] top-[0px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[18px] sm:left-[30px] top-[12px] sm:top-[20px]`}
        borders="border-[2px] sm:border-[3px] border-t-0"
      />
      <DominoCell
        className={`${baseCell} left-[18px] sm:left-[30px] top-[24px] sm:top-[40px]`}
        borders="border-[2px] sm:border-[3px] border-t-0"
      />
      {/* Horizontal piece */}
      <DominoCell
        className={`${baseCell} left-[30px] sm:left-[50px] top-[24px] sm:top-[40px]`}
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

  return (
    <div className="relative w-[48px] h-[48px] sm:w-[80px] sm:h-[80px] transition-transform hover:scale-105"
         style={{ 
           transform: `rotate(${rotation}deg) scaleX(${isReflected ? -1 : 1})`,
           transformOrigin: 'center'
         }}>
      {/* Base horizontal line */}
      <DominoCell
        className={`${baseCell} left-[6px] sm:left-[10px] top-[18px] sm:top-[30px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[18px] sm:left-[30px] top-[18px] sm:top-[30px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
      {/* Offset horizontal line */}
      <DominoCell
        className={`${baseCell} left-[18px] sm:left-[30px] top-[30px] sm:top-[50px]`}
        borders="border-[2px] sm:border-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[30px] sm:left-[50px] top-[30px] sm:top-[50px]`}
        borders="border-[2px] sm:border-[3px] border-l-0"
      />
    </div>
  );
};
