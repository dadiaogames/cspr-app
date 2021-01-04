import React from 'react';
import { ICard } from './types';
import { move, out, log_msg, add_fruits, flip_card } from './Game';

export const CARDS: ICard[] = [
  {
    name: "炸弹",
    desc: "嘣！",
    effect_type: "aggressive",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/emojidex/112/bomb_1f4a3.png",
    effect(G, ctx, player) {
      out(player);
    },
  },
  {
    name: "护甲",
    desc: "放入持续区，可抵挡1次出局",
    effect_type: "protective",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/259/shield_1f6e1.png",
    effect(G, ctx, player) {
      player.entities.push("shield");
    },
  },
  {
    name: "白嫖",
    desc: "获得1分",
    effect_type: "greedy",
    has_fruit: true,
    illust: "https://s3.ax1x.com/2020/12/16/rQ2Eef.jpg",
    effect(G, ctx, player) {
      player.score += 1;
    },
  },
{
    name: "反向白嫖",
    desc: "失去1分",
    // has_fruit: true,
    effect_type: "topdown",
    illust: "https://s3.ax1x.com/2020/12/27/r4zS8H.jpg",
    effect(G, ctx, player) {
      player.score -= 1;
    },
  },
{
    name: "裸奔",
    desc: "弃掉持续区的所有牌",
    // has_fruit: true,
    effect_type: "topdown",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/man-running_1f3c3-200d-2642-fe0f.png",
    effect(G, ctx, player) {
      player.entities = [];
    },
  },
  {
    name: "送温暖",
    desc: "上家和下家各获得1分",
    effect_type: "topdown",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/pot-of-food_1f372.png",
    effect(G, ctx, player) {
      let idx = G.players.indexOf(player);
      let upper_idx = (idx + 1) % 4;
      let lower_idx = (idx + 3) % 4;
      G.players[upper_idx].score += 1;
      G.players[lower_idx].score += 1;
    }
  },
  {
    name: "西红柿",
    desc: "将2个西红柿放入持续区",
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/tomato_1f345.png",
    effect(G, ctx, player) {
      // for (let i=0; i<2; i++){
        // player.entities.push({fruit: 0});
        add_fruits(G, ctx, player, [2,0,0]);
      // }
    }
  },
{
    name: "柠檬",
    desc: "将2个柠檬放入持续区",
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/lemon_1f34b.png",
    effect(G, ctx, player) {
      // for (let i=0; i<2; i++){
        // player.entities.push({fruit: 1});
        add_fruits(G, ctx, player, [0,2,0]);
      // }
    }
  },
{
    name: "苹果",
    desc: "将2个苹果放入持续区",
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/green-apple_1f34f.png",
    effect(G, ctx, player) {
      // for (let i=0; i<2; i++){
      //   player.entities.push({fruit: 2});
      // }
      add_fruits(G, ctx, player, [0,0,2]);
    }
  },



  {
    name: "集体拆弹",
    desc: "所有其他玩家弃掉牌库顶的1张牌，每有1个弃掉炸弹的玩家，就获得1分",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/cityscape-at-dusk_1f306.png",
    effect(G, ctx, player) {
      let other_players = G.players.filter(x => x != player && !x.out);
      for (let p of other_players) {
        let flipped = flip_card(p);
        if (flipped && flipped.name == "炸弹") {
          player.score += 1;
        }
      }
    }
  },
  {
    name: "集体引爆",
    desc: "所有其他玩家弃掉牌库顶的1张牌，弃掉炸弹的玩家出局，然后每有1个因此出局的玩家，就失去2分",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/collision_1f4a5.png",
    effect(G, ctx, player) {
      let other_players = G.players.filter(x => x != player && !x.out);
      for (let p of other_players) {
        let flipped = flip_card(p);
        if (flipped && flipped.name == "炸弹") {
          out(p);
          player.score -= 2;
        }
      }
    }
  },
  {
    name: "集体归档",
    desc: "所有其他玩家归档1张牌",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/night-with-stars_1f303.png",
    effect(G, ctx, player) {
      let other_players = G.players.filter(x => x != player && !x.out);
      for (let p of other_players) {
        move(p.deck, p.hand);
      }
    }
  },
  {
    name: "鞋子",
    desc: "获得1次跳过机会",
    has_fruit: true,
    effect_type: "protective",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/259/running-shoe_1f45f.png",
    effect(G, ctx, player) {
      player.entities.push("skip");
    }
  },
{
    name: "归档",
    desc: "归档1张牌",
    has_fruit: true,
    effect_type: "protective",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/whatsapp/273/floppy-disk_1f4be.png",
    effect(G, ctx, player) {
      move(player.deck, player.hand);
    },
  },
{
    name: "加速",
    desc: "弃掉牌堆顶的1张牌，并执行其2次",
    has_fruit: true,
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/racing-car_1f3ce-fe0f.png",
    effect(G, ctx, player) {
      let card = move(player.deck, player.discard);
      if (card != undefined && card.effect != undefined) {
        log_msg(G, ctx, <span>执行了 {card.name} 两次</span>);
        card.effect(G, ctx, player);
        card.effect(G, ctx, player);
      }
    },
  },
  {
    name: "拆弹",
    desc: "查看牌堆顶的1张牌，如果是炸弹，将其弃掉，否则放回牌库顶",
    has_fruit: true,
    effect_type: "protective",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/wrench_1f527.png",
    effect(G, ctx, player) {
      let card = player.deck[0];
      if (card != undefined) {
        log_msg(G, ctx, <span>使用拆弹翻开 {card.name}</span>);
        if (card.name == "炸弹") {
          move(player.deck, player.discard);
        }
        else {
          return;
        }
      }
    }
  },
  {
    name: "引爆",
    desc: "弃掉牌库顶的2张牌，如果其中有炸弹，则直接出局，否则获得1分",
    effect_type: "aggressive",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/fire_1f525.png",
    effect(G, ctx, player) {
      let discarded = G.deck.slice(0, 2);
      player.deck = player.deck.slice(2);
      player.discard = [...discarded, ...player.discard];
      log_msg(G, ctx, <span>因为引爆弃掉了 {discarded.map(x => <span>{x.name} </span>)}</span>);
      if (discarded.map(x => x.name).includes("炸弹")) {
        out(player);
      }
      else {
        player.score += 1;
      }
    }
  },

  {
    name: "机会",
    desc: "将2张山牌放到牌库顶",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/game-die_1f3b2.png",
    effect(G, ctx, player) {
      player.deck = [...G.deck.slice(0,2), ...player.deck];
      G.deck = G.deck.slice(2);
    }
  },

  {
    name: "果汁",
    desc: "如果持续区有水果，则获得2分",
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/cup-with-straw_1f964.png",
    has_fruit: true,
    effect(G, ctx, player) {
      let fruit = player.entities.find(x => typeof x == "object");
      if (fruit != undefined) {
        player.score += 2;
      }
    }
  },

];