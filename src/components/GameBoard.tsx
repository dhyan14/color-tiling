'use client';

import React, { useState, useCallback } from 'react';
import type { FC } from 'react';

type Cell = {
  isOccupied: boolean;
  dominoId: number | null;
  orientation: 'horizontal' | 'vertical' | 'T' | 'square' | null;
  isFirst: boolean;
  isBlocked?: boolean; // For blocked cells in puzzle 2
  rotation?: number; // Add rotation for T pieces
};

type GameState = {
  grid: Cell[][];
  dominoesPlaced: number;
};

type PuzzleConfig = {
  gridSize: number;
  maxDominoes: number;
  blockedCells: { row: number; col: number }[];
  description: string;
  requiresPassword?: boolean;
  password?: string;
  useTetromino?: boolean;
  useSquareTetromino?: boolean;
  maxSquareTetrominoes?: number;
};

const PUZZLES: PuzzleConfig[] = [
  {
    gridSize: 6,
    maxDominoes: 18,
    blockedCells: [],
    description: "Place 18 dominoes on a 6x6 grid",
    requiresPassword: true,
    password: "3141"
  },
  {
    gridSize: 6,
    maxDominoes: 17,
    blockedCells: [
      { row: 0, col: 0 },
      { row: 5, col: 5 },
    ],
    description: "Place 17 dominoes on a 6x6 grid with blocked corners",
    requiresPassword: true,
    password: "2718"
  },
  {
    gridSize: 8,
    maxDominoes: 16,
    blockedCells: [],
    description: "Place T-shaped tetromino pieces on an 8x8 grid",
    useTetromino: true,
    requiresPassword: true,
    password: "1618"
  },
  {
    gridSize: 6,
    maxDominoes: 9,
    blockedCells: [],
    description: "Place T-shaped tetromino pieces on a 6x6 grid",
    useTetromino: true,
    requiresPassword: true,
    password: "1414"
  },
  {
    gridSize: 8,
    maxDominoes: 16,
    blockedCells: [],
    description: "Place 15 T-tetrominoes and 1 square tetromino on an 8x8 grid",
    useTetromino: true,
    useSquareTetromino: true,
    maxSquareTetrominoes: 1,
    requiresPassword: true,
    password: "2236"
  }
];

const TPiece: React.FC<{ rotation?: number }> = ({ rotation = 0 }) => {
  const cellSize = "w-[15px] h-[15px] sm:w-[20px] sm:h-[20px]";
  const baseCell = `absolute ${cellSize}`;
  const dotStyle = "absolute w-[4px] h-[4px] sm:w-[6px] sm:h-[6px] rounded-full bg-current left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-current`}>
      <div className={dotStyle} />
    </div>
  );

  return (
    <div className="relative w-[45px] h-[45px] sm:w-[60px] sm:h-[60px]" style={{ transform: `rotate(${rotation}deg)` }}>
      {/* Top horizontal row */}
      <DominoCell 
        className={`${baseCell} left-[0px] top-[0px]`}
        borders="border-t-[2px] border-l-[2px] border-b-[2px] sm:border-t-[3px] sm:border-l-[3px] sm:border-b-[3px]"
      />
      <DominoCell 
        className={`${baseCell} left-[15px] sm:left-[20px] top-[0px]`}
        borders="border-t-[2px] border-b-[2px] sm:border-t-[3px] sm:border-b-[3px]"
      />
      <DominoCell 
        className={`${baseCell} left-[30px] sm:left-[40px] top-[0px]`}
        borders="border-t-[2px] border-r-[2px] border-b-[2px] sm:border-t-[3px] sm:border-r-[3px] sm:border-b-[3px]"
      />
      {/* Bottom stem */}
      <DominoCell 
        className={`${baseCell} left-[15px] sm:left-[20px] top-[15px] sm:top-[20px]`}
        borders="border-l-[2px] border-r-[2px] border-b-[2px] sm:border-l-[3px] sm:border-r-[3px] sm:border-b-[3px]"
      />
    </div>
  );
};

const TPieceRotations: React.FC = () => (
  <div className="flex flex-col gap-4 sm:gap-8 items-center justify-center bg-gray-50 p-3 sm:p-6 rounded-lg">
    <div className="grid grid-cols-2 gap-4 sm:gap-16">
      {[0, 90, 180, 270].map((rotation) => (
        <div key={rotation} className="flex flex-col items-center bg-white p-2 sm:p-4 rounded-lg shadow-sm">
          <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] flex items-center justify-center bg-white">
            <div className="text-blue-600">
              <TPiece rotation={rotation} />
            </div>
          </div>
          <span className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">{rotation}°</span>
        </div>
      ))}
    </div>
  </div>
);

interface TetrominoOptionProps {
  rotation: number;
  isSelected: boolean;
  onClick: () => void;
}

