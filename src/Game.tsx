import React, { ReactNode as EL } from 'react';
import { ActivePlayers } from 'boardgame.io/core';
import _ from 'lodash';
import { Ctx, Move as GeneralMove } from 'boardgame.io';
import { INVALID_MOVE } from 'boardgame.io/core';
import { CARDS } from './cards';

import { IGame, ICard, IPlayer, IAction, FlipAction, ExecuteAction, ICardWeight, IBehaviour } from './types';
import { AVATARS } from './assets';
import { GOALS, PUBLIC_GOALS } from './goals';
import { PRNG } from './utils';

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

function init_deck(G:IGame, ctx: Ctx): ICard[] {
  // let deck_data = "".split(" ")
  let deck_data = [
    ..._.times(4, () => "炸弹"), 
    ..._.times(2, () => "护甲"), 
    ..._.times(2, () => "引爆"), 

    // ..._.times(1, () => "吉他"), 
    // ..._.times(1, () => "上传"), 
    // ..._.times(3, () => "天妇罗"), 
    // ..._.times(2, () => "乌龟"), 
    ..._.times(1, () => "拆弹"), 
    ..._.times(2, () => "照相机"), 
    ..._.times(2, () => "果汁"), 
    ..._.times(2, () => "观星"),
    ..._.times(2, () => "存档"),
    ..._.times(1, () => "大存档"),

    ..._.times(1, () => "送温暖"),
    ..._.times(2, () => "集体存档"),
    ..._.times(1, () => "美味佳肴"), 
    ..._.times(1, () => "搋子"), 
    ..._.times(1, () => "三屎"),

    ..._.times(1, () => "西红柿"),
    ..._.times(1, () => "柠檬"),
    ..._.times(1, () => "苹果"),
  ];
  let deck = deck_data.map(name => CARDS.find(x => x.name == name)).filter(x => x != undefined).map(x => ({...x})) as ICard[];
  for (let card of deck) {
    if (card.has_fruit) {
      card.fruit = G.rng.randRange(3);
    }
  }
  return G.rng.shuffle(deck);
}

function setup_player(rng: PRNG): IPlayer {
  const P: IPlayer = {
    score: 0,
    hand: [],
    deck: [],
    discard: [],
    goals: [],

    entities: ["skip"],

    previous_action: -1,
    previous_actions: [],

    finished: false,
    out: false,
    fruit_bonus: 0,
    goal_bonus: 0,
    survive_bonus: 0,

    // TODO: add goals

    ai_behaviour: {
      aggressive: rng.randRange(10),
      protective: rng.randRange(10),
      greedy: rng.randRange(10),
      topdown: rng.randRange(10),
      greedy_growth: rng.randRange(3),
      protective_growth: rng.randRange(3),
      topdown_growth: rng.randRange(5),
    },
  };

  return P;
}

const init_draft: Move = (G, ctx) => {
  // After all cards are into the deck and deck is shuffled
  for (let player of G.players) {
    let num_cards = 6; // PARAM
    player.hand = G.deck.slice(0, num_cards);
    G.deck = G.deck.slice(num_cards);

    player.previous_actions = [];

    if (player.preset_ai_behaviour) {
      player.ai_behaviour = player.preset_ai_behaviour;
    }
  }

};

const add_avatars: Move = (G, ctx) => {
  let len = G.players.length;
  // console.log(G.rng);
  // console.log(G.rng.shuffle);
  let avatars = G.rng.shuffle(AVATARS).slice(0, len);
  for (let i=0; i<len; i++) {
    G.players[i].illust = avatars[i];
  }
}

const init_goals: Move = (G, ctx) => {
  let goals = G.rng.shuffle([...GOALS, ...GOALS.filter(x => x.stackable)]);

  // Debug is 1, then change to 2
  for (let i=0; i<G.players.length; i++) {
    let player = G.players[i];
    // player.goals = goals.slice(2*i, 2*i+2);
    player.goals = goals.slice(i, i+1);
  }

  let num_public_goals = 1; // PARAM
  G.public_goals = G.rng.shuffle(PUBLIC_GOALS.map(g=>({...g, is_achieved: false}))).slice(0,num_public_goals);
}

