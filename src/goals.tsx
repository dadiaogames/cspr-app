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
    player.score += 5;
  }
  // else if (num_fruit == 2) {
  //   player.score += 2;
  // }
  // else {
  //   return;
  // }
  else if (num_fruit == 2) {
    player.score += 3;
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
  // HACK: add personal goal bonus to every goal
  {
    name: "目标: 击杀上家",
    desc: "如果上家已经出局，则获得3分",
    stackable: true,
    aggressive_goal: 3,
    effect(G, ctx, player) {
      let player_idx = G.players.indexOf(player);
      let target_idx = (player_idx + 3) % 4;
      let target = G.players[target_idx];

      if (target.out == true) {
        player.score += 3 + player.goal_bonus;
      }
    }
  },
{
    name: "目标: 击杀下家",
    desc: "如果下家已经出局，则获得3分",
    stackable: true,
    aggressive_goal: 1,
    effect(G, ctx, player) {
      let player_idx = G.players.indexOf(player);
      let target_idx = (player_idx + 1) % 4;
      let target = G.players[target_idx];

      if (target.out == true) {
        player.score += 3 + player.goal_bonus;
      }
    }
  },

{
    name: "目标: 搞左搞右",
    desc: "上家和下家每有一个出局的得2分",
    aggressive_goal: 1,
    protective_goal: 3,
    // stackable: true,
    effect(G, ctx, player) {
      let player_idx = G.players.indexOf(player);
      let protect_target = G.players[(player_idx + 3) % 4];
      let eliminate_target = G.players[(player_idx + 1) % 4];

      if (protect_target.out === true) {
        player.score += 2;
      }

      if (eliminate_target.out === true) {
        player.score += 2;
      }
      // if (protect_target.out === true && eliminate_target.out === true) {
        // player.score += 5 + player.goal_bonus;
      // }
      // let num_out_players = G.players.filter(p => p.out).length;
      // player.score += 2 * num_out_players;
    }
  },

// {
//     name: "目标: 全场乱搞",
//     desc: "每有1个已出局的玩家就获得2分",
//     aggressive_goal: 1,
//     // stackable: true,
//     effect(G, ctx, player) {
//       let player_idx = G.players.indexOf(player);
//       // let protect_target = G.players[(player_idx + 3) % 4];
//       // let eliminate_target = G.players[(player_idx + 1) % 4];

//       // if (protect_target.out === true && eliminate_target.out === true) {
//         // player.score += 5 + player.goal_bonus;
//       // }
//       let num_out_players = G.players.filter(p => p.out).length;
//       player.score += 2 * num_out_players;
//     }
//   },
// {
//     name: "目标: 保下搞上",
//     desc: "如果下家依然存活且上家被击杀，则获得5分",
//     aggressive_goal: 3,
//     // protective_goal: 1,
//     effect(G, ctx, player) {
//       let player_idx = G.players.indexOf(player);
//       let protect_target = G.players[(player_idx + 1) % 4];
//       let eliminate_target = G.players[(player_idx + 3) % 4];

//       if (protect_target.out != true && eliminate_target.out == true) {
//         player.score += 5;
//       }
//     }
//   },
  // {
  //   name: "目标: 保护下家",
  //   desc: "如果下家依然存活，则获得2分，否则失去1分",
  //   effect(G, ctx, player) {
  //     let player_idx = G.players.indexOf(player);
  //     let target_idx = (player_idx + 1) % 4;
  //     let target = G.players[target_idx];
  //     if (target.out != true) {
  //       player.score += 2;
  //     }
  //     else {
  //       player.score -= 1;
  //     }
  //   }
  // },
  // {
  //   name: "目标: 保护上家",
  //   desc: "如果上家依然存活，则获得2分，否则失去1分",
  //   effect(G, ctx, player) {
  //     let player_idx = G.players.indexOf(player);
  //     let target_idx = (player_idx + 3) % 4;
  //     let target = G.players[target_idx];
  //     if (target.out != true) {
  //       player.score += 2;
  //     }
  //     else {
  //       player.score -= 1;
  //     }
  //   }
  // },
  {
    name: "目标: 西红柿",
    // desc: <span>如果你拥有2/3/4个{FRUITS[0]}，则获得2/4/7分</span>,
    desc: "如果你拥有2个西红柿，则获得3分",
    greedy_goal: 0,
    effect(G, ctx, player) {
      score_based_on_fruit(player, 0);
    }
  },
{
    name: "目标: 柠檬",
    // desc: <span>如果你拥有2/3/4个{FRUITS[1]}，则获得2/4/7分</span>,
    desc: "如果你拥有2个柠檬，则获得3分",
    greedy_goal: 1,
    effect(G, ctx, player) {
      score_based_on_fruit(player, 1);
    }
  },
{
    name: "目标: 青苹果",
    // desc: <span>如果你拥有2/3/4个{FRUITS[2]}，则获得2/4/7分</span>,
    desc: "如果你拥有2个苹果，则获得3分",
    greedy_goal: 2,
    effect(G, ctx, player) {
      score_based_on_fruit(player, 2);
    }
  },
  // {
  //   name: "目标: 多种水果",
  //   desc: "如果你拥有3种不同的水果，则获得5分",
  //   effect(G, ctx, player) {
  //     let fruits = player.entities.filter(e => (typeof e === "object"));
  //     let kinds_of_fruits = new Set(fruits);
  //     if (kinds_of_fruits.size == 3) {
  //       player.score += 5;
  //   }}
  // },
{
    name: "目标: 多种水果",
    desc: "你每有1种水果，就获得2分",
    effect(G, ctx, player) {
      let fruits = player.entities.filter(e => (typeof e === "object"));
      let kinds_of_fruits = new Set(fruits);
      player.score += kinds_of_fruits.size * 2;
    }
  },
  {
    name: "目标: 多个水果",
    desc: "如果你至少有3个水果，则获得4分",
    effect(G, ctx, player) {
      let fruits = player.entities.filter(e => (typeof e === "object"));
      // let kinds_of_fruits = new Set(fruits);
      player.score += fruits.length >= 3? 4 : 0;
    }
  },
  {
    name: "目标: 存档",
    desc: "你的存档中每有1张牌，就获得2分",
    target_cards: ["存档", "大存档"],
    effect(G, ctx, player) {
      let num_archives = player.hand.length;
      player.score += num_archives * 2;
      // if (num_archives > 0) player.score += player.goal_bonus;
      // if (num_archives == 1) {
      //   player.score += 2;
      // }
      // else if (num_archives >= 2) {
      //   player.score += 5;
      // }
      // else {
      //   return;
      // }
    }
  },
  // {
  //   name: "目标: 美味佳肴",
  //   desc: "如果你的弃牌堆中有带\"美味佳肴\"的牌，就获得3分",
  //   target_cards: ["美味佳肴"],
  //   effect(G, ctx, player) {
  //     // let card = player.discard.find(x => ["引爆", "美味佳肴"].includes(x.name));
  //     let card_num = player.discard.filter(x => ["美味佳肴", "炸弹屎", "三重屎"].includes(x.name)).length;
  //     // if (card != undefined) {
  //       // player.score += 3;
  //     // }
  //     // player.score += card_num * 2;
  //     if (card_num >= 1) {
  //       player.score += 3 * card_num + player.goal_bonus;
  //     }
  //   }
  // },
  // {
  //   name: "目标: 机会",
  //   desc: "如果你的弃牌堆中有\"机会\"，则获得2分",
  //   effect(G, ctx, player) {
  //     let card = player.discard.find(x => x.name == "机会");
  //     if (card != undefined) {
  //       player.score += 2;
  //     }
  //   }
  // },
  // {
  //   name: "目标: 险中求胜",
  //   desc: "你的弃牌堆中每有1个\"炸弹\"，就获得2分",
  //   target_cards: ["护甲", "观星"],
  //   effect(G, ctx, player) {
  //     let booms = player.discard.filter(x => x.name == "炸弹");
  //     player.score += 2 * booms.length;
  //   }
  // },
  // {
  //   name: "目标: 领导力",
  //   desc: "如果你的弃牌堆中有1张\"集体存档\"或\"送温暖\"，就获得3分",
  //   target_cards: ["集体存档", "送温暖"],
  //   effect(G, ctx, player) {
  //     let leader_num = player.discard.filter(x => ["集体存档", "送温暖"].includes(x.name)).length;
  //     // if (leader != undefined) {
  //       // player.score += 3;
  //     // }
  //     // player.score += leader_num * 2;
  //     if (leader_num >= 1) {
  //       player.score += 3;
  //     }
  //   }
  // },
  
  // {
  //   name: "目标: 飞鞋",
  //   desc: "如果你至少拥有2个\"鞋子\"，则获得2分",
  //   target_card: "鞋子",
  //   effect(G, ctx, player) {
  //     let shoes = player.entities.filter(x => x == "skip");
  //     if (shoes.length >= 2) {
  //       player.score += 2;
  //     }
  //   }
  // }
  // ,
];

