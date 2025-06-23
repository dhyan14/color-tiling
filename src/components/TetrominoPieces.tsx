'use client';

import React, { FC } from 'react';

type TetrominoPieceProps = {
  rotation?: number;
  isReflected?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const StraightPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isSelected = false }) => {
  const cellSize = "w-[15px] h-[15px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;
  const dotStyle = "absolute w-[6px] h-[6px] sm:w-[8px] sm:h-[8px] rounded-full bg-gradient-to-br from-white/80 to-current left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm";

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-gradient-to-br from-white to-white/90 ${borders} border-current shadow-inner rounded-sm`}>
      <div className={dotStyle} />
    </div>
  );

  return (
    <div className="relative w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] transition-transform hover:scale-105" 
         style={{ transform: `rotate(${rotation}deg)` }}>
      {rotation === 0 ? (
        // Horizontal orientation
        <>
          <DominoCell
            className={`${baseCell} left-[0px] top-[20px]`}
            borders="border-l-[2px] border-y-[2px] sm:border-l-[3px] sm:border-y-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[15px] sm:left-[20px] top-[20px]`}
            borders="border-y-[2px] sm:border-y-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[30px] sm:left-[40px] top-[20px]`}
            borders="border-y-[2px] sm:border-y-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[45px] sm:left-[60px] top-[20px]`}
            borders="border-r-[2px] border-y-[2px] sm:border-r-[3px] sm:border-y-[3px]"
          />
        </>
      ) : (
        // Vertical orientation
        <>
          <DominoCell
            className={`${baseCell} left-[20px] top-[0px]`}
            borders="border-t-[2px] border-x-[2px] sm:border-t-[3px] sm:border-x-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[20px] top-[15px] sm:top-[20px]`}
            borders="border-x-[2px] sm:border-x-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[20px] top-[30px] sm:top-[40px]`}
            borders="border-x-[2px] sm:border-x-[3px]"
          />
          <DominoCell
            className={`${baseCell} left-[20px] top-[45px] sm:top-[60px]`}
            borders="border-b-[2px] border-x-[2px] sm:border-b-[3px] sm:border-x-[3px]"
          />
        </>
      )}
    </div>
  );
};

export const TPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isSelected = false }) => {
  const cellSize = "w-[15px] h-[15px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;
  const dotStyle = "absolute w-[6px] h-[6px] sm:w-[8px] sm:h-[8px] rounded-full bg-gradient-to-br from-white/80 to-current left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm";

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-gradient-to-br from-white to-white/90 ${borders} border-current shadow-inner rounded-sm`}>
      <div className={dotStyle} />
    </div>
  );

  return (
    <div className="relative w-[45px] h-[45px] sm:w-[60px] sm:h-[60px] transition-transform hover:scale-105" 
         style={{ transform: `rotate(${rotation}deg)` }}>
      {/* Top horizontal row */}
      <DominoCell 
        className={`${baseCell} left-[0px] top-[0px]`}
        borders="border-t-[2px] border-l-[2px] sm:border-t-[3px] sm:border-l-[3px]"
      />
      <DominoCell 
        className={`${baseCell} left-[15px] sm:left-[20px] top-[0px]`}
        borders="border-t-[2px] sm:border-t-[3px]"
      />
      <DominoCell 
        className={`${baseCell} left-[30px] sm:left-[40px] top-[0px]`}
        borders="border-t-[2px] border-r-[2px] sm:border-t-[3px] sm:border-r-[3px]"
      />
      {/* Bottom stem */}
      <DominoCell 
        className={`${baseCell} left-[15px] sm:left-[20px] top-[15px] sm:top-[20px]`}
        borders="border-l-[2px] border-r-[2px] border-b-[2px] sm:border-l-[3px] sm:border-r-[3px] sm:border-b-[3px]"
      />
    </div>
  );
};

export const SquarePiece: FC<TetrominoPieceProps> = ({ isSelected = false }) => {
  const cellSize = "w-[20px] h-[20px]";
  const baseCell = `absolute ${cellSize}`;
  const dotStyle = "absolute w-[6px] h-[6px] sm:w-[8px] sm:h-[8px] rounded-full bg-gradient-to-br from-white/80 to-current left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm";

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-gradient-to-br from-white to-white/90 ${borders} border-current shadow-inner rounded-sm`}>
      <div className={dotStyle} />
    </div>
  );

  return (
    <div className="relative w-[60px] h-[60px] transition-transform hover:scale-105">
      {/* 2x2 Square */}
      <DominoCell
        className={`${baseCell} left-[10px] top-[10px]`}
        borders="border-t-[3px] border-l-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[30px] top-[10px]`}
        borders="border-t-[3px] border-r-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[10px] top-[30px]`}
        borders="border-l-[3px] border-b-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[30px] top-[30px]`}
        borders="border-r-[3px] border-b-[3px]"
      />
    </div>
  );
};