const init_round: Move = (G, ctx) => {
  // Reset values
  G.num_places = 0;

  // Check players' scores
  for (let p of G.players) {
    if (p.score >= 12) {
      G.should_finished = true;
      console.log("Game Finished: ", G.players.map(p => p.score));
    }
  }

  // Reset the deck, pass the init player
  G.phase = "place";
  G.round += 1;
  G.deck = init_deck(G, ctx);
  G.init_player = (G.init_player + 1) % 4;
  G.public_goal_bonus = 0;

  // Reset player data
  for (let player of G.players) {
    player.deck = [];
    player.hand = [];
    player.discard = [];
    player.entities = ["skip"];
    player.out = false;
    player.finished = false;
    player.previous_action = -1;
    player.fruit_bonus = 0;
    player.goal_bonus = 0;
    player.survive_bonus = 0;
    player.has_tempura = false;
  }

  init_goals(G, ctx);
  init_draft(G, ctx);
}

// This is just for init
function setup(ctx: Ctx): IGame {
  const rng = new PRNG(114514);
  const G: IGame = {
    deck: [],
    players: _.times(NUM_PLAYERS, ()=>setup_player(rng)),
    public_goals: [],
    rng, 
    actions: [],
    round: -1,
    init_player: 0,
    active_player_idx: 0,
    next_action: "place",

    phase: "place",

    host: 0,
    ai_players: [0,1,2,3].slice(ctx.numPlayers),
    gamelogs: [],
    num_places: 0,
    num_moves: 0,
    public_goal_bonus: 0,

    should_finished: false,

    f1: () => "f1",
    f2: () => "f2",
  };

  console.log(`How many Players AI: ${ctx.numPlayers} ${G.ai_players}`);
  

  return G;
}

export const setup_scenario: Move = (G, ctx, seed) => {
  G.rng = new PRNG(seed);
  add_avatars(G, ctx);
  init_ai_behaviour(G, ctx);
  init_round(G, ctx);
  // G.f2 = () => "f12";
}

export const set_ai_players: Move = (G, ctx, num_ai) => {
  G.ai_players = [0,1,2,3].slice(-num_ai);
  console.log("New AI Players", G.ai_players);
}

export const init_ai_behaviour: Move = (G, ctx) => {
  const BEHAVIOURS: IBehaviour[] = [
    // Average
    // {
    //   aggressive: 5,
    //   protective: 5,
    //   topdown: 5,
    //   greedy: 5,
    //   protective_growth: 2,
    //   topdown_growth: 2,
    //   greedy_growth: 2,
    // },

    // Average Greedy: Swiss #1 306
    // {
    //   aggressive: 5,
    //   protective: 5,
    //   topdown: 0,
    //   greedy: 9,
    //   protective_growth: 2,
    //   topdown_growth: 3,
    //   greedy_growth: 2,
    // },

    // Greedy Protective: Swiss #1 306_4
    {
      aggressive: 0,
      protective: 6,
      topdown: 5,
      greedy: 8,
      protective_growth: 4,
      topdown_growth: 0,
      greedy_growth: 0,
    },

    // Another Growth: Random #1 306_2
    {
      aggressive: 2,
      protective: 5,
      topdown: 2,
      greedy: 9,
      protective_growth: 0,
      topdown_growth: 5,
      greedy_growth: 5,
    },

    // No Growth: Swiss #1 306_7
    {
      aggressive: 6,
      protective: 7,
      topdown: 1,
      greedy: 9,
      protective_growth: 0,
      topdown_growth: 0,
      greedy_growth: 0,
    },
    
    
  ];
  for (let i=0; i<4; i++) {
    G.players[i].preset_ai_behaviour = G.rng.choice(BEHAVIOURS);
  }
}

