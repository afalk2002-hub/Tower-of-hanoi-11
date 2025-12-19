
export type DiskSize = number;
export type RodState = DiskSize[];
export type GameState = [RodState, RodState, RodState];

export interface Move {
  from: number;
  to: number;
}
