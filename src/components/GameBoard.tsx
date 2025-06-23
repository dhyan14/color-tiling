'use client';

import { FC, useState, useCallback } from 'react';
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
    description: "Place different Tetromino pieces (Straight, T, Square, L, and Skew) on a 4x5 grid. Each piece can only be used once. Pieces can be rotated and reflected.",
    useTetromino: true,
    requiresPassword: true,
    password: "0693",
    tetrominoTypes: ['straight', 'T', 'square', 'L', 'skew'],
    gridWidth: 5
  },
  {
    gridSize: 5,
    maxDominoes: 9,
    blockedCells: [],
    description: "Place 8 straight trominoes (3 blocks long, only 0° and 90° rotations) and 1 single square piece (1x1) on a 5x5 grid. The middle cell can only be used by the square piece.",
    useTetromino: true,
    requiresPassword: true,
    password: "1234",
    tetrominoTypes: ['straight', 'square'],
    specialMiddleCell: true
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
      // Check if it's a tromino (3 blocks) or tetromino (4 blocks)
      const isTromino = puzzle?.tetrominoTypes?.length === 2 && 
                       puzzle.tetrominoTypes.includes('straight') && 
                       puzzle.tetrominoTypes.includes('square');
      
      const length = isTromino ? 3 : 4;
      
      if (rotation === 90) {
        // Vertical orientation
        for (let i = 0; i < length; i++) {
          cells.push([row + i, col]);
        }
      } else {
        // Horizontal orientation (0 degrees)
        for (let i = 0; i < length; i++) {
          cells.push([row, col + i]);
        }
      }
      return cells;
      
    case 'T':
      // Base coordinates for T piece (stem down)
      cells.push(
        [row, col + 1], // center
        [row, col],     // left
        [row, col + 2], // right
        [row + 1, col + 1] // bottom
      );
      break;
      
    case 'square':
      // For puzzle 7, square piece is just 1x1
      if (puzzle?.tetrominoTypes?.length === 2 && puzzle.tetrominoTypes.includes('straight') && puzzle.tetrominoTypes.includes('square')) {
        cells.push([row, col]);
        return cells;
      }
      // Regular 2x2 square piece
      cells.push(
        [row, col],
        [row, col + 1],
        [row + 1, col],
        [row + 1, col + 1]
      );
      return cells;
      
    case 'L':
      // Base coordinates for L piece
      cells.push(
        [row, col],     // top of vertical
        [row + 1, col], // middle of vertical
        [row + 2, col], // bottom of vertical
        [row + 2, col + 1] // horizontal piece
      );
      break;
      
    case 'skew':
      // Base coordinates for skew piece
      cells.push(
        [row, col],
        [row, col + 1],
        [row + 1, col + 1],
        [row + 1, col + 2]
      );
      break;
  }
  
  // Don't transform square piece
  if (type !== 'square') {
    // Find center point for rotation
    const centerX = col + 1;
    const centerY = row + 1;
    
    // Transform all coordinates
    return cells.map(([y, x]) => {
      // First apply reflection if needed
      const reflectedX = isReflected ? centerX - (x - centerX) : x;
      
      // Then apply rotation
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      
      const rotatedX = centerX + (reflectedX - centerX) * cos - (y - centerY) * sin;
      const rotatedY = centerY + (reflectedX - centerX) * sin + (y - centerY) * cos;
      
      return [Math.round(rotatedY), Math.round(rotatedX)];
    });
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
  // Determine available rotations based on piece type and puzzle type
  const getAvailableRotations = () => {
    if (isTromino && selectedType === 'straight') {
      return [0, 90]; // Only 0° and 90° for straight tromino
    }
    return [0, 90, 180, 270]; // All rotations for other pieces
  };

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
            {getAvailableRotations().map((r) => (
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
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedRotation, setSelectedRotation] = useState<number>(0);
  const [squareTetrominoUsed, setSquareTetrominoUsed] = useState(false);
  const [selectedTetrominoType, setSelectedTetrominoType] = useState<TetrominoType | null>(null);
  const [selectedIsReflected, setSelectedIsReflected] = useState<boolean>(false);
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
        isFirst: false
      }))
    );

    // Mark blocked cells
    puzzleConfig.blockedCells.forEach(({ row, col }) => {
      if (row < rows && col < cols) {
        grid[row][col] = {
          isOccupied: false,
          dominoId: null,
          orientation: null,
          isFirst: false,
          isBlocked: true
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
      setSquareTetrominoUsed(false);
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
    // Check if all non-blocked cells are occupied
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

  const handleCellClick = (row: number, col: number) => {
    if (!currentPuzzle || !currentState) return;
    
    // Check if the cell is blocked
    if (currentState.grid[row][col].isBlocked) {
      setErrorMessage("This cell is blocked!");
      return;
    }
    
    // For puzzle with different piece types
    if (currentPuzzle.tetrominoTypes) {
      const selectedType = selectedTetrominoType;
      if (!selectedType) {
        setErrorMessage("Please select a piece type first!");
        return;
      }

      // Check special middle cell restriction
      if (currentPuzzle.specialMiddleCell) {
        const middleRow = Math.floor(currentPuzzle.gridSize / 2);
        const middleCol = Math.floor(currentPuzzle.gridSize / 2);
        const isMiddleCell = (r: number, c: number) => r === middleRow && c === middleCol;

        // If trying to place straight piece that covers middle cell
        if (selectedType === 'straight' && getTetrominoRequiredCells(row, col, selectedType, selectedRotation).some(([r, c]) => isMiddleCell(r, c))) {
          setErrorMessage("The middle cell can only be used by the square piece!");
          return;
        }

        // If trying to place square piece that doesn't cover middle cell
        if (selectedType === 'square' && !getTetrominoRequiredCells(row, col, selectedType, selectedRotation).some(([r, c]) => isMiddleCell(r, c))) {
          setErrorMessage("The square piece must cover the middle cell!");
          return;
        }
      }
      
      // Only check for single use if it's not a straight piece in puzzle 7
      const isStraightInPuzzle7 = selectedType === 'straight' && 
                                 currentPuzzle.tetrominoTypes?.length === 2 && 
                                 currentPuzzle.tetrominoTypes.includes('straight') && 
                                 currentPuzzle.tetrominoTypes.includes('square');
                                   
      if (!isStraightInPuzzle7) {
        // Check if the piece type has already been used
        if (currentState.usedTetrominoTypes?.includes(selectedType)) {
          setErrorMessage(`${selectedType} piece has already been used!`);
          return;
        }
      } else {
        // For straight pieces in puzzle 7, check if we've used all 8
        const straightPiecesUsed = currentState.usedTetrominoTypes?.filter(t => t === 'straight').length || 0;
        if (straightPiecesUsed >= 8) {
          setErrorMessage("All straight pieces have been used!");
          return;
        }
      }
      
      const rotation = selectedRotation;
      const isReflected = selectedIsReflected;
      
      const requiredCells = getTetrominoRequiredCells(row, col, selectedType, rotation, isReflected, currentPuzzle);
      
      // Check if all required cells are within bounds
      const isWithinBounds = requiredCells.every(([r, c]) => {
        const maxRow = currentPuzzle.gridSize - 1;
        const maxCol = (currentPuzzle.gridWidth || currentPuzzle.gridSize) - 1;
        return r >= 0 && r <= maxRow && c >= 0 && c <= maxCol;
      });
      
      if (!isWithinBounds) {
        setErrorMessage("Invalid placement! Piece must be within the grid bounds.");
        return;
      }
      
      // Check if all required cells are empty
      const areAllCellsEmpty = requiredCells.every(([r, c]) => !currentState.grid[r][c].isOccupied);
      
      if (!areAllCellsEmpty) {
        setErrorMessage("Invalid placement! Cannot overlap with existing pieces.");
        return;
      }
      
      const newGrid = JSON.parse(JSON.stringify(currentState.grid));
      const dominoId = currentState.dominoesPlaced + 1;
      
      // Place the piece
      requiredCells.forEach(([r, c], index) => {
        newGrid[r][c] = {
          isOccupied: true,
          dominoId,
          orientation: selectedType,
          isFirst: index === 0,
          rotation,
          isReflected
        };
      });
      
      // Update used Tetromino types
      const newUsedTypes = [...(currentState.usedTetrominoTypes || []), selectedType];
      
      saveState({
        grid: newGrid,
        dominoesPlaced: dominoId,
        usedTetrominoTypes: newUsedTypes
      });
      
      // Only remove straight piece from available types if we've used all 8
      if (isStraightInPuzzle7) {
        const straightPiecesUsed = newUsedTypes.filter(t => t === 'straight').length;
        if (straightPiecesUsed >= 8) {
          setAvailableTetrominoTypes(prev => prev.filter(t => t !== 'straight'));
        }
      } else {
        // For other pieces, remove them after first use
        setAvailableTetrominoTypes(prev => prev.filter(t => !newUsedTypes.includes(t)));
      }
      
      // Reset selection after placing a piece
      setSelectedTetrominoType(null);
      setSelectedRotation(0);
      setSelectedIsReflected(false);
      setErrorMessage(null);
      
      // Check if the game is complete
      if (dominoId === currentPuzzle.maxDominoes) {
        checkGameCompletion(newGrid);
        if (currentPuzzle.requiresPassword) {
          setShowPasswordModal(true);
        }
      }
      return;
    }
    
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
      0: 0,     // First piece (visually down) maps to down rotation
      90: 90,   // Second piece (visually left) stays as left
      180: 180, // Third piece (visually up) maps to up rotation
      270: 270  // Fourth piece (visually right) stays as right
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
      dominoesPlaced: 0,
      usedTetrominoTypes: []
    };
    saveState(newState);
    setSelectedTetrominoType(null);
    setSelectedRotation(0);
    setSelectedIsReflected(false);
    setSquareTetrominoUsed(false);
    // Only reset to available piece types for the current puzzle
    setAvailableTetrominoTypes(currentPuzzle.tetrominoTypes || ['straight', 'T', 'square', 'L', 'skew']);
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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-8">
      <h2 className="text-lg sm:text-xl font-bold text-gray-700 text-center">
        Puzzle {puzzleIndex + 1}: {currentPuzzle.description}
      </h2>

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

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}

      {currentPuzzle.useTetromino ? (
        <div className="flex flex-col gap-4">
          {currentPuzzle.useSquareTetromino && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <span className="text-gray-700 text-sm sm:text-base">Square piece (one-time use):</span>
              <button
                onClick={() => setSelectedRotation(-1)}
                className={`w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] relative transition-all hover:scale-105 ${
                  selectedRotation === -1 ? "text-blue-600 ring-2 ring-blue-500" : "text-gray-500"
                } transform hover:shadow-xl ${
                  squareTetrominoUsed ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={squareTetrominoUsed}
              >
                <SquarePiece />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 sm:gap-8 mb-4 justify-center">
          <button
            onClick={() => setSelectedOrientation('horizontal')}
            className={`p-2 rounded transition-all ${
              selectedOrientation === 'horizontal'
                ? 'bg-blue-100 text-blue-600 scale-110'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Place horizontal domino"
          >
            <div className="w-[45px] h-[25px] sm:w-[60px] sm:h-[30px] border-2 border-current rounded-lg relative">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-current"/>
              <div className="absolute left-[25%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-current"/>
              <div className="absolute left-[75%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-current"/>
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
            <div className="w-[25px] h-[45px] sm:w-[30px] sm:h-[60px] border-2 border-current rounded-lg relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-current"/>
              <div className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-current"/>
              <div className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-current"/>
            </div>
          </button>
        </div>
      )}

      {currentPuzzle?.tetrominoTypes && (
        <TetrominoSelector
          selectedType={selectedTetrominoType}
          onSelect={(type) => setSelectedTetrominoType(type)}
          rotation={selectedRotation}
          onRotate={(r) => setSelectedRotation(r)}
          isReflected={selectedIsReflected}
          onReflect={(r) => setSelectedIsReflected(r)}
          availableTypes={availableTetrominoTypes}
          isTromino={currentPuzzle.specialMiddleCell ?? false}
        />
      )}

      <div className="w-full overflow-x-auto flex justify-center">
        <div className={`inline-grid ${
          currentPuzzle.gridWidth === 5 ? 'grid-cols-5' :
          currentPuzzle.gridSize === 8 ? 'grid-cols-8' :
          currentPuzzle.gridSize === 6 ? 'grid-cols-6' :
          currentPuzzle.gridSize === 4 ? 'grid-cols-4' :
          currentPuzzle.gridSize === 5 ? 'grid-cols-5' : ''
        } gap-0.5 sm:gap-1 bg-gray-200 p-2 rounded`}>
          {currentState.grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const isPartOfPiece = cell.isOccupied;
              const isVertical = cell.orientation && ['straight', 'T', 'L', 'skew'].includes(cell.orientation) && 
                                (cell.rotation === 90 || cell.rotation === 270);
              
              return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                className={`
                  ${currentPuzzle.gridSize === 8 
                    ? 'w-[30px] h-[30px] sm:w-[40px] sm:h-[40px]' 
                    : 'w-[35px] h-[35px] sm:w-[48px] sm:h-[48px]'}
                  ${cell.isBlocked
                    ? 'bg-gray-800 cursor-not-allowed'
                      : isPartOfPiece
                        ? `${getRandomColor(cell.dominoId!)} cursor-not-allowed ${isVertical ? 'border-t-0 border-b-0' : 'border-l-0 border-r-0'}`
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

      <div className="flex flex-col items-center gap-4">
        <p className="text-base sm:text-lg font-semibold text-center">
          {currentPuzzle.useTetromino ? 'Pieces' : 'Dominoes'} Placed: {currentState.dominoesPlaced} / {currentPuzzle.maxDominoes}
        </p>

        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base ${
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
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded text-sm sm:text-base ${
              future.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } transition-colors`}
          >
            Redo ↪
          </button>

          <button
            onClick={handleReset}
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm sm:text-base"
          >
            Reset Game
          </button>

          {currentPuzzle.requiresPassword && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm sm:text-base"
            >
              I Completed the Puzzle
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 