export const LPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isReflected = false, isSelected = false }) => {
  const cellSize = "w-[15px] h-[15px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;
  const dotStyle = "absolute w-[4px] h-[4px] sm:w-[6px] sm:h-[6px] rounded-full bg-current left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-current`}>
      <div className={dotStyle} />
    </div>
  );

  const style = {
    transform: `rotate(${rotation}deg) ${isReflected ? 'scaleX(-1)' : ''}`
  };

  return (
    <div className="relative w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]" style={style}>
      {/* Vertical part */}
      <DominoCell
        className={`${baseCell} left-[20px] top-[0px]`}
        borders="border-t-[2px] border-x-[2px] sm:border-t-[3px] sm:border-x-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[20px] top-[15px] sm:top-[20px]`}
        borders="border-x-[2px] sm:border-x-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[20px] top-[30px] sm:top-[40px]`}
        borders="border-x-[2px] sm:border-x-[3px]"
      />
      {/* Horizontal part */}
      <DominoCell
        className={`${baseCell} left-[20px] top-[45px] sm:top-[60px]`}
        borders="border-b-[2px] border-x-[2px] sm:border-b-[3px] sm:border-x-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[35px] sm:left-[40px] top-[45px] sm:top-[60px]`}
        borders="border-b-[2px] border-r-[2px] sm:border-b-[3px] sm:border-r-[3px]"
      />
    </div>
  );
};

export const SkewPiece: FC<TetrominoPieceProps> = ({ rotation = 0, isReflected = false, isSelected = false }) => {
  const cellSize = "w-[15px] h-[15px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;
  const dotStyle = "absolute w-[4px] h-[4px] sm:w-[6px] sm:h-[6px] rounded-full bg-current left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-current`}>
      <div className={dotStyle} />
    </div>
  );

  const style = {
    transform: `rotate(${rotation}deg) ${isReflected ? 'scaleX(-1)' : ''}`
  };

  return (
    <div className="relative w-[60px] h-[60px] sm:w-[80px] sm:h-[80px]" style={style}>
      {/* First piece */}
      <DominoCell
        className={`${baseCell} left-[10px] top-[20px]`}
        borders="border-l-[2px] border-y-[2px] sm:border-l-[3px] sm:border-y-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[25px] sm:left-[30px] top-[20px]`}
        borders="border-r-[2px] border-y-[2px] sm:border-r-[3px] sm:border-y-[3px]"
      />
      {/* Second piece */}
      <DominoCell
        className={`${baseCell} left-[25px] sm:left-[30px] top-[35px] sm:top-[40px]`}
        borders="border-l-[2px] border-y-[2px] sm:border-l-[3px] sm:border-y-[3px]"
      />
      <DominoCell
        className={`${baseCell} left-[40px] sm:left-[50px] top-[35px] sm:top-[40px]`}
        borders="border-r-[2px] border-y-[2px] sm:border-r-[3px] sm:border-y-[3px]"
      />
    </div>
  );
};