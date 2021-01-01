import React, { ReactNode as EL } from 'react';
import { ActivePlayers } from 'boardgame.io/core';
import _ from 'lodash';
import { Ctx, Move as GeneralMove } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { CARDS } from './cards';

import { IGame, ICard, IPlayer, IAction, FlipAction, ExecuteAction } from './types';
import { AVATARS } from './assets';
import { GOALS, PUBLIC_GOALS } from './goals';

// No "turn based" stuffs are used

const NUM_PLAYERS = 4;

type Move = (G: IGame, ctx: Ctx, ...args: any[]) => any;

export function move(deck1: ICard[], deck2: ICard[]) {
  // This time, only procedure method, works
  let card = deck1.splice(0, 1)[0];
  if (card) {
    deck2.unshift(card);
    return card
  }
  else {
    return undefined;
  }
}

function init_deck(ctx: Ctx): ICard[] {
  // let deck_data = "".split(" ")
  let deck_data = [..._.times(6, () => "炸弹"), ..._.times(4, () => "护甲"), ..._.times(3, () => "白嫖"), ..._.times(2, ()=>"反向白嫖"), ..._.times(3, () => "拆弹"),..._.times(2, () => "引爆"),..._.times(1, () => "加速"),..._.times(3, () => "归档"),..._.times(2, () => "鞋子"),..._.times(1, () => "裸奔"),..._.times(2, () => "送温暖"),..._.times(1, () => "西红柿"),..._.times(1, () => "柠檬"),..._.times(1, () => "苹果"),..._.times(2, ()=>"机会"),];
  let deck = deck_data.map(name => CARDS.find(x => x.name == name)).filter(x => x != undefined).map(x => ({...x})) as ICard[];
  for (let card of deck) {
    if (card.has_fruit) {
      card.fruit = ctx.random!.Die(3) - 1;
    }
  }
  return ctx.random?.Shuffle(deck) || deck;
}

function setup_player(): IPlayer {
  const P: IPlayer = {
    score: 0,
    hand: [],
    deck: [],
    discard: [],
    goals: [],

    entities: ["skip"],

    previous_action: undefined,

    finished: false,
    out: false,

    // TODO: add goals
  };

  return P;
}

const init_draft: Move = (G, ctx) => {
  // After all cards are into the deck and deck is shuffled
  for (let player of G.players) {
    player.hand = G.deck.slice(0, 7);
    G.deck = G.deck.slice(7);
  }
};

const add_avatars: Move = (G, ctx) => {
  let len = G.players.length;
  let avatars = ctx.random!.Shuffle(AVATARS).slice(0, len);
  for (let i=0; i<len; i++) {
    G.players[i].illust = avatars[i];
  }
}

const init_goals: Move = (G, ctx) => {
  let goals = ctx.random!.Shuffle([...GOALS, ...GOALS.filter(x => x.stackable)]);

  // Debug is 1, then change to 2
  for (let i=0; i<G.players.length; i++) {
    let player = G.players[i];
    player.goals = goals.slice(2*i, 2*i+2);
  }

  G.public_goals = ctx.random!.Shuffle(PUBLIC_GOALS.map(g=>({...g, is_achieved: false}))).slice(0,1);
}

const init_round: Move = (G, ctx) => {
  // Reset the deck, pass the init player
  G.phase = "place";
  G.round += 1;
  G.deck = init_deck(ctx);
  G.init_player = (G.init_player + 1) % 4;

  // Reset player data
  for (let player of G.players) {
    player.deck = [];
    player.hand = [];
    player.discard = [];
    player.entities = ["skip"];
    player.out = false;
    player.finished = false;
    player.previous_action = undefined;
  }

  init_goals(G, ctx);
  init_draft(G, ctx);
}

// This is just for init
function setup(ctx: Ctx): IGame {
  const G: IGame = {
    deck: [],
    players: _.times(NUM_PLAYERS, setup_player),
    public_goals: [],

    actions: [],
    round: -1,
    init_player: (ctx.random?.Die(NUM_PLAYERS) || 1) - 1,
    active_player_idx: 0,
    next_action: "place",

    phase: "place",

    host: 0,
    ai_players: [0,1,2,3].slice(ctx.numPlayers),
    gamelogs: [],
  };

  add_avatars(G, ctx);

  init_round(G, ctx);

  console.log(`How many Players AI: ${ctx.numPlayers} ${G.ai_players}`);

  return G;
}