export const set_ai_behaviours: Move = (G, ctx, behaviours: IBehaviour[]) => {
  for (let i=0; i<4; i++) {
    G.players[i].preset_ai_behaviour = behaviours[i];
  }
}

export function add_fruits(G:IGame, ctx:Ctx, player: IPlayer, fruits: number[]) {
  for (let i=0; i<3; i++) {
    for (let j=0; j<fruits[i]; j++) {
      player.entities.push({fruit: i});
      player.score += player.fruit_bonus;
    }
  }
  for (let goal of G.public_goals) {
    (PUBLIC_GOALS.find(x => x.desc == goal.desc) as ICard).effect(G, ctx, player, goal);
  }
}

function all_finished(G: IGame): boolean {
  let unfinished_player = G.players.find(x => !(x.finished || x.out));
  if (unfinished_player != undefined) {
    return false;
  }
  else {
    return true;
  }
}

function get_next_idx(players: IPlayer[], current_idx: number): number {
  let next_idx = (current_idx + 1) % (players.length);
  if (players[next_idx].finished || players[next_idx].out) {
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
    // let card_idx = G.rng.randRange(G.players[idx].hand.length);
    // let direction = G.rng.randRange(G.players.length);

    // Init cards
    let ai = G.players[idx];
    let card_weights: ICardWeight[] = [];
    for (let i=0; i<ai.hand.length; i++) {
      card_weights.push({
        weight: 0,
        direction: [],
      }); 
    }
    let sorted_by_score = [...G.players].sort((a,b) => b.score - a.score);
    let top = sorted_by_score[0];

    // Growth
    if (top == ai) {
      // ai.ai_behaviour.topdown = 0;
      top = sorted_by_score[1];
    }

    if (G.round >= 3) {
      // After round 3, goes top down if it is on the top, and go growing if it is on the bottom
      if (sorted_by_score.slice(0,2).includes(ai)) {
        ai.ai_behaviour.topdown = (ai.preset_ai_behaviour || {topdown: 0}).topdown +  ai.ai_behaviour.topdown_growth;
      }
      else {
        ai.ai_behaviour.greedy = (ai.preset_ai_behaviour || {greedy: 0}).greedy + (ai.ai_behaviour.greedy_growth);
      }
    }

    let danger = 0;
    for (let p of G.players) {
      if (p.previous_action && ((G.players.indexOf(p)+p.previous_action) % 4 == idx)) {
        danger += 1;
      }
    }
    if (danger !== 0) {
      ai.ai_behaviour.greedy -= ai.ai_behaviour.protective_growth;
      ai.ai_behaviour.protective += ai.ai_behaviour.protective_growth;
    }

    // Goals
    for (let goal of ai.goals) {

      // Aggressive Goal
      if (goal.aggressive_goal) {
        for (let i=0; i<ai.hand.length; i++) {
          let card = ai.hand[i];
          let weight = card_weights[i];
          if (card.effect_type === "aggressive") {
            weight.weight += ai.ai_behaviour.aggressive + ai.ai_behaviour.greedy;
            weight.direction.push(goal.aggressive_goal);
            if (goal.protective_goal !== undefined) {
              weight.direction.push(goal.protective_goal);
            }
          }
        }
      }

      // Greedy Goal
      if (goal.greedy_goal !== undefined) {
        for (let i=0; i<ai.hand.length; i++) {
          let card = ai.hand[i];
          let weight = card_weights[i];
          if (card.fruit === goal.greedy_goal || card.super_fruit === goal.greedy_goal) {
            weight.weight += ai.ai_behaviour.greedy;
            if (card.super_fruit === goal.greedy_goal) { weight.weight += ai.ai_behaviour.greedy * 2; }
            weight.direction.push(0);
          }
        }
      }

      // Target Card Goal
      if (goal.target_cards) {
        let contain_target_cards = false;
        for (let deck_card of ai.deck) {
          if (goal.target_cards.includes(deck_card.name)) {
            contain_target_cards = true;
          }
        }
        if (contain_target_cards === false) {
          for (let i=0; i<ai.hand.length; i++) {
            let card = ai.hand[i];
            let weight = card_weights[i];
            if (goal.target_cards.includes(card.name)) {
              weight.weight += ai.ai_behaviour.greedy * 2;
              weight.direction.push(0);
            }
          }
        }
      }

      // Public Goal
      let public_fruit = G.public_goals[0].greedy_goal;
      for (let i=0; i<ai.hand.length; i++) {
        let card = ai.hand[i];
        let weight = card_weights[i];
        if (card.fruit === public_fruit || card.super_fruit === public_fruit) {
          weight.weight += ai.ai_behaviour.greedy;
          if (card.super_fruit === public_fruit) { 
            weight.weight += ai.ai_behaviour.greedy * 3;
          }
          weight.direction.push(0);
        }
        if ((card.super_fruit != undefined) && (public_fruit == -1)) {
          weight.weight += ai.ai_behaviour.greedy * 2;
          weight.direction.push(0);
        }
      }
    }

    // Greedy
    for (let i=0; i<ai.hand.length; i++) {
      let card = ai.hand[i];
      let weight = card_weights[i];
      if (card.effect_type == "greedy") {
        weight.weight += ai.ai_behaviour.greedy;
        if (card.name != "送温暖") {
          weight.direction.push(0);
        }
        else {
          weight.direction.push(G.rng.choice([1,3]));
        }
      }
    }

    // Protective
    for (let i=0; i<ai.hand.length; i++) {
      let card = ai.hand[i];
      let weight = card_weights[i];
      if (card.effect_type == "protective") {
        weight.weight += ai.ai_behaviour.protective;
        if (card.name == "集体存档") {
          weight.direction.push(G.rng.choice([1,2,3]));
        }
        else {
          weight.direction.push(0);
        }
      }
    }

    // Topdown
    for (let i=0; i<ai.hand.length; i++) {
      let card = ai.hand[i];
      let weight = card_weights[i];
      if (card.effect_type == "topdown" || card.effect_type == "aggressive") {
        weight.weight += ai.ai_behaviour.topdown;
        weight.direction.push((4 + G.players.indexOf(top) - idx)%4);
      }
    }

    // Disturb
    let to_disturb = [0,0,0,0];
    to_disturb[idx] = -99;
    for (let i=0; i<G.players.length; i++) {
      let player = G.players[i];
      for (let j=0; j<G.players.length; j++) {
        if (i != j) {
          let another_player = G.players[j];
          for (let previous_action of another_player.previous_actions) {
            if ((j + previous_action) % 4 == i) {
              to_disturb[i] += 1;
            }
          }
        }
      }
    }
    if (to_disturb.indexOf(0) != -1) {
      let disturb_direction = (4 + ((to_disturb.indexOf(0) + 4) % 4) - idx) % 4;
      for (let i=0; i<ai.hand.length; i++) {
        let card = ai.hand[i];
        let weight = card_weights[i];
        if (card.effect_type == "topdown" || card.effect_type == "aggressive") {
          weight.weight += ai.ai_behaviour.aggressive * ((7-ai.hand.length)/7);
          weight.direction.push(disturb_direction);
        }
      }
    }

    // Sort the weights and get the right card
    let sorted_weights = [...card_weights];
    sorted_weights.sort((a,b)=>b.weight - a.weight);
    let card_idx = card_weights.indexOf(sorted_weights[0]); // EH: modularize this
    let direction = 0;
    if (sorted_weights[0].direction.length > 0) {
      direction = G.rng.choice(sorted_weights[0].direction);
    }

    // console.log("Weights:", card_weights);
    // if (direction == 0 && (ai.hand[card_idx].effect_type == "aggressive" || ai.hand[card_idx].effect_type == "topdown") && (ai.hand[card_idx].name != "引爆")) {
      // console.log("AI is doing something fool");
    // }

    // Test the weights
    // console.log("AI's behavior: ", {...ai.ai_behaviour});
    // console.log("Public goal: ", G.public_goals[0].greedy_goal);
    // console.log("Player goal: ", ai.goals[0].name);
    // console.log("Card weights: ", card_weights.map((w, i) => `${ai.hand[i].name} ${w.weight} |`)); 
    // console.log("---");

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
    player.deck = G.rng.shuffle(player.deck);
    player.deck = [...player.deck, ...player.goals];
    // console.log(player.deck);
  }

  G.next_action = "flip";
  G.active_player_idx = G.init_player;
  G.num_moves = 0;
};


