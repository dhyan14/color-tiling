'use client';

import * as React from 'react';
import { useState } from 'react';
import { TPiece } from '@/components/TetrominoPieces';

interface Cell {
  isOccupied: boolean;
  dominoId: number | null;
  rotation: number;
  isFirst: boolean;
}

interface GameState {
  grid: Cell[][];
  piecesPlaced: number;
  lastPlacedCell?: { row: number; col: number; };
}

const GRID_SIZE = 8;
const MAX_PIECES = 16;

const TetrominoOption = ({ rotation, isSelected, onClick }: { rotation: number; isSelected: boolean; onClick: () => void; }) => {
  const baseStyle = "w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] relative transition-all hover:scale-105";
  const colorStyle = isSelected ? "text-blue-600 ring-2 ring-blue-500" : "text-gray-500";

  return (
    <div className="flex flex-col gap-2 items-center">
      <button
        onClick={onClick}
        className={`${baseStyle} ${colorStyle} flex items-center justify-center p-2 rounded-lg focus:outline-none`}
      >
        <div className="relative w-full h-full">
          <TPiece rotation={rotation} isSelected={isSelected} />
        </div>
      </button>
      <button
        onClick={onClick}
        className={`${baseStyle} ${colorStyle} flex items-center justify-center p-2 rounded-lg focus:outline-none transform scale-75`}
      >
        <div className="relative w-full h-full">
          <TPiece rotation={rotation} isSelected={isSelected} />
        </div>
      </button>
    </div>
  );
};

const createEmptyGrid = (): Cell[][] => {
  return Array(GRID_SIZE).fill(null).map(() =>
    Array(GRID_SIZE).fill(null).map(() => ({
      isOccupied: false,
      dominoId: null,
      rotation: 0,
      isFirst: false
    }))
  );
};

export default function GameBoard() {
  const [currentState, setCurrentState] = useState<GameState>({
    grid: createEmptyGrid(),
    piecesPlaced: 0
  });
  const [selectedRotation, setSelectedRotation] = useState<number>(0);
  const [history, setHistory] = useState<GameState[]>([]);
  const [future, setFuture] = useState<GameState[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPlacedCell, setLastPlacedCell] = useState<{ row: number; col: number } | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const saveState = (newState: GameState) => {
    setHistory([...history, currentState]);
    setFuture([]);
    setCurrentState(newState);
    if (newState.lastPlacedCell) {
      setLastPlacedCell(newState.lastPlacedCell);
    }
  };

  const getTRequiredCells = (row: number, col: number, rotation: number): [number, number][] => {
    switch(rotation) {
      case 0: // T pointing down
        return [
          [row, col],     // center
          [row + 1, col], // bottom
          [row, col - 1], // left
          [row, col + 1]  // right
        ];
      case 90: // T pointing left
        return [
          [row, col],     // center
          [row, col - 1], // left
          [row - 1, col], // top
          [row + 1, col]  // bottom
        ];
      case 180: // T pointing up
        return [
          [row, col],     // center
          [row - 1, col], // top
          [row, col - 1], // left
          [row, col + 1]  // right
        ];
      case 270: // T pointing right
        return [
          [row, col],     // center
          [row, col + 1], // right
          [row - 1, col], // top
          [row + 1, col]  // bottom
        ];
      default:
        return [[row, col]];
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (currentState.piecesPlaced >= MAX_PIECES) {
      setErrorMessage("Maximum number of pieces placed!");
      return;
    }

    const requiredCells = getTRequiredCells(row, col, selectedRotation);
    
    // Check bounds
    if (requiredCells.some(([r, c]) => r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE)) {
      setErrorMessage("Can't place T-piece here - out of bounds!");
      return;
    }
    
    // Check if all required cells are free
    if (requiredCells.some(([r, c]) => currentState.grid[r][c].isOccupied)) {
      setErrorMessage("Can't place T-piece here - space already occupied!");
      return;
    }

    const newGrid = JSON.parse(JSON.stringify(currentState.grid));
    const pieceId = currentState.piecesPlaced + 1;
    
    // Place the T piece
    requiredCells.forEach(([r, c], index) => {
      newGrid[r][c] = {
        isOccupied: true,
        dominoId: pieceId,
        rotation: selectedRotation,
        isFirst: index === 0
      };
    });

    const newState = {
      grid: newGrid,
      piecesPlaced: pieceId,
      lastPlacedCell: { row, col }
    };

    saveState(newState);
    setErrorMessage(null);

    // Check if puzzle is complete
    if (pieceId === MAX_PIECES) {
      setIsComplete(true);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setFuture([currentState, ...future]);
      setCurrentState(previousState);
      setLastPlacedCell(previousState.lastPlacedCell || null);
      setIsComplete(false);
    }
  };

  const handleRedo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      const newFuture = future.slice(1);
      setHistory([...history, currentState]);
      setFuture(newFuture);
      setCurrentState(nextState);
      setLastPlacedCell(nextState.lastPlacedCell || null);
      setIsComplete(nextState.piecesPlaced === MAX_PIECES);
    }
  };

  const handleReset = () => {
    const newState = {
      grid: createEmptyGrid(),
      piecesPlaced: 0,
      lastPlacedCell: null
    };
    saveState(newState);
    setSelectedRotation(0);
    setLastPlacedCell(null);
    setIsComplete(false);
    setErrorMessage('');
  };

  const getRandomColor = (id: number) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-4">T Tetromino Puzzle</h1>
        <p className="text-center text-gray-600 mb-4">
          Place T-shaped tetromino pieces on the grid. Each piece can be rotated 0°, 90°, 180°, or 270°.
        </p>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        {isComplete && (
          <p className="text-green-500 text-center mb-4">Puzzle Complete! 🎉</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Undo
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Reset
          </button>
          <button
            onClick={handleRedo}
            disabled={future.length === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Redo
          </button>
        </div>

        <div className="flex justify-center gap-4 mb-4">
          {[0, 90, 180, 270].map((rotation) => (
            <TetrominoOption
              key={rotation}
              rotation={rotation}
              isSelected={selectedRotation === rotation}
              onClick={() => setSelectedRotation(rotation)}
            />
          ))}
        </div>

        <div className="w-full overflow-x-auto flex justify-center">
          <div className="inline-grid grid-cols-8 gap-0.5 sm:gap-1 bg-gray-200 p-2 rounded">
            {currentState.grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                const isPartOfPiece = cell.isOccupied;
                const isVertical = cell.rotation === 90 || cell.rotation === 270;
                const isLastPlaced = lastPlacedCell && lastPlacedCell.row === rowIndex && lastPlacedCell.col === colIndex;
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`
                      w-[30px] h-[30px] sm:w-[40px] sm:h-[40px]
                      ${isPartOfPiece
                        ? `${getRandomColor(cell.dominoId!)} cursor-not-allowed ${isVertical ? 'border-t-0 border-b-0' : 'border-l-0 border-r-0'}`
                        : 'bg-white cursor-pointer hover:bg-gray-100'
                      }
                      ${isLastPlaced ? 'ring-4 ring-orange-500' : ''}
                      transition-colors duration-200
                      border border-gray-300
                      aspect-square
                      relative
                    `}
                  />
                );
              })
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-lg font-semibold">
            Pieces Placed: {currentState.piecesPlaced} / {MAX_PIECES}
          </p>
        </div>
      </div>
    </div>
  );
} 
