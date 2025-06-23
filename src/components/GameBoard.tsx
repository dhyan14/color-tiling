'use client';

import React, { useState } from 'react';

type Cell = {
  isOccupied: boolean;
  dominoId: number | null;
  orientation: 'horizontal' | 'vertical' | null;
  isFirst: boolean;
};

export default function GameBoard() {
  const [grid, setGrid] = useState<Cell[][]>(() =>
    Array(6).fill(null).map(() =>
      Array(6).fill(null).map(() => ({
        isOccupied: false,
        dominoId: null,
        orientation: null,
        isFirst: false,
      }))
    )
  );
  
  const [dominoesPlaced, setDominoesPlaced] = useState(0);
  const [selectedOrientation, setSelectedOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

  const handleCellClick = (row: number, col: number) => {
    if (dominoesPlaced >= 18) return; // Max dominoes reached
    
    const newGrid = JSON.parse(JSON.stringify(grid));
    
    // Check if we can place a domino here
    if (selectedOrientation === 'horizontal') {
      if (col < 5 && !grid[row][col].isOccupied && !grid[row][col + 1].isOccupied) {
        const dominoId = dominoesPlaced + 1;
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
        setGrid(newGrid);
        setDominoesPlaced(prev => prev + 1);
      }
    } else {
      if (row < 5 && !grid[row][col].isOccupied && !grid[row + 1][col].isOccupied) {
        const dominoId = dominoesPlaced + 1;
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
        setGrid(newGrid);
        setDominoesPlaced(prev => prev + 1);
      }
    }
  };

  const handleReset = () => {
    setGrid(Array(6).fill(null).map(() =>
      Array(6).fill(null).map(() => ({
        isOccupied: false,
        dominoId: null,
        orientation: null,
        isFirst: false,
      }))
    ));
    setDominoesPlaced(0);
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
      
      <div className="grid grid-cols-6 gap-1 bg-gray-200 p-2 rounded">
        {grid.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`w-12 h-12 ${
                cell.isOccupied
                  ? `${getRandomColor(cell.dominoId!)} cursor-not-allowed`
                  : 'bg-white cursor-pointer hover:bg-gray-100'
              } transition-colors duration-200`}
            />
          ))
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold">
          Dominoes Placed: {dominoesPlaced} / 18
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
} 