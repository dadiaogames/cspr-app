import { ReactNode as EL } from 'react';
import { Ctx } from 'boardgame.io';

export type Phase = "place" | "action";

export interface IGame {
  deck: ICard[],
  players: IPlayer[],
  public_goals: ICard[],

  actions: IAction[],

  round: number,
  init_player: number,
  active_player_idx: number,
  next_action: "place" | "flip" | "execute",
  phase: Phase,

  host: number,
  ai_players: number[],
  gamelogs: (string | EL)[],
}

export interface ICard {
  name: string,
  desc: string | EL,
  illust?: string,
  effect: (G: IGame, ctx: Ctx, player: IPlayer, self?: ICard) => void,
  has_fruit?: boolean,
  fruit?: number,
  selected?: boolean,
  is_goal?: boolean,
  stackable?: boolean,
  is_public?: boolean,
}

export interface IPlayer {
  score: number,
  illust?: string,

  hand: ICard[],
  deck: ICard[],
  discard: ICard[],
  goals: ICard[],

  entities: Entity[],

  previous_action?: number,

  finished?: boolean,
  out?: boolean,

  placed?: boolean,
}

export interface IAction {
  from_idx: number,
  card_idx: number,
  direction: number,
}

// export interface Fruit {
//   fruit: number,
// }

export type Entity = "skip" | "shield" | {fruit: number};

// export interface ArchiveAction {
//   archive_idx: number,
// }

export type FlipAction = "skip" | {archive_idx: number} | "flip";

export type ExecuteAction = "execute" | "fruit";

export type Dispatcher = (...args: any[]) => void;

export type Action = (S: IState, ...args: any[]) => void;

export type CombinedAction = (moves: Record<string, Dispatcher>, actions: Record<string, Dispatcher>, ...args: any[]) => void;

export type DispatcherLT = Record<string, Dispatcher>;

export interface BoardProps {
  G: IGame,
  ctx: Ctx,
  moves: DispatcherLT,
  S: IState,
  actions: DispatcherLT,
  combined: DispatcherLT,
}

export interface IState {
  board: string,

  hand_selected?: number,

  player_idx: number,
  log: string | EL,
}

export interface IOperation {
  name: string,
  action: string,
  args?: any[],
}