const change_hands_or_enter_action_phase: Move = (G, ctx) => {
  let hands = G.players.map(player => player.hand);
  let len = hands.length;
  let num_remained_cards = hands[0].length;
  // console.log(G.rng);
  // console.log("Shuffle:", G.rng.shuffle);
  // console.log("F1:", G.f1);
  // console.log("F2:", G.f2);

  if (num_remained_cards == 0) {
    // console.log("Time to enter the action phase");
    enter_action_phase(G, ctx);
  }

  else {
    // console.log("Pass hands");
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
    G.players[action.from_idx].previous_actions!.push(action.direction);
  }
  G.actions = [];
  G.num_places += 1;

  change_hands_or_enter_action_phase(G, ctx);
};

const add_action: Move = (G, ctx, action?: IAction) => {
  if (action != undefined) {
    G.actions.push(action);
    G.players[action.from_idx].placed = true;

    // let host move
    let from_idx = action.from_idx;
    if (from_idx == G.host) {
      ai_moves(G, ctx);
    }
    // console.log(`Actions length: ${G.actions.length}`);
  }

  // Check whether it's full
  if (G.actions.length == G.players.length) {
    carry_actions(G, ctx);
  }
};

export function flip_card(active_player: IPlayer) {
  let card = active_player.deck[0];
  if (card != undefined) {
    active_player.deck = active_player.deck.slice(1);
    active_player.discard.unshift(card);
  }
  return card;
}

