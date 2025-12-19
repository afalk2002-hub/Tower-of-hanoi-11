
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Move } from './types';
import { getHanoiMoves } from './hanoiLogic';

const INITIAL_DISK_COUNT = 3;
const ROD_COUNT = 3;

const App: React.FC = () => {
  const [rods, setRods] = useState<GameState>([
    [3, 2, 1],
    [],
    []
  ]);
  const [selectedRod, setSelectedRod] = useState<number | null>(null);
  const [moveCount, setMoveCount] = useState(0);
  const [isSolving, setIsSolving] = useState(false);
  const [message, setMessage] = useState<string>("Move all disks to the third rod!");
  
  // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setTimeout> to avoid "Cannot find namespace 'NodeJS'" error in browser environments.
  const solveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetGame = useCallback(() => {
    if (solveTimeoutRef.current) clearTimeout(solveTimeoutRef.current);
    setRods([[3, 2, 1], [], []]);
    setSelectedRod(null);
    setMoveCount(0);
    setIsSolving(false);
    setMessage("Game Reset. Good luck!");
  }, []);

  const moveDisk = (from: number, to: number): boolean => {
    if (from === to) return false;
    
    const newRods = [...rods.map(r => [...r])] as GameState;
    const disk = newRods[from].pop();
    
    if (disk === undefined) return false;

    const targetTop = newRods[to][newRods[to].length - 1];
    
    if (targetTop !== undefined && disk > targetTop) {
      setMessage("Invalid move! Larger disks cannot go on top of smaller ones.");
      return false;
    }

    newRods[to].push(disk);
    setRods(newRods);
    setMoveCount(prev => prev + 1);
    setMessage(`Moved disk ${disk} from Rod ${from + 1} to Rod ${to + 1}`);
    return true;
  };

  const handleRodClick = (index: number) => {
    if (isSolving) return;

    if (selectedRod === null) {
      if (rods[index].length > 0) {
        setSelectedRod(index);
        setMessage(`Selected Rod ${index + 1}`);
      }
    } else {
      if (selectedRod === index) {
        setSelectedRod(null);
        setMessage("Deselected rod.");
      } else {
        const success = moveDisk(selectedRod, index);
        if (success) {
          setSelectedRod(null);
        } else {
          // If invalid, we keep selection or swap if new rod has disks
          if (rods[index].length > 0) {
            setSelectedRod(index);
          } else {
            setSelectedRod(null);
          }
        }
      }
    }
  };

  const autoSolve = async () => {
    if (isSolving) return;
    
    resetGame();
    setIsSolving(true);
    setMessage("Solving recursively...");

    const moves = getHanoiMoves(INITIAL_DISK_COUNT);
    
    let i = 0;
    const executeNextMove = () => {
      if (i < moves.length) {
        const { from, to } = moves[i];
        
        setRods(prevRods => {
          const nextRods = [...prevRods.map(r => [...r])] as GameState;
          const disk = nextRods[from].pop();
          if (disk !== undefined) nextRods[to].push(disk);
          return nextRods;
        });
        
        setMoveCount(prev => prev + 1);
        i++;
        solveTimeoutRef.current = setTimeout(executeNextMove, 800);
      } else {
        setIsSolving(false);
        setMessage("Recursive solution complete!");
      }
    };

    solveTimeoutRef.current = setTimeout(executeNextMove, 800);
  };

  const isGameWon = rods[2].length === INITIAL_DISK_COUNT && !isSolving;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-4">
          Tower of Hanoi
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">
          The classic mathematical puzzle. Move 3 disks using recursion or your own wit.
        </p>
      </header>

      <main className="w-full max-w-4xl bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Status</span>
            <div className={`font-medium ${isGameWon ? 'text-emerald-400' : 'text-slate-200'}`}>
              {isGameWon ? "🏆 Puzzle Solved!" : message}
            </div>
          </div>
          <div className="text-right space-y-1">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Moves</span>
            <div className="text-2xl font-bold text-blue-400">{moveCount}</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative h-[300px] flex items-end justify-around border-b-4 border-slate-600 mb-12">
          {rods.map((rod, rIdx) => (
            <div
              key={rIdx}
              onClick={() => handleRodClick(rIdx)}
              className={`relative group cursor-pointer w-full flex flex-col items-center h-full transition-all duration-300 ${
                selectedRod === rIdx ? 'bg-blue-500/10' : 'hover:bg-slate-700/20'
              }`}
            >
              {/* The actual rod visual */}
              <div className={`absolute bottom-0 w-3 h-[80%] rounded-t-full transition-colors duration-300 ${
                selectedRod === rIdx ? 'bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.5)]' : 'bg-slate-600'
              }`} />
              
              {/* Disks on this rod */}
              <div className="absolute bottom-0 w-full flex flex-col-reverse items-center">
                {rod.map((diskSize, dIdx) => (
                  <Disk key={`${rIdx}-${diskSize}`} size={diskSize} index={dIdx} />
                ))}
              </div>

              {/* Selection indicator */}
              {selectedRod === rIdx && (
                <div className="absolute -top-8 animate-bounce text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={resetGame}
            className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors font-semibold flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <button
            onClick={autoSolve}
            disabled={isSolving}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Solve via Recursion
          </button>
        </div>
      </main>

      <footer className="mt-12 text-slate-500 text-sm">
        Built with React & TypeScript • Powered by Recursive Logic
      </footer>
    </div>
  );
};

interface DiskProps {
  size: number;
  index: number;
}

const Disk: React.FC<DiskProps> = ({ size, index }) => {
  const baseWidth = 40; // Base width multiplier
  const colors = [
    '', // 0 (none)
    'from-emerald-400 to-teal-500', // Disk 1
    'from-blue-400 to-indigo-500',  // Disk 2
    'from-rose-400 to-orange-500',  // Disk 3
  ];

  return (
    <div
      className={`disk-transition h-8 rounded-lg mb-0.5 border-b-4 border-black/20 shadow-lg bg-gradient-to-br ${colors[size]}`}
      style={{
        width: `${size * baseWidth + 40}px`,
        zIndex: index + 10,
      }}
    >
      <div className="w-full h-full flex items-center justify-center text-white/40 font-bold text-xs">
        {size}
      </div>
    </div>
  );
};

export default App;
