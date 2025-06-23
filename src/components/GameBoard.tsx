'use client';

import { FC, useState, useCallback } from 'react';
import TetrominoPieceSelector from './TetrominoPieceSelector';
import { StraightPiece, TPiece, SquarePiece, LPiece, SkewPiece } from '@/components/TetrominoPieces';

type TetrominoType = 'straight' | 'T' | 'square' | 'L' | 'skew';

type Cell = {
  isOccupied: boolean;
  dominoId: number | null;
  orientation: TetrominoType | null;
  isFirst: boolean;
  isBlocked?: boolean;
  rotation?: number;
  isReflected?: boolean;
  isPreview?: boolean;
};

type GameState = {
  grid: Cell[][];
  dominoesPlaced: number;
  usedTetrominoTypes?: TetrominoType[];
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
  tetrominoTypes?: TetrominoType[];
  gridWidth?: number;
  specialMiddleCell?: boolean;
  allowRotation?: boolean;
  allowReflection?: boolean;
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
    password: "1732"
  },
  {
    gridSize: 4,
    maxDominoes: 5,
    blockedCells: [],
    description: "Place different Tetromino pieces (Straight, T, Square, L, and Skew) on a 4x5 grid. Each piece can only be used once. Try to fill the entire grid!",
    useTetromino: true,
    requiresPassword: true,
    password: "1732",
    tetrominoTypes: ['straight', 'T', 'square', 'L', 'skew'],
    gridWidth: 5,
    allowRotation: true,
    allowReflection: true
  },
  {
    gridSize: 5,
    maxDominoes: 9,
    blockedCells: [],
    description: "Place 8 straight trominoes and 1 square domino on a 5x5 grid. The middle cell can only be used by the square domino.",
    useTetromino: true,
    useSquareTetromino: true,
    maxSquareTetrominoes: 1,
    tetrominoTypes: ['straight', 'square'],
    specialMiddleCell: true,
    requiresPassword: true,
    password: "0693"
  }
];

interface TetrominoOptionProps {
  rotation: number;
  isSelected: boolean;
  onClick: () => void;
}