export function out(player: IPlayer) {
  let shield_idx = player.entities.map((x,idx) => (x == "shield")? idx : undefined).filter(x => x != undefined)[0];
  // console.log("Find shield:", shield_idx);
  if (shield_idx != undefined) {
    player.entities = player.entities.filter((x,idx) => (idx != shield_idx));
  }
  else {
    // console.log(`Player ${player.score}分 is out`)
    player.out = true;
    player.finished = true;
    // player.score -= player.survive_bonus;
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

//   G.deck = G.rng.shuffle(G.deck);

//   init_draft(G, ctx);
// };

const enter_place_phase: Move = (G, ctx) => {
  init_round(G, ctx);
}

const proceed: Move = (G, ctx, skipped?: boolean) => {
  G.num_moves += 1;
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
    let skipper = active_player.entities.find(x => x == "skip");

    if (flip_action == "skip" && skipper != undefined) {
      let skipper_idx = active_player.entities.indexOf(skipper);
      flip_card(active_player);
      active_player.entities.splice(skipper_idx, 1);
      skipped = true;
      log_msg(G, ctx, `选择跳过`);
      // Check finished here as finished is only checked after execute before
      if (active_player.deck.length == 0) {
        active_player.finished = true;
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
      // console.log("翻开牌", active_player.discard[0].name);
      if (active_player.discard[0] !== undefined) {
        log_msg(G, ctx, `翻开 ${active_player.discard[0].name}`);
      }
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
    // console.log(`${player_idx} is executing`);
    if (execute_action == "fruit") {
      // console.log("Gonna add fruit");
      if (card.fruit !== undefined || card.super_fruit !== undefined) {
        // player.entities.push({fruit: card.fruit});
        let added = [0,0,0];
        if (card.fruit !== undefined) {
          added[card.fruit] = 1;
        }
        if (card.super_fruit !== undefined) {
          added[card.super_fruit] = 2;
        }
        add_fruits(G, ctx, player, added);
        log_msg(G, ctx, `将 ${card.name} 作为水果`);
      }
      else {
        return INVALID_MOVE;
      }
    }
    else {
      // console.log(`Just execute ${card.name}`);
      // Add functions
      card = (card.is_goal?GOALS:CARDS).find(x => x.name == card.name) as ICard;
      // console.log({...card});
      card.effect && card.effect(G, ctx, player, card);
      log_msg(G, ctx, `执行 ${card.name}`);
      if (card.name == "观星") {
        log_msg(G, ctx, `观察到 ${player.deck.slice(0,2).map(c => c.name)}`);
      }
    }

    // Check finished
    // EH: move all "finished" into a getter function, just check whether is out or deck length is 0, this is the best way to "finish"
    player.finished = (player.out || (player.deck.length == 0));

    // HACK: using procedure method
    if (player.deck.length === 0) {
      player.score += player.survive_bonus;
      player.survive_bonus = 0;
    }

    proceed(G, ctx);
  }
  else {
    return INVALID_MOVE;
  }
};

const ai_act: Move = (G, ctx, from_idx: number) => {
  if (G.ai_players.includes(G.active_player_idx) && (G.host == from_idx)) {
    let ai = G.players[G.active_player_idx];
    if (G.next_action == "flip") {
      // AI IMPLEMENT: Flip action and execute action
      // ENH: modularize this part
      let flip_action: FlipAction = "flip";

      // Play archive
      if (ai.hand.length > 0) {
        let archive = ai.hand[0];
        if (archive.effect_type != "aggressive" && archive.effect_type != "topdown" && (!(ai.goals[0].target_cards || []).includes("存档"))) {
          flip_action = {archive_idx: 0};
        }
      }

      // Skip if protective is more important
      if ((ai.entities.includes("skip")) && 
      (ai.deck.length > 1) && 
      (ai.deck.length < 5) && 
      (ai.goals[0].target_cards != ["鞋子"]) &&
      (ai.ai_behaviour.protective > ai.ai_behaviour.greedy) && 
      (!ai.entities.includes("shield"))) {
        // console.log(`It's skip time! Deck len: ${ai.deck.length}`);
        flip_action = "skip";
      }

      flip(G, ctx, G.active_player_idx, flip_action);
    }

    else if (G.next_action == "execute") {
      // Execute action

      let execute_action: ExecuteAction = "execute";
      // console.log(`AI Act: Greedy ${ai.ai_behaviour.greedy} Protective ${ai.ai_behaviour.protective}`)

      if ((ai.ai_behaviour.greedy > ai.ai_behaviour.protective) 
      && [...G.public_goals.filter(g => !g.is_achieved).map(g => g.greedy_goal), ai.goals[0].greedy_goal].filter(g => g != undefined).includes(ai.discard[0].fruit)) {
        // console.log(`It's fruit time! Greedy Goal:${[...G.public_goals.map(g => g.greedy_goal), ai.goals[0].greedy_goal]} Fruit: ${ai.discard[0].fruit}`);
        execute_action = "fruit";
      }

      if (ai.discard[0].name == "果汁" && ai.entities.filter(x => typeof x == "object").length == 0) {
        // console.log("It is a juice but AI does not have fruits.");
        execute_action = "fruit";
      }

      if (ai.discard[0].super_fruit !== undefined) {
        execute_action = "fruit";
      }

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
    setup_scenario,
    set_ai_players,
    set_ai_behaviours,
    add_action,
    flip,
    execute,
    ai_moves,
    ai_act,
    log_msg,
  },
  minPlayers: 1,
  maxPlayers: 4,
  turn: {
    activePlayers: ActivePlayers.ALL,
  },
  plugins: [
    {
      name: "rng",
      fnWrap: (fn:any) => (G:IGame, ctx:Ctx, ...args:any[]) => {
        G = fn({...G, rng: new PRNG(114514, G.rng.val)}, ctx, ...args);
        return G;
      }
    },
  ],
};