export function add_fruits(G:IGame, ctx:Ctx, player: IPlayer, fruits: number[]) {
  for (let i=0; i<3; i++) {
    for (let j=0; j<fruits[i]; j++) {
      player.entities.push({fruit: i});
    }
  }
  for (let goal of G.public_goals) {
    goal.effect(G, ctx, player, goal);
  }
}

function all_finished(G: IGame): boolean {
  let unfinished_player = G.players.find(x => !x.finished);
  if (unfinished_player != undefined) {
    return false;
  }
  else {
    return true;
  }
}

function get_next_idx(players: IPlayer[], current_idx: number): number {
  let next_idx = (current_idx + 1) % (players.length);
  if (players[next_idx].finished) {
    return get_next_idx(players, next_idx);
  }
  else {
    return next_idx;
  }
}

const place: Move = (G, ctx, from_idx: number, card_idx: number, direction: number) => {
  let from_player = G.players[from_idx];
  let card = from_player.hand[card_idx];
  from_player.hand = from_player.hand.filter(x => (x != card));

  let to_player = G.players[(from_idx + direction) % G.players.length];
  to_player.deck.unshift(card);

  from_player.previous_action = direction;
};

const ai_moves: Move = (G, ctx) => {
  for (let idx of G.ai_players) {
    // AI IMPLEMENT: card_idx and direction
    let card_idx = ctx.random!.Die(G.players[idx].hand.length) - 1;
    let direction = ctx.random!.Die(G.players.length) - 1;
    G.actions.push({
      from_idx: idx,
      card_idx, 
      direction,
    });
  }
};

const enter_action_phase: Move = (G, ctx) => {
  G.phase = "action";

  for (let player of G.players) {
    // console.log("Deck before:", player.deck.map(card=>({...card})));
    player.deck = ctx.random!.Shuffle(player.deck);
    player.deck = [...player.deck, ...player.goals];
    // console.log(player.deck);
  }

  G.next_action = "flip";
  G.active_player_idx = G.init_player;
};


const change_hands_or_enter_action_phase: Move = (G, ctx) => {
  let hands = G.players.map(player => player.hand);
  let len = hands.length;
  let num_remained_cards = hands[0].length;

  if (num_remained_cards == 0) {
    console.log("Time to enter the action phase");
    enter_action_phase(G, ctx);
  }

  else {
    hands = [hands[len-1], ...hands.slice(0, len-1)];
    for (let i=0; i<len; i++) {
      G.players[i].hand = hands[i];
    }
  }

  for(let player of G.players) {
    player.placed = false;
  }
};

const carry_actions: Move = (G, ctx) => {
  for (let action of G.actions) {
    place(G, ctx, action.from_idx, action.card_idx, action.direction);
  }
  G.actions = [];

  change_hands_or_enter_action_phase(G, ctx);
};

const add_action: Move = (G, ctx, action: IAction) => {
  G.actions.push(action);
  G.players[action.from_idx].placed = true;

  // let host move
  let from_idx = action.from_idx;
  if (from_idx == G.host) {
    ai_moves(G, ctx);
  }
  console.log(`Actions length: ${G.actions.length}`);

  // Check whether it's full
  if (G.actions.length == G.players.length) {
    carry_actions(G, ctx);
  }
};

function flip_card(active_player: IPlayer) {
  let card = active_player.deck[0];
  if (card != undefined) {
    active_player.deck = active_player.deck.slice(1);
    active_player.discard.unshift(card);
  }
}

export function out(player: IPlayer) {
  let shield_idx = player.entities.map((x,idx) => (x == "shield")? idx : undefined).filter(x => x != undefined)[0];
  console.log("Find shield:", shield_idx);
  if (shield_idx != undefined) {
    player.entities = player.entities.filter((x,idx) => (idx != shield_idx));
  }
  else {
    console.log(`Player ${player.score}分 is out`)
    player.out = true;
  }
}

// const enter_place_phase: Move = (G, ctx) => {
//   G.phase = "place";
//   // EH: Reconstruct this into reset instead of just copy all setup stuffs

//   G.round += 1;
//   G.init_player = (G.init_player + 1) % 4;

//   for (let player of G.players) {
//     G.deck = [...G.deck, ...player.discard, ...player.hand, ...player.deck];

//     player.deck = [];
//     player.hand = [];
//     player.discard = [];
//     player.entities = ["skip"];
//     player.out = false;
//     player.finished = false;
//     player.previous_action = undefined;
//   }