const TetrominoOption: FC<TetrominoOptionProps> = ({ rotation, isSelected, onClick }) => {
  const baseStyle = "w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] relative transition-all hover:scale-105";
  const colorStyle = isSelected ? "text-blue-600 ring-2 ring-blue-500" : "text-gray-500";

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${colorStyle} flex items-center justify-center p-2 rounded-lg focus:outline-none`}
    >
      <div className="relative w-full h-full">
        <TPiece rotation={rotation} isSelected={isSelected} />
    </div>
    </button>
  );
};

const getTetrominoRequiredCells = (row: number, col: number, type: TetrominoType, rotation: number, isReflected: boolean = false, puzzle?: PuzzleConfig): [number, number][] => {
  const cells: [number, number][] = [];
  
  switch (type) {
    case 'straight':
      // For puzzle 7, we use tromino (3 cells) instead of tetromino (4 cells)
      if (puzzle?.specialMiddleCell) {
        // Only horizontal (0/180) and vertical (90/270)
        if (rotation === 0 || rotation === 180) {
          cells.push([row, col], [row, col + 1], [row, col + 2]);
        } else {
          cells.push([row, col], [row + 1, col], [row + 2, col]);
        }
      } else {
        // Original tetromino behavior for other puzzles
        if (rotation === 0 || rotation === 180) {
          cells.push([row, col], [row, col + 1], [row, col + 2], [row, col + 3]);
        } else {
          cells.push([row, col], [row + 1, col], [row + 2, col], [row + 3, col]);
        }
      }
      break;
      
    case 'T':
      if (rotation === 0) {
        cells.push([row, col], [row, col + 1], [row, col + 2], [row + 1, col + 1]);
      } else if (rotation === 90) {
        cells.push([row - 1, col], [row, col], [row + 1, col], [row, col + 1]);
      } else if (rotation === 180) {
        cells.push([row - 1, col + 1], [row, col], [row, col + 1], [row, col + 2]);
      } else { // 270
        cells.push([row - 1, col], [row, col - 1], [row, col], [row + 1, col]);
      }
      break;
      
    case 'square':
      cells.push([row, col], [row, col + 1], [row + 1, col], [row + 1, col + 1]);
      break;
      
    case 'L':
      if (rotation === 0) {
        cells.push(
          [row, col],
          [row + 1, col],
          [row + 2, col],
          [row + 2, col + (isReflected ? -1 : 1)]
        );
      } else if (rotation === 90) {
        if (isReflected) {
          cells.push(
            [row, col],
            [row, col + 1],
            [row, col + 2],
            [row + 1, col]
          );
        } else {
          cells.push(
            [row, col],
            [row, col + 1],
            [row, col + 2],
            [row - 1, col]
          );
        }
      } else if (rotation === 180) {
        cells.push(
          [row, col],
          [row - 1, col],
          [row - 2, col],
          [row - 2, col + (isReflected ? 1 : -1)]
        );
      } else {
        if (isReflected) {
          cells.push(
            [row, col],
            [row, col + 1],
            [row, col + 2],
            [row - 1, col + 2]
          );
        } else {
          cells.push(
            [row, col],
            [row, col + 1],
            [row, col + 2],
            [row + 1, col + 2]
          );
        }
      }
      break;
      
    case 'skew':
      if (rotation === 0 || rotation === 180) {
        cells.push(
          [row, col],
          [row, col + 1],
          [row + 1, col + 1],
          [row + 1, col + 2]
        );
      } else {
        cells.push(
          [row, col],
          [row + 1, col],
          [row + 1, col - 1],
          [row + 2, col - 1]
        );
      }
      break;
  }
  
  return cells;
};

const TetrominoSelector: FC<{
  selectedType: TetrominoType | null;
  onSelect: (type: TetrominoType) => void;
  rotation: number;
  onRotate: (rotation: number) => void;
  isReflected: boolean;
  onReflect: (reflected: boolean) => void;
  availableTypes: TetrominoType[];
  isTromino: boolean;
}> = ({ selectedType, onSelect, rotation, onRotate, isReflected, onReflect, availableTypes, isTromino }) => {
  return (
    <div className="flex flex-col gap-4 items-center p-4 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-5 gap-4">
        {availableTypes.map((type) => (
    <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-2 rounded-lg transition-colors ${
              selectedType === type ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {type === 'straight' && <StraightPiece rotation={selectedType === type ? rotation : 0} isTromino={isTromino} />}
            {type === 'T' && <TPiece rotation={selectedType === type ? rotation : 0} />}
            {type === 'square' && <SquarePiece />}
            {type === 'L' && <LPiece rotation={selectedType === type ? rotation : 0} isReflected={selectedType === type && isReflected} />}
            {type === 'skew' && <SkewPiece rotation={selectedType === type ? rotation : 0} isReflected={selectedType === type && isReflected} />}
    </button>
        ))}
      </div>
      
      {selectedType && selectedType !== 'square' && (
        <div className="flex flex-col gap-2 w-full">
          <div className="flex justify-center gap-2">
            {[0, 90, 180, 270].map((r) => (
              <button
                key={r}
                onClick={() => onRotate(r)}
                className={`p-2 rounded-lg transition-colors ${
                  rotation === r ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {r}°
              </button>
            ))}
    </div>
          
          {(selectedType === 'L' || selectedType === 'skew') && (
            <button
              onClick={() => onReflect(!isReflected)}
              className={`mt-2 p-2 rounded-lg transition-colors ${
                isReflected ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Reflect
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function GameBoard() {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [selectedTetrominoType, setSelectedTetrominoType] = useState<TetrominoType | null>(null);
  const [selectedRotation, setSelectedRotation] = useState<number>(0);
  const [selectedIsReflected, setSelectedIsReflected] = useState<boolean>(false);
  const [previewCells, setPreviewCells] = useState<[number, number][]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentPuzzle = PUZZLES[puzzleIndex];

  const [availableTetrominoTypes, setAvailableTetrominoTypes] = useState<TetrominoType[]>([
    'straight', 'T', 'square', 'L', 'skew'
  ]);

  const createEmptyGrid = (puzzleConfig: PuzzleConfig): Cell[][] => {
    const rows = puzzleConfig.gridSize;
    const cols = puzzleConfig.gridWidth || puzzleConfig.gridSize;
    const grid: Cell[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isOccupied: false,
        dominoId: null,
        orientation: null,
        isFirst: false,
        isPreview: false
      }))
    );

    puzzleConfig.blockedCells.forEach(({ row, col }) => {
      if (row < rows && col < cols) {
        grid[row][col] = {
          isOccupied: false,
          dominoId: null,
          orientation: null,
          isFirst: false,
          isBlocked: true,
          isPreview: false
        };
      }
    });

    return grid;
  };

  const [currentState, setCurrentState] = useState<GameState>({
    grid: createEmptyGrid(currentPuzzle),
    dominoesPlaced: 0
  });

  const [history, setHistory] = useState<GameState[]>([]);
  const [future, setFuture] = useState<GameState[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePasswordSubmit = () => {
    const cleanPassword = password.trim();
    if (cleanPassword === currentPuzzle.password) {
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
        dominoesPlaced: 0,
        usedTetrominoTypes: []
      };
      setCurrentState(newState);
      setHistory([]);
      setFuture([]);
      setShowSuccess(false);
      setErrorMessage(null);
      setShowPasswordModal(false);
      setPassword('');
      setPasswordError(false);
      setSelectedTetrominoType(null);
      setSelectedRotation(0);
      setSelectedIsReflected(false);
      setPreviewCells([]);
      setAvailableTetrominoTypes(nextPuzzle.tetrominoTypes || ['straight', 'T', 'square', 'L', 'skew']);
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
    const allCellsOccupied = grid.every(row => 
      row.every(cell => cell.isBlocked || cell.isOccupied)
    );
    
    if (allCellsOccupied) {
      setShowSuccess(true);
      if (currentPuzzle.requiresPassword) {
        setShowPasswordModal(true);
      }
    }
  };

  const isValidPlacement = (row: number, col: number, type: TetrominoType, rotation: number, isReflected: boolean): boolean => {
    if (!currentPuzzle || !currentState) return false;
    
    const requiredCells = getTetrominoRequiredCells(row, col, type, rotation, isReflected, currentPuzzle);
    
    // Check bounds
    const isWithinBounds = requiredCells.every(([r, c]) => {
      const maxRow = currentPuzzle.gridSize - 1;
      const maxCol = (currentPuzzle.gridWidth || currentPuzzle.gridSize) - 1;
      return r >= 0 && r <= maxRow && c >= 0 && c <= maxCol;
    });
    
    if (!isWithinBounds) return false;
    
    // Check if cells are empty and not blocked
    const areAllCellsValid = requiredCells.every(([r, c]) => {
      const cell = currentState.grid[r][c];
      return !cell.isOccupied && !cell.isBlocked;
    });
    
    if (!areAllCellsValid) return false;

    // Check special middle cell restriction
    if (currentPuzzle.specialMiddleCell) {
      const middleRow = Math.floor(currentPuzzle.gridSize / 2);
      const middleCol = Math.floor(currentPuzzle.gridSize / 2);
      const isMiddleCell = (r: number, c: number) => r === middleRow && c === middleCol;

      if (type === 'straight' && requiredCells.some(([r, c]) => isMiddleCell(r, c))) {
        return false;
      }

      if (type === 'square' && !requiredCells.some(([r, c]) => isMiddleCell(r, c))) {
        return false;
      }
    }

    return true;
  };

  const handleCellHover = (row: number, col: number) => {
    if (!selectedTetrominoType || !currentPuzzle.tetrominoTypes) {
      setPreviewCells([]);
      return;
    }

    const requiredCells = getTetrominoRequiredCells(row, col, selectedTetrominoType, selectedRotation, selectedIsReflected, currentPuzzle);
    setPreviewCells(isValidPlacement(row, col, selectedTetrominoType, selectedRotation, selectedIsReflected) ? requiredCells : []);
  };

  const handleCellClick = (row: number, col: number) => {
    if (!currentPuzzle || !currentState) return;
    
    if (currentState.grid[row][col].isBlocked) {
      setErrorMessage("This cell is blocked!");
      return;
    }
    
    if (currentPuzzle.tetrominoTypes) {
      if (!selectedTetrominoType) {
        setErrorMessage("Please select a piece type first!");
        return;
      }

      if (currentState.usedTetrominoTypes?.includes(selectedTetrominoType)) {
        setErrorMessage(`${selectedTetrominoType} piece has already been used!`);
        return;
      }

      if (!isValidPlacement(row, col, selectedTetrominoType, selectedRotation, selectedIsReflected)) {
        setErrorMessage("Invalid placement! Check the piece position and orientation.");
        return;
      }

      const newGrid = JSON.parse(JSON.stringify(currentState.grid));
      const dominoId = currentState.dominoesPlaced + 1;
      const requiredCells = getTetrominoRequiredCells(row, col, selectedTetrominoType, selectedRotation, selectedIsReflected, currentPuzzle);
      
      requiredCells.forEach(([r, c], index) => {
        newGrid[r][c] = {
          isOccupied: true,
          dominoId,
          orientation: selectedTetrominoType,
          isFirst: index === 0,
          rotation: selectedRotation,
          isReflected: selectedIsReflected
        };
      });
      
      const newUsedTypes = [...(currentState.usedTetrominoTypes || []), selectedTetrominoType];
      
      saveState({
        grid: newGrid,
        dominoesPlaced: dominoId,
        usedTetrominoTypes: newUsedTypes
      });
      
      setAvailableTetrominoTypes(prev => prev.filter(t => !newUsedTypes.includes(t)));
      setErrorMessage(null);
      setPreviewCells([]);
      checkGameCompletion(newGrid);
    }
  };

  const handleReset = () => {
    const newState = {
      grid: createEmptyGrid(currentPuzzle),
      dominoesPlaced: 0,
      usedTetrominoTypes: []
    };
    saveState(newState);
    setSelectedTetrominoType(null);
    setSelectedRotation(0);
    setSelectedIsReflected(false);
    setAvailableTetrominoTypes(['straight', 'T', 'square', 'L', 'skew']);
    setErrorMessage(null);
    setPreviewCells([]);
  };

  const getRandomColor = (id: number) => {
    const colors = [
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-red-200',
      'bg-purple-200',
      'bg-pink-200',
      'bg-indigo-200',
      'bg-orange-200'
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-xl font-semibold text-gray-800">Puzzle {puzzleIndex + 1}</h2>
        <p className="text-gray-600 text-center">{currentPuzzle.description}</p>
        {errorMessage && (
          <p className="text-red-500 text-sm">{errorMessage}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex flex-col gap-4">
          {currentPuzzle.tetrominoTypes && (
            <TetrominoPieceSelector
              selectedType={selectedTetrominoType}
              onSelect={setSelectedTetrominoType}
              rotation={selectedRotation}
              onRotate={setSelectedRotation}
              isReflected={selectedIsReflected}
              onReflect={setSelectedIsReflected}
              availableTypes={availableTetrominoTypes}
              allowRotation={currentPuzzle.allowRotation}
              allowReflection={currentPuzzle.allowReflection}
            />
          )}

          <div className="flex gap-2 justify-center">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={future.length === 0}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Redo
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto flex justify-center">
          <div className={`inline-grid ${
            currentPuzzle.gridWidth === 5 ? 'grid-cols-5' :
            currentPuzzle.gridSize === 8 ? 'grid-cols-8' :
            currentPuzzle.gridSize === 6 ? 'grid-cols-6' :
            currentPuzzle.gridSize === 4 ? 'grid-cols-4' : ''
          } gap-0.5 sm:gap-1 bg-gray-200 p-2 rounded`}>
            {currentState.grid.map((row, rowIndex) => (
              row.map((cell, colIndex) => {
                const isPreview = previewCells.some(([r, c]) => r === rowIndex && c === colIndex);
                const isPartOfPiece = cell.isOccupied;
                const isVertical = cell.orientation && ['straight', 'T', 'L', 'skew'].includes(cell.orientation) && 
                                  (cell.rotation === 90 || cell.rotation === 270);
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                    onMouseLeave={() => setPreviewCells([])}
                    className={`
                      ${currentPuzzle.gridSize === 8 
                        ? 'w-[30px] h-[30px] sm:w-[40px] sm:h-[40px]' 
                        : 'w-[35px] h-[35px] sm:w-[48px] sm:h-[48px]'}
                      ${cell.isBlocked
                        ? 'bg-gray-800 cursor-not-allowed'
                        : isPartOfPiece
                          ? `${getRandomColor(cell.dominoId!)} cursor-not-allowed ${isVertical ? 'border-t-0 border-b-0' : 'border-l-0 border-r-0'}`
                          : isPreview
                            ? 'bg-blue-100 cursor-pointer'
                            : 'bg-white cursor-pointer hover:bg-gray-100'
                      }
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
      </div>

      {showSuccess && (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-green-100 text-green-700 px-4 sm:px-6 py-3 rounded-lg text-base sm:text-lg font-semibold animate-bounce text-center">
            🎉 Congratulations! You've completed the puzzle! 🎉
          </div>
          {puzzleIndex + 1 < PUZZLES.length && !currentPuzzle.requiresPassword && (
            <button
              onClick={handleNextPuzzle}
              className="px-4 sm:px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Next Puzzle →
            </button>
          )}
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Enter Password</h3>
            <input
              type="text"
              maxLength={4}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value.trim());
                setPasswordError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
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
                className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 