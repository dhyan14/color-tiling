'use client';

import React, { useState, useCallback } from 'react';

type Cell = {
  isOccupied: boolean;
  dominoId: number | null;
  orientation: 'horizontal' | 'vertical' | 'T' | null;
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
    useTetromino: true
  }
];

const TPiece: React.FC<{ rotation?: number }> = ({ rotation = 0 }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80" style={{ transform: `rotate(${rotation}deg)` }}>
    <rect x="20" y="0" width="20" height="60" className="fill-current" />
    <rect x="0" y="20" width="60" height="20" className="fill-current" />
  </svg>
);

const TPieceRotations: React.FC = () => (
  <div className="flex gap-8 items-center justify-center bg-gray-50 p-4 rounded-lg">
    {[0, 90, 180, 270].map((rotation) => (
      <div key={rotation} className="flex flex-col items-center">
        <div className="text-blue-600">
          <TPiece rotation={rotation} />
        </div>
        <span className="text-sm text-gray-600 mt-2">{rotation}°</span>
      </div>
    ))}
  </div>
);

const TetrominoOption: React.FC<{ rotation: number; isSelected: boolean; onClick: () => void }> = ({ rotation, isSelected, onClick }) => {
  const baseStyle = "w-[80px] h-[100px] relative transition-all hover:scale-105";
  const colorStyle = isSelected ? "text-blue-600" : "text-gray-500";
  
  const getTetrominoCells = () => {
    const cellSize = "w-[32px] h-[32px] rounded-xl";
    const baseCell = `absolute ${cellSize}`;
    const cellStyle = `${baseCell} bg-white border-[3px] ${isSelected ? "border-blue-600" : "border-gray-500"}`;
    const dotStyle = `absolute w-[8px] h-[8px] rounded-full ${isSelected ? "bg-blue-600" : "bg-gray-500"}`;
    
    const DominoCell = ({ className }: { className: string }) => (
      <div className={className}>
        <div className={dotStyle} style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }} />
      </div>
    );
    
    switch(rotation) {
      case 180: // First piece - T pointing up
        return (
          <>
            <DominoCell className={`${cellStyle} left-[24px] top-[62px]`} />
            <DominoCell className={`${cellStyle} left-[4px] top-[32px]`} />
            <DominoCell className={`${cellStyle} left-[24px] top-[32px]`} />
            <DominoCell className={`${cellStyle} left-[44px] top-[32px]`} />
          </>
        );
      case 90: // Second piece - T pointing left
        return (
          <>
            <DominoCell className={`${cellStyle} left-[24px] top-[2px]`} />
            <DominoCell className={`${cellStyle} left-[24px] top-[32px]`} />
            <DominoCell className={`${cellStyle} left-[24px] top-[62px]`} />
            <DominoCell className={`${cellStyle} left-[4px] top-[32px]`} />
          </>
        );
      case 0: // Third piece - T pointing down
        return (
          <>
            <DominoCell className={`${cellStyle} left-[24px] top-[2px]`} />
            <DominoCell className={`${cellStyle} left-[4px] top-[32px]`} />
            <DominoCell className={`${cellStyle} left-[24px] top-[32px]`} />
            <DominoCell className={`${cellStyle} left-[44px] top-[32px]`} />
          </>
        );
      case 270: // Fourth piece - T pointing right
        return (
          <>
            <DominoCell className={`${cellStyle} left-[24px] top-[2px]`} />
            <DominoCell className={`${cellStyle} left-[24px] top-[32px]`} />
            <DominoCell className={`${cellStyle} left-[24px] top-[62px]`} />
            <DominoCell className={`${cellStyle} left-[44px] top-[32px]`} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${colorStyle} transform hover:shadow-xl`}
    >
      {getTetrominoCells()}
    </button>
  );
};

export default function GameBoard() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedRotation, setSelectedRotation] = useState<number>(0); // Add state for T-piece rotation
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
      // Get required cells based on rotation
      const requiredCells = getTRequiredCells(row, col, selectedRotation);
      
      // Check if all cells are within bounds
      if (!requiredCells.every(([r, c]) => 
        r >= 0 && r < currentPuzzle.gridSize && 
        c >= 0 && c < currentPuzzle.gridSize)) {
        setErrorMessage("Can't place T-piece here - out of bounds!");
        return;
      }
      
      // Check if all required cells are free
      if (requiredCells.some(([r, c]) => newGrid[r][c].isOccupied)) {
        setErrorMessage("Can't place T-piece here - space already occupied!");
        return;
      }

      isValidMove = true;
      const pieceId = currentState.dominoesPlaced + 1;
      
      requiredCells.forEach(([r, c], index) => {
        newGrid[r][c] = {
          ...newGrid[r][c],
          isOccupied: true,
          dominoId: pieceId,
          orientation: 'T',
          isFirst: index === 0,
          rotation: selectedRotation
        };
      });
    } else {
      // Existing domino placement logic
      if (selectedOrientation === 'horizontal') {
        if (col >= currentPuzzle.gridSize - 1) {
          setErrorMessage("Can't place horizontal domino here - out of bounds!");
          return;
        }
        if (newGrid[row][col].isOccupied || newGrid[row][col + 1].isOccupied) {
          setErrorMessage("Can't place domino here - space already occupied!");
          return;
        }
        isValidMove = true;
        const dominoId = currentState.dominoesPlaced + 1;
        newGrid[row][col] = {
          ...newGrid[row][col],
          isOccupied: true,
          dominoId,
          orientation: 'horizontal',
          isFirst: true,
        };
        newGrid[row][col + 1] = {
          ...newGrid[row][col + 1],
          isOccupied: true,
          dominoId,
          orientation: 'horizontal',
          isFirst: false,
        };
      } else {
        if (row >= currentPuzzle.gridSize - 1) {
          setErrorMessage("Can't place vertical domino here - out of bounds!");
          return;
        }
        if (newGrid[row][col].isOccupied || newGrid[row + 1][col].isOccupied) {
          setErrorMessage("Can't place domino here - space already occupied!");
          return;
        }
        isValidMove = true;
        const dominoId = currentState.dominoesPlaced + 1;
        newGrid[row][col] = {
          ...newGrid[row][col],
          isOccupied: true,
          dominoId,
          orientation: 'vertical',
          isFirst: true,
        };
        newGrid[row + 1][col] = {
          ...newGrid[row][col + 1],
          isOccupied: true,
          dominoId,
          orientation: 'vertical',
          isFirst: false,
        };
      }
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
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-xl font-bold text-gray-700">
        Puzzle {puzzleIndex + 1}: {currentPuzzle.description}
      </h2>

      {showSuccess && (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-100 text-green-700 px-6 py-3 rounded-lg text-lg font-semibold animate-bounce">
            🎉 Congratulations! You've completed the puzzle! 🎉
          </div>
          {puzzleIndex + 1 < PUZZLES.length && !currentPuzzle.requiresPassword && (
            <button
              onClick={handleNextPuzzle}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Next Puzzle →
            </button>
          )}
        </div>
      )}
      
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Enter Password</h3>
            <input
              type="text"
              maxLength={4}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              className="border-2 border-gray-300 rounded px-3 py-2 mb-4 w-full focus:border-blue-500 outline-none"
              placeholder="Enter 4-digit password"
            />
            {passwordError && (
              <p className="text-red-500 text-sm mb-4">Incorrect password. Please try again.</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-6 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {currentPuzzle.useTetromino ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-600">Select a T-piece type to place</p>
          <div className="flex gap-8 items-center justify-center p-4">
            {[180, 90, 0, 270].map((rotation) => (
              <TetrominoOption
                key={rotation}
                rotation={rotation}
                isSelected={selectedRotation === rotation}
                onClick={() => setSelectedRotation(rotation)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-8 mb-4">
          <button
            onClick={() => setSelectedOrientation('horizontal')}
            className={`p-2 rounded transition-all ${
              selectedOrientation === 'horizontal'
                ? 'bg-blue-100 text-blue-600 scale-110'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Place horizontal domino"
          >
            <div className="w-[60px] h-[30px] border-2 border-current rounded-lg relative">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-current"/>
              <div className="absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current"/>
              <div className="absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current"/>
            </div>
          </button>
          <button
            onClick={() => setSelectedOrientation('vertical')}
            className={`p-2 rounded transition-all ${
              selectedOrientation === 'vertical'
                ? 'bg-blue-100 text-blue-600 scale-110'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Place vertical domino"
          >
            <div className="w-[30px] h-[60px] border-2 border-current rounded-lg relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-current"/>
              <div className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current"/>
              <div className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-current"/>
            </div>
          </button>
        </div>
      )}
      
      <div className={`grid gap-1 bg-gray-200 p-2 rounded ${
        currentPuzzle.gridSize === 8 ? 'grid-cols-8' : 'grid-cols-6'
      }`}>
        {currentState.grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`w-12 h-12 ${
                cell.isBlocked
                  ? 'bg-gray-800 cursor-not-allowed'
                  : cell.isOccupied
                    ? `${getRandomColor(cell.dominoId!)} cursor-not-allowed`
                    : 'bg-white cursor-pointer hover:bg-gray-100'
              } transition-colors duration-200`}
            />
          ))
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-lg font-semibold">
          Dominoes Placed: {currentState.dominoesPlaced} / {currentPuzzle.maxDominoes}
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`px-4 py-2 rounded ${
              history.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            ↩ Undo
          </button>
          
          <button
            onClick={handleRedo}
            disabled={future.length === 0}
            className={`px-4 py-2 rounded ${
              future.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            Redo ↪
          </button>
          
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Reset Game
          </button>

          {currentPuzzle.requiresPassword && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              I Completed the Puzzle
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 