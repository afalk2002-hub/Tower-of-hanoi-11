
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Move } from './types';
import { getHanoiMoves } from './hanoiLogic';

const INITIAL_DISK_COUNT = 3;

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
  const [showJavaSource, setShowJavaSource] = useState(false);
  
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
      setMessage("Invalid move! Larger disks cannot go on top.");
      return false;
    }
    newRods[to].push(disk);
    setRods(newRods);
    setMoveCount(prev => prev + 1);
    setMessage(`Moved disk ${disk} to Rod ${to + 1}`);
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
        if (moveDisk(selectedRod, index)) setSelectedRod(null);
        else if (rods[index].length > 0) setSelectedRod(index);
        else setSelectedRod(null);
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
        setRods(prev => {
          const next = [...prev.map(r => [...r])] as GameState;
          const disk = next[from].pop();
          if (disk !== undefined) next[to].push(disk);
          return next;
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

  const javaCode = `import javax.swing.*;
import java.awt.*;
import java.util.*;

public class Hanoi extends JPanel {
    private List<Stack<Integer>> rods = new ArrayList<>();
    
    public Hanoi() {
        for(int i=0; i<3; i++) rods.add(new Stack<>());
        for(int i=3; i>0; i--) rods.get(0).push(i);
        new Thread(() -> { 
            try { solve(3, 0, 2, 1); } catch(Exception e){} 
        }).start();
    }

    private void solve(int n, int f, int t, int a) throws Exception {
        if (n == 0) return;
        solve(n-1, f, a, t);
        rods.get(t).push(rods.get(f).pop());
        repaint(); Thread.sleep(1000);
        solve(n-1, a, t, f);
    }
    
    // ... paintComponent logic for graphics ...
}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Zen Hanoi
        </h1>
        <p className="text-slate-500 mt-2 italic">A recursive challenge in React & Java</p>
      </header>

      <main className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-end mb-10">
          <div>
            <div className="text-xs text-slate-500 uppercase font-mono tracking-widest mb-1">Status</div>
            <div className={`text-lg font-medium transition-colors ${isGameWon ? 'text-emerald-400' : 'text-slate-300'}`}>
              {isGameWon ? "✨ Achievement Unlocked: Recursive Master" : message}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase font-mono tracking-widest mb-1">Moves</div>
            <div className="text-3xl font-bold text-cyan-400">{moveCount}</div>
          </div>
        </div>

        <div className="relative h-64 flex items-end justify-around border-b-2 border-slate-800 mb-8">
          {rods.map((rod, rIdx) => (
            <div
              key={rIdx}
              onClick={() => handleRodClick(rIdx)}
              className={`relative flex flex-col items-center w-full h-full cursor-pointer transition-colors ${selectedRod === rIdx ? 'bg-cyan-500/5' : 'hover:bg-slate-800/30'}`}
            >
              <div className={`absolute bottom-0 w-2 h-4/5 rounded-full transition-colors ${selectedRod === rIdx ? 'bg-cyan-400' : 'bg-slate-700'}`} />
              <div className="absolute bottom-0 w-full flex flex-col-reverse items-center">
                {rod.map((diskSize, dIdx) => (
                  <Disk key={`${rIdx}-${diskSize}`} size={diskSize} index={dIdx} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={resetGame} className="px-5 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-semibold transition-all">Reset</button>
          <button onClick={autoSolve} disabled={isSolving} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-900/20">Solve Recursively</button>
          <button onClick={() => setShowJavaSource(true)} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-900/20">View Java Code</button>
        </div>
      </main>

      {showJavaSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h2 className="font-mono text-emerald-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Hanoi.java
              </h2>
              <button onClick={() => setShowJavaSource(false)} className="text-slate-400 hover:text-white">&times; Close</button>
            </div>
            <div className="p-6 overflow-auto font-mono text-sm leading-relaxed text-slate-300">
              <pre><code>{`// Java Implementation (Recursive + Graphics)
// Approx. 160 lines in Hanoi.java file
import javax.swing.*;
import java.awt.*;
import java.util.*;

public class Hanoi extends JPanel {
    private List<Stack<Integer>> towers = new ArrayList<>();
    private int moves = 0;

    public Hanoi() {
        for (int i = 0; i < 3; i++) towers.add(new Stack<>());
        for (int i = 3; i > 0; i--) towers.get(0).push(i);
        
        new Thread(() -> {
            try { 
                Thread.sleep(2000); 
                solve(3, 0, 2, 1); 
            } catch (Exception e) {}
        }).start();
    }

    private void solve(int n, int from, int to, int aux) throws Exception {
        if (n == 0) return;
        solve(n - 1, from, aux, to);
        towers.get(to).push(towers.get(from).pop());
        moves++;
        repaint();
        Thread.sleep(1000);
        solve(n - 1, aux, to, from);
    }

    @Override
    protected void paintComponent(Graphics g) {
        // ... (See Hanoi.java for full 150-200 lines)
    }
}`}</code></pre>
              <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                Check the project files for the full <b>Hanoi.java</b> source with complete graphics rendering logic.
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 text-slate-600 text-xs">
        Frontend: TypeScript/React • Logic: Recursive Solver • Reference: Java Swing
      </footer>
    </div>
  );
};

const Disk: React.FC<{ size: number; index: number }> = ({ size, index }) => {
  const colors = ['', 'from-emerald-400 to-teal-500', 'from-blue-400 to-indigo-500', 'from-rose-400 to-orange-500'];
  return (
    <div
      className={`h-8 rounded-lg mb-0.5 border-b-4 border-black/20 shadow-lg bg-gradient-to-br disk-transition ${colors[size]}`}
      style={{ width: `${size * 50 + 40}px`, zIndex: index + 10 }}
    >
      <div className="w-full h-full flex items-center justify-center text-white/40 font-bold text-xs">{size}</div>
    </div>
  );
};

export default App;
