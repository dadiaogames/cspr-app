import _ from 'lodash';
import { Ctx } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';

import { ICard, IPlayer, IAction, FlipAction } from './types';

// No "turn based" stuffs are used

const NUM_PLAYERS = 4;

export interface IGame {
  deck: ICard[],
  players: IPlayer[],

  actions: IAction[],

  round: number,
  init_player: number,
  active_player_idx: number,
  next_action: "place" | "flip" | "execute",
  phase: "place" | "action",

  host: number,
}

function setup_player(): IPlayer {
  const P: IPlayer = {
    score: 0,
    hand: [],
    deck: [],
    discard: [],

    entities: [],

    previous_action: 0,

    finished: false,
    out: false,

    // TODO: add goals
  };

  return P;
}

// This is just for init
function setup(ctx: Ctx): IGame {
  const G: IGame = {
    deck: [],
    players: _.times(NUM_PLAYERS, setup_player),

    actions: [],
    round: 0,
    init_player: (ctx.random?.Die(NUM_PLAYERS) || 1) - 1,
    active_player_idx: 0,
    next_action: "place",

    phase: "place",
    host: 0,
  };

  return G;
}

function init_draft(G: IGame, ctx: Ctx) {
  // After all cards are into the deck and deck is shuffled
  for (let player of G.players) {
    player.hand = G.deck.slice(0, 7);
    G.deck = G.deck.slice(7);
  }
}

function place(G: IGame, ctx: Ctx, from_idx: number, card_idx: number, direction: number) {
  let from_player = G.players[from_idx];
  let card = from_player.hand[card_idx];
  from_player.hand = from_player.hand.filter(x => (x != card));

  let to_player = G.players[(from_idx + direction) % G.players.length];
  to_player.deck.unshift(card);

  from_player.previous_action = direction;
}

function add_action(G: IGame, ctx: Ctx, action: IAction) {
  G.actions.push(action);

  // let host move
  let from_idx = action.from_idx;
  if (from_idx == G.host) {
    ai_moves(G, ctx);
  }

  // Check whether it's full
  if (G.actions.length == G.players.length) {
    carry_actions(G, ctx);
  }
}

function ai_moves(G: IGame, ctx: Ctx) {

}

function carry_actions(G: IGame, ctx: Ctx) {
  for (let action of G.actions) {
    place(G, ctx, action.from_idx, action.card_idx, action.direction);
  }
  G.actions = [];
  change_hands(G, ctx);
}

function change_hands(G: IGame, ctx: Ctx) {
  let hands = G.players.map(player => player.hand);
  let len = hands.length;
  let num_remained_cards = hands[0].length;
  if (num_remained_cards == 0) {
    enter_action_phase(G, ctx);
  }
  else {
    hands = [hands[len-1], ...hands.slice(0, len-1)];
    for (let i=0; i<len; i++) {
      G.players[i].hand = hands[i];
    }
  }
}

function enter_action_phase(G: IGame, ctx: Ctx) {
  G.phase = "action";

  for (let player of G.players) {
    player.deck = ctx.random?.Shuffle(player.deck) || player.deck;
    player.entities = ["skip"];
  }

  G.next_action = "flip";
  G.active_player_idx = G.init_player;
}


function flip_card(active_player: IPlayer) {
  let card = active_player.deck[0];
  active_player.deck = active_player.deck.slice(1);
  active_player.discard.unshift(card);
}


function flip(G: IGame, ctx: Ctx, player_idx: number, flip_action: FlipAction) {
  // Double check is fine
  if (G.next_action == "flip" && G.active_player_idx == player_idx) {
    let active_player = G.players[G.active_player_idx];
    let skipped = false;

    if (flip_action == "skip") {
      let skipper = active_player.entities.find(x => x == "skip");
      if (skipper != undefined) {
        flip_card(active_player);
        active_player.entities = active_player.entities.filter(x => x != skipper);
        skipped = true;
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
    }

    proceed(G, ctx, skipped);
    
  }
  else {
    return INVALID_MOVE;
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

function proceed(G: IGame, ctx: Ctx, skipped: boolean) {
  if (G.next_action == "execute" || skipped) {
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
}

function enter_place_phase(G: IGame, ctx: Ctx) {

}

export const CSPR = {
};