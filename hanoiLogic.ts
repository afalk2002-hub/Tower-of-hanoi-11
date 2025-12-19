
import { Move } from './types';

/**
 * Standard Recursive Algorithm for Tower of Hanoi
 * Similar to how it would be implemented in Java:
 * void solve(int n, char from, char to, char aux) {
 *    if (n == 1) move... return;
 *    solve(n-1, from, aux, to);
 *    move...
 *    solve(n-1, aux, to, from);
 * }
 */
export const getHanoiMoves = (
  n: number,
  source: number = 0,
  target: number = 2,
  auxiliary: number = 1
): Move[] => {
  const moves: Move[] = [];

  const recurse = (count: number, src: number, dest: number, aux: number) => {
    if (count === 0) return;
    if (count === 1) {
      moves.push({ from: src, to: dest });
      return;
    }

    // Move n-1 disks from source to auxiliary
    recurse(count - 1, src, aux, dest);
    
    // Move the nth disk from source to target
    moves.push({ from: src, to: dest });
    
    // Move n-1 disks from auxiliary to target
    recurse(count - 1, aux, dest, src);
  };

  recurse(n, source, target, auxiliary);
  return moves;
};
