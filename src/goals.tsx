import { Ctx } from 'boardgame.io';
import React from 'react';
import { goal_illust, public_goal_illust } from './assets';
import { FRUITS } from './icons';
import { ICard, IGame, IPlayer } from './types';

function score_based_on_fruit(player: IPlayer, fruit_idx: number) {
  let num_fruit = player.entities.filter(x => ((typeof x == "object") && (x.fruit == fruit_idx))).length;
  if (num_fruit >= 4) {
    player.score += 7;
  }
  else if (num_fruit == 3) {
    player.score += 4;
  }
  else if (num_fruit == 2) {
    player.score += 2;
  }
  else {
    return;
  }
}

function process_goal(goal: ICard): ICard {
  return {
    ...goal,
    is_goal: true,
    illust: goal_illust,
  };
}

function process_public_goal(goal: ICard): ICard {
  return {
    ...goal,
    is_goal: true,
    is_public: true,
    illust: public_goal_illust,
  };
}

export const goals_raw: ICard[] = [
  {
    name: "目标: 击杀上家",
    desc: "如果上家已经出局，则获得3分",
    stackable: true,
    effect(G, ctx, player) {
      let player_idx = G.players.indexOf(player);
      let target_idx = (player_idx + 3) % 4;
      let target = G.players[target_idx];

      if (target.out == true) {
        player.score += 3;
      }
    }
  },
{
    name: "目标: 击杀下家",
    desc: "如果下家已经出局，则获得3分",
    stackable: true,
    effect(G, ctx, player) {
      let player_idx = G.players.indexOf(player);
      let target_idx = (player_idx + 1) % 4;
      let target = G.players[target_idx];

      if (target.out == true) {
        player.score += 3;
      }
    }
  },

{
    name: "目标: 保护上家",
    desc: "如果上家依然存活，则获得1分，否则失去1分",
    effect(G, ctx, player) {
      let player_idx = G.players.indexOf(player);
      let target_idx = (player_idx + 3) % 4;
      let target = G.players[target_idx];

      if (target.out != true) {
        player.score += 1;
      }
      else {
        player.score -= 1;
      }
    }
  },

  {
    name: "目标: 保护下家",
    desc: "如果下家依然存活，则获得1分，否则失去1分",
    effect(G, ctx, player) {
      let player_idx = G.players.indexOf(player);
      let target_idx = (player_idx + 1) % 4;
      let target = G.players[target_idx];
      if (target.out != true) {
        player.score += 1;
      }
      else {
        player.score -= 1;
      }
    }
  },

  {
    name: "目标: 西红柿",
    // desc: <span>如果你拥有2/3/4个{FRUITS[0]}，则获得2/4/7分</span>,
    desc: "如果你拥有2/3/4个西红柿，则获得2/4/7分",
    effect(G, ctx, player) {
      score_based_on_fruit(player, 0);
    }
  },
{
    name: "目标: 柠檬",
    // desc: <span>如果你拥有2/3/4个{FRUITS[1]}，则获得2/4/7分</span>,
    desc: "如果你拥有2/3/4个柠檬，则获得2/4/7分",
    effect(G, ctx, player) {
      score_based_on_fruit(player, 1);
    }
  },
{
    name: "目标: 青苹果",
    // desc: <span>如果你拥有2/3/4个{FRUITS[2]}，则获得2/4/7分</span>,
    desc: "如果你拥有2/3/4个苹果，则获得2/4/7分",
    effect(G, ctx, player) {
      score_based_on_fruit(player, 2);
    }
  },
  {
    name: "目标: 归档",
    desc: "如果你的存档中有1/2张牌，则获得2/5分",
    effect(G, ctx, player) {
      let num_archives = player.hand.length;
      if (num_archives == 1) {
        player.score += 2;
      }
      else if (num_archives >= 2) {
        player.score += 5;
      }
      else {
        return;
      }
    }
  },
  {
    name: "目标: 玩个刺激的",
    desc: "如果你的弃牌堆中有\"引爆\"，则获得2分",
    effect(G, ctx, player) {
      let card = player.discard.find(x => x.name == "引爆");
      if (card != undefined) {
        player.score += 2;
      }
    }
  },
  {
    name: "目标: 机会",
    desc: "如果你的弃牌堆中有\"机会\"，则获得2分",
    effect(G, ctx, player) {
      let card = player.discard.find(x => x.name == "机会");
      if (card != undefined) {
        player.score += 2;
      }
    }
  },
];

export const GOALS = goals_raw.map(process_goal);

const check_requirements = (requirements: number[], score: number) => (G: IGame, ctx: Ctx, player: IPlayer, self?: ICard) => {
  if (self && !self.is_achieved) {
    let fruits = player.entities.reduce((acc, val) => {
      if (typeof val == "object") {
        let new_acc = [...acc];
        new_acc[val.fruit] += 1;
        return new_acc;
      }
      else {
        return acc;
      }
    }, [0,0,0]);
    let diffs = fruits.map((cnt, idx) => (cnt - requirements[idx]) >= 0);
    let agari = !diffs.includes(false);
    console.log(`D:${diffs}, F:${fruits}, A:${agari}`);
    if (agari) {
      player.score += score;
      self.is_achieved = true;
      G.gamelogs.unshift("和牌!");
    }
  }
  else {
    return;
  }
}

export const public_goals_raw: ICard[] = [
  {
    name: "公共目标(3分)",
    desc: "AAA",
    effect: check_requirements([3,0,0], 3),
  },
  {
    name: "公共目标(3分)",
    desc: "BBB",
    effect: check_requirements([0,3,0], 3),
  },
  {
    name: "公共目标(3分)",
    desc: "CCC",
    effect: check_requirements([0,0,3], 3),
  },
  {
    name: "公共目标(4分)",
    desc: "ABC",
    effect: check_requirements([1,1,1], 4),
  },
  {
    name: "公共目标(4分)",
    desc: "AABB",
    effect: check_requirements([2,2,0], 4),
  },
  {
    name: "公共目标(4分)",
    desc: "AACC",
    effect: check_requirements([2,0,2], 4),
  },
  {
    name: "公共目标(4分)",
    desc: "BBCC",
    effect: check_requirements([0,2,2], 4),
  },

];

export const PUBLIC_GOALS = public_goals_raw.map(process_public_goal);