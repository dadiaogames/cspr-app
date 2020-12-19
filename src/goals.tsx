import React from 'react';
import { goal_illust } from './assets';
import { FRUITS } from './icons';
import { ICard, IPlayer } from './types';

function score_based_on_fruit(player: IPlayer, fruit_idx: number) {
  let num_fruit = player.entities.filter(x => ((typeof x == "object") && (x.fruit == fruit_idx))).length;
  if (num_fruit >= 3) {
    player.score += 6;
  }
  else if (num_fruit == 2) {
    player.score += 3;
  }
  else if (num_fruit == 1) {
    player.score += 1;
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
    name: "目标: 水果",
    desc: <span>如果你拥有1/2/3个{FRUITS[0]}，则获得1/3/6分</span>,
    effect(G, ctx, player) {
      score_based_on_fruit(player, 0);
    }
  },
{
    name: "目标: 水果",
    desc: <span>如果你拥有1/2/3个{FRUITS[1]}，则获得1/3/6分</span>,
    effect(G, ctx, player) {
      score_based_on_fruit(player, 1);
    }
  },
{
    name: "目标: 水果",
    desc: <span>如果你拥有1/2/3个{FRUITS[2]}，则获得1/3/6分</span>,
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
];

export const GOALS = goals_raw.map(process_goal);