const TetrominoOption: React.FC<TetrominoOptionProps> = ({ rotation, isSelected, onClick }) => {
  const baseStyle = "w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] relative transition-all hover:scale-105";
  const colorStyle = isSelected ? "text-blue-600" : "text-gray-500";
  
  const getTetrominoCells = () => {
    const cellSize = "w-[15px] h-[15px] sm:w-[20px] sm:h-[20px]";
    const baseCell = `absolute ${cellSize}`;
    const dotStyle = `absolute w-[4px] h-[4px] sm:w-[6px] sm:h-[6px] rounded-full ${isSelected ? "bg-blue-600" : "bg-gray-500"}`;
    
    const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
      <div className={`${className} bg-white ${borders} ${isSelected ? "border-blue-600" : "border-gray-500"} border-[2px] sm:border-[3px]`}>
        <div className={dotStyle} style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>
    );

    switch(rotation) {
      case 0: // T pointing down (now in first position)
        return (
          <>
            {/* Bottom horizontal row */}
            <DominoCell 
              className={`${baseCell} left-[10px] top-[40px]`}
              borders="border-l-[3px] border-b-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[30px] top-[40px]`}
              borders="border-b-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[50px] top-[40px]`}
              borders="border-r-[3px] border-b-[3px]"
            />
            {/* Top vertical stem */}
            <DominoCell 
              className={`${baseCell} left-[30px] top-[20px]`}
              borders="border-t-[3px] border-x-[3px]"
            />
          </>
        );
      case 90: // T pointing left
        return (
          <>
            {/* Vertical line */}
            <DominoCell 
              className={`${baseCell} left-[30px] top-[0px]`}
              borders="border-t-[3px] border-x-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[30px] top-[20px]`}
              borders="border-x-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[30px] top-[40px]`}
              borders="border-b-[3px] border-x-[3px]"
            />
            {/* Left stem */}
            <DominoCell 
              className={`${baseCell} left-[10px] top-[20px]`}
              borders="border-l-[3px] border-y-[3px]"
            />
          </>
        );
      case 180: // T pointing up (now in third position)
        return (
          <>
            {/* Top horizontal row */}
            <DominoCell 
              className={`${baseCell} left-[10px] top-[20px]`}
              borders="border-l-[3px] border-t-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[30px] top-[20px]`}
              borders="border-t-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[50px] top-[20px]`}
              borders="border-r-[3px] border-t-[3px]"
            />
            {/* Bottom stem */}
            <DominoCell 
              className={`${baseCell} left-[30px] top-[40px]`}
              borders="border-b-[3px] border-x-[3px]"
            />
          </>
        );
      case 270: // T pointing right
        return (
          <>
            {/* Vertical line */}
            <DominoCell 
              className={`${baseCell} left-[30px] top-[0px]`}
              borders="border-t-[3px] border-x-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[30px] top-[20px]`}
              borders="border-x-[3px]"
            />
            <DominoCell 
              className={`${baseCell} left-[30px] top-[40px]`}
              borders="border-b-[3px] border-x-[3px]"
            />
            {/* Right stem */}
            <DominoCell 
              className={`${baseCell} left-[50px] top-[20px]`}
              borders="border-r-[3px] border-y-[3px]"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${colorStyle} flex items-center justify-center p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      <div className="relative w-full h-full">
        {getTetrominoCells()}
      </div>
    </button>
  );
};

const SquarePiece: React.FC = () => {
  const cellSize = "w-[20px] h-[20px]";
  const baseCell = `absolute ${cellSize}`;
  const dotStyle = "absolute w-[6px] h-[6px] rounded-full bg-current left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";

  const DominoCell = ({ className, borders }: { className: string; borders: string }) => (
    <div className={`${className} bg-white ${borders} border-current`}>
      <div className={dotStyle} />
    </div>
  );

  return (
    <div className="relative w-[60px] h-[60px]">
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

export default function GameBoard() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedRotation, setSelectedRotation] = useState<number>(0);
  const [squareTetrominoUsed, setSquareTetrominoUsed] = useState(false);
  const currentPuzzle = PUZZLES[puzzleIndex];

  const createEmptyGrid = (puzzleConfig: PuzzleConfig): Cell[][] => {
    const grid = Array(puzzleConfig.gridSize).fill(null).map(() =>
      Array(puzzleConfig.gridSize).fill(null).map(() => ({
        isOccupied: false,
        dominoId: null,
        orientation: null,
        isFirst: false,
        isBlocked: false,
      }))
    );

    // Mark blocked cells
    puzzleConfig.blockedCells.forEach(({row, col}) => {
      grid[row][col].isBlocked = true;
      grid[row][col].isOccupied = true;
    });

    return grid;
  };

  const [currentState, setCurrentState] = useState<GameState>({
    grid: createEmptyGrid(currentPuzzle),
    dominoesPlaced: 0
  });

  const [history, setHistory] = useState<GameState[]>([]);
  const [future, setFuture] = useState<GameState[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePasswordSubmit = () => {
    if (password === currentPuzzle.password) {
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError(false);
      handleNextPuzzle();
    } else {
      setPasswordError(true);
    }
  };

  const handleNextPuzzle = () => {
    if (puzzleIndex + 1 < PUZZLES.length) {
      setPuzzleIndex(puzzleIndex + 1);
      const nextPuzzle = PUZZLES[puzzleIndex + 1];
      const newState = {
        grid: createEmptyGrid(nextPuzzle),
        dominoesPlaced: 0
      };
      setCurrentState(newState);
      setHistory([]);
      setFuture([]);
      setShowSuccess(false);
      setErrorMessage(null);
    }
  };

  const saveState = (newState: GameState) => {
    setHistory(prev => [...prev, currentState]);
    setCurrentState(newState);
    setFuture([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    
    setFuture(prev => [currentState, ...prev]);
    setHistory(newHistory);
    setCurrentState(previousState);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    
    const nextState = future[0];
    const newFuture = future.slice(1);
    
    setHistory(prev => [...prev, currentState]);
    setFuture(newFuture);
    setCurrentState(nextState);
    setErrorMessage(null);
  };

  const checkGameCompletion = (grid: Cell[][]) => {
    // Check if all non-blocked cells are occupied
    const allCellsOccupied = grid.every(row => 
      row.every(cell => cell.isOccupied)
    );
    
    if (allCellsOccupied) {
      setShowSuccess(true);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (currentState.dominoesPlaced >= currentPuzzle.maxDominoes) {
      setErrorMessage("Maximum number of pieces placed!");
      return;
    }

    const newGrid = JSON.parse(JSON.stringify(currentState.grid));
    
    if (newGrid[row][col].isBlocked) {
      setErrorMessage("This cell is blocked!");
      return;
    }

    let isValidMove = false;
    
    if (currentPuzzle.useTetromino) {
      // Handle square tetromino placement
      if (selectedRotation === -1) {
        if (squareTetrominoUsed) {
          setErrorMessage("Square piece already used!");
          return;
        }
        
        // Check if we can place a 2x2 square
        if (row + 1 >= currentPuzzle.gridSize || col + 1 >= currentPuzzle.gridSize) {
          setErrorMessage("Can't place square piece here - out of bounds!");
          return;
        }
        
        const canPlaceSquare = !newGrid[row][col].isOccupied &&
          !newGrid[row][col + 1].isOccupied &&
          !newGrid[row + 1][col].isOccupied &&
          !newGrid[row + 1][col + 1].isOccupied;

        if (!canPlaceSquare) {
          setErrorMessage("Can't place square piece here - space already occupied!");
          return;
        }

        const dominoId = currentState.dominoesPlaced + 1;

        // Place the 2x2 square
        for (let r = row; r <= row + 1; r++) {
          for (let c = col; c <= col + 1; c++) {
            newGrid[r][c] = {
              isOccupied: true,
              dominoId,
              orientation: 'square',
              isFirst: r === row && c === col,
              rotation: 0
            };
          }
        }

        const newState = {
          grid: newGrid,
          dominoesPlaced: dominoId
        };

        setSquareTetrominoUsed(true);
        saveState(newState);
        setErrorMessage(null);
        checkGameCompletion(newGrid);
        return;
      }

      // Handle T tetromino placement
      const requiredCells = getTRequiredCells(row, col, selectedRotation);
      
      // Check bounds
      if (requiredCells.some(([r, c]) => r < 0 || r >= currentPuzzle.gridSize || c < 0 || c >= currentPuzzle.gridSize)) {
        setErrorMessage("Can't place T-piece here - out of bounds!");
        return;
      }
      
      // Check if all required cells are free
      if (requiredCells.some(([r, c]) => newGrid[r][c].isOccupied)) {
        setErrorMessage("Can't place T-piece here - space already occupied!");
        return;
      }

      const dominoId = currentState.dominoesPlaced + 1;
      
      // Place the T piece
      requiredCells.forEach(([r, c], index) => {
        newGrid[r][c] = {
          isOccupied: true,
          dominoId,
          orientation: 'T',
          isFirst: index === 0,
          rotation: selectedRotation
        };
      });

      const newState = {
        grid: newGrid,
        dominoesPlaced: dominoId
      };

      saveState(newState);
      setErrorMessage(null);
      checkGameCompletion(newGrid);
      return;
    }

    // Handle regular domino placement
    if (selectedOrientation === 'horizontal') {
      if (col + 1 >= currentPuzzle.gridSize) {
        setErrorMessage("Can't place domino here - out of bounds!");
        return;
      }
      if (newGrid[row][col].isOccupied || newGrid[row][col + 1].isOccupied) {
        setErrorMessage("Can't place domino here - space already occupied!");
        return;
      }
      isValidMove = true;
      const dominoId = currentState.dominoesPlaced + 1;
      newGrid[row][col] = {
        isOccupied: true,
        dominoId,
        orientation: 'horizontal',
        isFirst: true,
      };
      newGrid[row][col + 1] = {
        isOccupied: true,
        dominoId,
        orientation: 'horizontal',
        isFirst: false,
      };
    } else {
      if (row + 1 >= currentPuzzle.gridSize) {
        setErrorMessage("Can't place domino here - out of bounds!");
        return;
      }
      if (newGrid[row][col].isOccupied || newGrid[row + 1][col].isOccupied) {
        setErrorMessage("Can't place domino here - space already occupied!");
        return;
      }
      isValidMove = true;
      const dominoId = currentState.dominoesPlaced + 1;
      newGrid[row][col] = {
        isOccupied: true,
        dominoId,
        orientation: 'vertical',
        isFirst: true,
      };
      newGrid[row + 1][col] = {
        isOccupied: true,
        dominoId,
        orientation: 'vertical',
        isFirst: false,
      };
    }

    if (isValidMove) {
      const newState = {
        grid: newGrid,
        dominoesPlaced: currentState.dominoesPlaced + 1
      };
      saveState(newState);
      setErrorMessage(null);
      checkGameCompletion(newGrid);
    }
  };

  // Helper function to get required cells for T piece based on rotation
  const getTRequiredCells = (row: number, col: number, rotation: number): [number, number][] => {
    // Map the visual rotation to the actual rotation for placement
    const visualToActualRotation = {
      180: 0,  // First piece (visually up) maps to down rotation
      90: 90,  // Second piece (visually left) stays as left
      0: 180,  // Third piece (visually down) maps to up rotation
      270: 270 // Fourth piece (visually right) stays as right
    };
    
    // Use the mapped rotation for placement
    const actualRotation = visualToActualRotation[rotation as keyof typeof visualToActualRotation];
    
    switch(actualRotation) {
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

  const handleReset = () => {
    const newState = {
      grid: createEmptyGrid(currentPuzzle),
      dominoesPlaced: 0
    };
    saveState(newState);
    setErrorMessage(null);
    setShowSuccess(false);
  };

  const getRandomColor = (id: number) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-lg px-2 sm:px-4">
      {!showPasswordModal && currentPuzzle.requiresPassword ? (
        <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Enter Password</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter password"
          />
          <button
            onClick={handlePasswordSubmit}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      ) : (
        <>
          <div className="w-full bg-white rounded-lg shadow-md p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <div className="text-sm sm:text-base mb-2 sm:mb-0">
                {currentPuzzle.useTetromino
                  ? `T-Pieces placed: ${currentState.dominoesPlaced}/${currentPuzzle.maxDominoes}`
                  : `Dominoes placed: ${currentState.dominoesPlaced}/${currentPuzzle.maxDominoes}`}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Undo
                </button>
                <button
                  onClick={handleRedo}
                  disabled={future.length === 0}
                  className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Redo
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Reset
                </button>
              </div>
            </div>

            {currentPuzzle.useTetromino && (
              <div className="mb-4">
                <h3 className="text-sm sm:text-base font-medium mb-2">Select T-Piece Rotation:</h3>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                  {[0, 90, 180, 270].map((rot) => (
                    <TetrominoOption
                      key={rot}
                      rotation={rot}
                      isSelected={selectedRotation === rot}
                      onClick={() => setSelectedRotation(rot)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-0.5 sm:gap-1 p-2 bg-gray-100 rounded-lg overflow-x-auto">
              {currentState.grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => {
                    const cellSize = currentPuzzle.gridSize === 8
                      ? "w-[30px] h-[30px] sm:w-[40px] sm:h-[40px]"
                      : "w-[35px] h-[35px] sm:w-[50px] sm:h-[50px]";
                    return (
                      <div
                        key={colIndex}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        className={`
                          ${cellSize}
                          ${cell.isBlocked ? 'bg-gray-400' : cell.isOccupied ? getRandomColor(cell.dominoId!) : 'bg-white hover:bg-gray-100'}
                          border border-gray-300
                          flex items-center justify-center
                          cursor-pointer
                          transition-colors
                          relative
                        `}
                      >
                        {cell.isOccupied && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white opacity-60" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {showSuccess && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <h2 className="text-xl font-bold mb-4">Congratulations!</h2>
                <p className="mb-4">You've completed the puzzle!</p>
                <button
                  onClick={handleNextPuzzle}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next Puzzle
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 