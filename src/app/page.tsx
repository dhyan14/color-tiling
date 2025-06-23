'use client';

import { useState } from 'react';
import GameBoard from '@/components/GameBoard';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Color Tiling Game</h1>
      <GameBoard />
    </main>
  );
} 