//   G.deck = ctx.random!.Shuffle(G.deck);

//   init_draft(G, ctx);
// };

const enter_place_phase: Move = (G, ctx) => {
  init_round(G, ctx);
}

const proceed: Move = (G, ctx, skipped?: boolean) => {
  if (G.next_action == "execute" || skipped) {
    // Check whether end the action phase, or pass to the next player
    // Or say that pass to the next player, and if there's nobody to pass, then enter the action phase
    if (all_finished(G)) {
      enter_place_phase(G, ctx);
    }
    else {
      let next_idx = get_next_idx(G.players, G.active_player_idx);
      G.active_player_idx = next_idx;
      G.next_action = "flip";
    }
  }

  else {
    G.next_action = "execute";
  }
};

const flip: Move = (G, ctx, player_idx: number, flip_action: FlipAction) => {
  // Double check is fine
  if (G.next_action == "flip" && G.active_player_idx == player_idx) {
    let active_player = G.players[G.active_player_idx];
    let skipped = false;

    if (flip_action == "skip") {
      let skipper = active_player.entities.find(x => x == "skip");
      if (skipper != undefined) {
        let skipper_idx = active_player.entities.indexOf(skipper);
        flip_card(active_player);
        active_player.entities.splice(skipper_idx, 1);
        skipped = true;
        log_msg(G, ctx, `选择跳过`);
        // G.active_player_idx = (G.active_player_idx + 1) % NUM_PLAYERS;
        // G.next_action = "flip";
      }
      else {
        return INVALID_MOVE;
      }
    }

    // EH: Write this in "utils" to make it more haskell-styled
    else if (typeof(flip_action) == "object" && "archive_idx" in flip_action) {
      let archive = active_player.hand[flip_action.archive_idx];
      if (archive != undefined) {
        active_player.hand = active_player.hand.filter(x => x != archive);
        active_player.discard.unshift(archive);
      }
      else {
        return INVALID_MOVE;
      }
    }

    // Normal flip goes here
    else {
      flip_card(active_player);
      console.log("翻开牌", active_player.discard[0].name);
      log_msg(G, ctx, `翻开 ${active_player.discard[0].name}`);
    }

    proceed(G, ctx, skipped);
    
  }
  else {
    return INVALID_MOVE;
  }
};

const execute: Move = (G, ctx, player_idx: number, execute_action: ExecuteAction) => {
  if (player_idx == G.active_player_idx) {
    let player = G.players[G.active_player_idx];
    let card = player.discard[0];
    console.log(`${player_idx} is executing`);
    if (execute_action == "fruit") {
      console.log("Gonna add fruit");
      if (card.fruit != undefined) {
        // player.entities.push({fruit: card.fruit});
        let added = [0,0,0];
        added[card.fruit] = 1;
        add_fruits(G, ctx, player, added);
        log_msg(G, ctx, `将 ${card.name} 作为水果`);
      }
      else {
        return INVALID_MOVE;
      }
    }
    else {
      console.log(`Just execute ${card.name}`);
      console.log({...card});
      card.effect && card.effect(G, ctx, player, card);
      log_msg(G, ctx, `执行 ${card.name}`);
    }

    // Check finished
    player.finished = (player.out || (player.deck.length == 0));

    proceed(G, ctx);
  }
  else {
    return INVALID_MOVE;
  }
};

const ai_act: Move = (G, ctx, from_idx: number) => {
  if (G.ai_players.includes(G.active_player_idx) && (G.host == from_idx)) {
    if (G.next_action == "flip") {
      // AI IMPLEMENT: Flip action and execute action
      let flip_action: FlipAction = "flip"
      flip(G, ctx, G.active_player_idx, flip_action);
    }
    else if (G.next_action == "execute") {
      let execute_action: ExecuteAction = "execute"
      execute(G, ctx, G.active_player_idx, execute_action);
    }
    else {
      return INVALID_MOVE;
    }
  }
  else {
    return INVALID_MOVE;
  }
};

export const log_msg: Move = (G, ctx, msg: string) => {
  G.gamelogs.unshift(msg);
}

export const CSPR = {
  setup: setup,
  moves: {
    add_action,
    flip,
    execute,
    ai_act,
    log_msg,
  },
  minPlayers: 1,
  maxPlayers: 4,
  turn: {
    activePlayers: ActivePlayers.ALL,
  },
};