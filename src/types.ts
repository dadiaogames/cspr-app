import { ReactNode as EL } from 'react';
import { Ctx } from 'boardgame.io';
import { PRNG } from './utils';

export type Phase = "place" | "action";

export interface IGame {
  deck: ICard[],
  players: IPlayer[],
  public_goals: ICard[],
  rng: PRNG,

  actions: IAction[],

  round: number,
  init_player: number,
  active_player_idx: number,
  next_action: "place" | "flip" | "execute",
  phase: Phase,

  host: number,
  ai_players: number[],
  gamelogs: string[],
  num_places: number,
  num_moves: number,

  f1: () => string,
  f2: () => string,
}

export interface ICard {
  name: string,
  desc: string | EL,
  illust?: string,
  effect: (G: IGame, ctx: Ctx, player: IPlayer, self?: ICard) => void,
  effect_type?: "aggressive" | "protective" | "greedy" | "topdown",
  has_fruit?: boolean,
  fruit?: number,
  selected?: boolean,
  is_goal?: boolean,
  stackable?: boolean,
  is_public?: boolean,
  is_achieved?: boolean,

  aggressive_goal?: number,
  protective_goal?: number,
  greedy_goal?: number,
  target_card?: string,
}

export interface ICardWeight {
  weight: number,
  direction: number[],
}

export interface IBehaviour {
  greedy: number,
  aggressive: number,
  protective: number,
  topdown: number,

  greedy_growth: number,
  protective_growth: number,
  topdown_growth: number,
}

export interface IPlayer {
  score: number,
  illust?: string,

  hand: ICard[],
  deck: ICard[],
  discard: ICard[],
  goals: ICard[],

  entities: Entity[],

  previous_action: number,
  previous_actions: number[],

  finished?: boolean,
  out?: boolean,

  placed?: boolean,

  ai_behaviour: IBehaviour,
  preset_ai_behaviour?: IBehaviour,
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
  log: string,

  dream_count: number,
}

export interface IOperation {
  name: string,
  action: string,
  args?: any[],
}