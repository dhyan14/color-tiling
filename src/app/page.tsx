'use client';

import { useState } from 'react';
import GameBoard from '@/components/GameBoard';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-2 sm:p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-gray-800 text-center">Color Tiling Game</h1>
        <GameBoard />
      </div>
    </main>
  );
} 