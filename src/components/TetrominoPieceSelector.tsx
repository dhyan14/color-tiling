'use client';

import { FC } from 'react';
import { StraightPiece, TPiece, SquarePiece, LPiece, SkewPiece } from './TetrominoPieces';

type TetrominoType = 'straight' | 'T' | 'square' | 'L' | 'skew';

interface TetrominoPieceSelectorProps {
  selectedType: TetrominoType | null;
  onSelect: (type: TetrominoType) => void;
  rotation: number;
  onRotate: (rotation: number) => void;
  isReflected: boolean;
  onReflect: (reflected: boolean) => void;
  availableTypes: TetrominoType[];
  allowRotation?: boolean;
  allowReflection?: boolean;
}

const TetrominoPieceSelector: FC<TetrominoPieceSelectorProps> = ({
  selectedType,
  onSelect,
  rotation,
  onRotate,
  isReflected,
  onReflect,
  availableTypes,
  allowRotation = true,
  allowReflection = true,
}) => {
  const rotations = selectedType === 'straight' ? [0, 90] : [0, 90, 180, 270];

  const TetrominoPieceButton: FC<{
    type: TetrominoType;
    isDisabled?: boolean;
  }> = ({ type, isDisabled = false }) => {
    const isSelected = selectedType === type;
    const baseStyle = "w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] relative transition-all";
    const hoverStyle = !isDisabled ? "hover:scale-105 hover:shadow-lg" : "";
    const selectedStyle = isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "bg-white";
    const disabledStyle = isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

    return (
      <button
        onClick={() => !isDisabled && onSelect(type)}
        className={`${baseStyle} ${hoverStyle} ${selectedStyle} ${disabledStyle} rounded-lg p-2 border border-gray-200`}
        disabled={isDisabled}
        title={isDisabled ? "This piece has been used" : type.charAt(0).toUpperCase() + type.slice(1) + " piece"}
      >
        {type === 'straight' && <StraightPiece rotation={isSelected ? rotation : 0} />}
        {type === 'T' && <TPiece rotation={isSelected ? rotation : 0} />}
        {type === 'square' && <SquarePiece />}
        {type === 'L' && <LPiece rotation={isSelected ? rotation : 0} isReflected={isSelected && isReflected} />}
        {type === 'skew' && <SkewPiece rotation={isSelected ? rotation : 0} isReflected={isSelected && isReflected} />}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-xl shadow-md">
      {/* Piece Selection */}
      <div className="grid grid-cols-5 gap-4">
        {availableTypes.map((type) => (
          <TetrominoPieceButton
            key={type}
            type={type as TetrominoType}
            isDisabled={!availableTypes.includes(type as TetrominoType)}
          />
        ))}
      </div>

      {/* Controls */}
      {selectedType && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Rotation Controls */}
          {allowRotation && selectedType !== 'square' && (
            <div className="flex flex-wrap gap-4 justify-center">
              {rotations.map((r) => (
                <button
                  key={r}
                  onClick={() => onRotate(r)}
                  className={`p-2 rounded-lg transition-colors ${
                    rotation === r ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {selectedType === 'straight' && <StraightPiece rotation={r} />}
                </button>
              ))}
            </div>
          )}

          {/* Reflection Control */}
          {allowReflection && ['L', 'skew'].includes(selectedType) && (
            <button
              onClick={() => onReflect(!isReflected)}
              className={`p-2 rounded-lg transition-colors ${
                isReflected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title="Reflect piece"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TetrominoPieceSelector; 