export const GOALS = goals_raw.map(process_goal);

const check_fruitnum = (fruit_num: number, score: number) => (G: IGame, ctx: Ctx, player: IPlayer, self?: ICard) => {
  if (self && !self.is_achieved) { 
    let agari = player.entities.reduce((acc,val)=>((typeof val == "object")?(acc+1):acc), 0) >= fruit_num;
    if (agari) {
      player.score += score + G.public_goal_bonus;
      self.is_achieved = true;
      G.gamelogs.unshift("和牌!");
      console.log("和牌", self.desc, self.is_achieved);
    }
  }
  else {
    return;
  }
}

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
    // console.log(`D:${diffs}, F:${fruits}, A:${agari}`);
    if (agari) {
      player.score += score;
      self.is_achieved = true;
      G.gamelogs.unshift("和牌!");
      console.log("和牌", self.desc, self.is_achieved);
    }
  }
  else {
    // console.log("Already achieved");
    return;
  }
}

export const public_goals_raw: ICard[] = [
  {
    name: "公共目标(5分)",
    desc: "AAA",
    effect: check_requirements([3,0,0], 5),
    greedy_goal: 0,
  },
  {
    name: "公共目标(5分)",
    desc: "BBB",
    effect: check_requirements([0,3,0], 5),
    greedy_goal: 1,
  },
  {
    name: "公共目标(5分)",
    desc: "CCC",
    effect: check_requirements([0,0,3], 5),
    greedy_goal: 2,
  },
  {
    name: "公共目标(3分)",
    desc: "AA",
    effect: check_requirements([2,0,0], 3),
    greedy_goal: 0,
  },
  {
    name: "公共目标(3分)",
    desc: "BB",
    effect: check_requirements([0,2,0], 3),
    greedy_goal: 1,
  },
  {
    name: "公共目标(3分)",
    desc: "CC",
    effect: check_requirements([0,0,2], 3),
    greedy_goal: 2,
  },

  // {
  //   name: "公共目标(5分)",
  //   desc: "ABC",
  //   effect: check_requirements([1,1,1], 5),
  // },

  // {
  //   name: "公共目标(2分)",
  //   desc: "AB",
  //   effect: check_requirements([1,1,0], 2),
  // },
  // {
  //   name: "公共目标(2分)",
  //   desc: "BC",
  //   effect: check_requirements([0,1,1], 2),
  // },
  // {
  //   name: "公共目标(2分)",
  //   desc: "AC",
  //   effect: check_requirements([1,0,1], 2),
  // },
  {
    name: "公共目标(4分)",
    desc: "XXX",
    greedy_goal: -1,
    effect: check_fruitnum(3, 4),
  },
  // {
  //   name: "公共目标(4分)",
  //   desc: "XXXX",
  //   effect: check_fruitnum(4, 4),
  // }
  // {
  //   name: "公共目标(3分)",
  //   desc: "AAB",
  //   effect: check_requirements([2,1,0], 3),
  // },
  // {
  //   name: "公共目标(3分)",
  //   desc: "ACC",
  //   effect: check_requirements([1,0,2], 3),
  // },
  // {
  //   name: "公共目标(3分)",
  //   desc: "BBC",
  //   effect: check_requirements([0,2,1], 3),
  // },
  // {
  //   name: "公共目标(3分)",
  //   desc: "归档区有2张牌",
  //   effect(G, ctx, player) {

  //   },
  // },
];

export const PUBLIC_GOALS = public_goals_raw.map(process_public_goal);