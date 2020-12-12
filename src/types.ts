export interface ICard {
  name?: string,
  desc?: string,
  illust?: string,
  fruit?: number,
  selected?: boolean,
}

export interface IPlayer {
  score: number,
  illust?: string,

  hand: ICard[],
  deck: ICard[],
  discard: ICard[],

  entities: Entity[],

  previous_action: number,

  finished: boolean,
  out: boolean,
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