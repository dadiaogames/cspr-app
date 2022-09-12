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
    has_fruit: true,
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/259/shield_1f6e1.png",
    effect(G, ctx, player) {
      player.entities.push("shield");
    },
  },
  {
    name: "吉他",
    desc: "如果你的鞋子未使用，则横置鞋子，获得2分，否则重置鞋子",
    effect_type: "greedy",
    has_fruit: true,
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/guitar_1f3b8.png",
    effect(G, ctx, player) {
      // player.score += 1;
      if (player.entities.includes("skip")) {
        player.entities = player.entities.filter(x => (x !== "skip"));
        player.score += 2;
      }
      else {
        player.entities.push("skip");
      }
    },
  },
{
    name: "美味佳肴",
    desc: "如果你至少有6分，则失去1分，否则获得1分",
    // has_fruit: true,
    effect_type: "topdown",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/282/pile-of-poo_1f4a9.png",
    effect(G, ctx, player) {
      if (player.score >= 6) {player.score -= 1;}
      else {player.score += 1;}
    },
  },

{
    name: "搋子",
    desc: "如果你至少有6分，则失去2分，否则获得2分",
    // has_fruit: true,
    effect_type: "topdown",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/plunger_1faa0.png",
    effect(G, ctx, player) {
      if (player.score >= 6) {player.score -= 2;}
      else {player.score += 2;}
    },
  },

{
    name: "三屎",
    desc: "如果你至少有6分，则失去2分，否则获得2分",
    // has_fruit: true,
    effect_type: "topdown",
    illust: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAwFBMVEVHcEzQJTt8iZO+GTHdLkS+GTHdLkTdLkS+GTFmdX/dLkS+GTHM1t3M1t1mdX/M1t3dNErM1t3TJz7M1t2+GTFmdX9mdX/XKkDdLkTM1t2+GTHM1t1mdX9mdX/M1t2+GTHM1t3M1t2Zpq7ZU2bdLkRmdX9mdX/dLkTM1t1mdX/dLkS+GTGZqrV0g42Xp7GGlaCzvsaPnqiAjpjVgpFtfIfOx8+jr7fGHjbSl6S/ytHRJjzaTWC5xMvXbX3Pt8B8jJdXLlKbAAAAKHRSTlMAEBBAQIKAv8LCj+PDn4Dv+YUgQK9rQDBwUGwwn68gUN9ggI/f7zDPwwvGZwAAActJREFUeF7t19eSgjAUgGEQEQR7WV3X7S2h2svW93+rRYzECGbkJN7s+N/7jXNISFDO3KVC+6nWLYgqN80KWmCMy0LSdbWOEPrCm26FlLgJjrsCKXfNB0Ra421DAPNYQbQxJhVy/5k62s/HpG6+p1RlFDLq3ONuV9BhiwR6hTC0ECe9nTibKspqhvGJQ1KLxWK/VHpGma0xbXjkp5ZhGA1n1082NMK0MgF69Kfppii7AO8VM6rlcPpkgfRypEvy3eG1ShPMRqPbrcR1GnMe5M8o1HK4faNjRcDYC4hUUxSLD604kO95XphAL3xozoHCCAp2UI/vNCiQ3rKBF+WTbdvnQ59HoRGeeZsmZEVagFkTyI+hkEAGH5pyoN8YGotDk38K0RlJfmrS1pG0lS2+12TvfmnvI3lvyChDxjtb2iki8Vyj6a7rLpfLj20O4KRNICYzOfvrOc/+Dgtp4NuIyTg2/H5kM5AOv7G5TBr4DqmyEPxWq7Ejgt+zWciE3/x1FgJ+i6Qh+NdRh4Xg32smC8G/IO0UBMxlssGO6rKBIe0A0mRBA1lQBw5JmnaLAOLP3xSYEXf3wxvsO6oi0L1NGFsnDpzSowY95Rxd+gM9kbO827m8HwAAAABJRU5ErkJggg==",
    effect(G, ctx, player) {
      if (player.score >= 6) {player.score -= 3;}
      else {player.score += 3;}
    },
  },

{
    name: "猴子",
    desc: "如果你没有水果，则获得3分",
    has_fruit: true,
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/fish_1f41f.png",
    effect(G, ctx, player) {
      let fruit = player.entities.find(x => typeof x == "object");
      if (fruit === undefined) {
        player.score += 3;
      }
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
    name: "马桶",
    desc: "如果你的弃牌堆中，有炸弹或粪便，则获得2分",
    has_fruit: true,
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/toilet_1f6bd.png",
    effect(G, ctx, player) {
      // player.entities = [];
      let bad_card = player.discard.find(c => (c.name === "炸弹" || c.name === "美味佳肴"));
      if (bad_card !== undefined) {
        player.score += 2;
      }
    },
  },

  {
    name: "送温暖",
    desc: "你的上家和下家获得1分(如果存活的话)",
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/pot-of-food_1f372.png",
    effect(G, ctx, player) {
      let idx = G.players.indexOf(player);
      let upper_idx = (idx + 1) % 4;
      let lower_idx = (idx + 3) % 4;
      let upper_player = G.players[upper_idx];
      let lower_player = G.players[lower_idx];
      if (!upper_player.out) {
        upper_player.score += 1;
      }
      if (!lower_player.out) {
        lower_player.score += 1;
      }
    }
  },
  {
    name: "乌龟",
    desc: "本回合如果你存活到最后，则获得2分",
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/turtle_1f422.png",
    has_fruit: true,
    effect(G, ctx, player) {
      player.survive_bonus += 2;
    }
  },
  {
    name: "闪电",
    desc: "本回合公共目标分值+2",
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/high-voltage_26a1.png",
    has_fruit: false,
    effect(G, ctx, player) {
      G.public_goal_bonus += 2;
    }
  },

  // {
  //   name: "礼物",
  //   desc: "如果你因为炸弹出局，获得2分",
  //   effect_type: "greedy",
  //   has_fruit: true,
  //   illust: "",
  //   effect(G, ctx, player) {
  //     player.entities.push("gift");
  //   }
  // },

  {
    name: "披萨",
    desc: "本回合剩余时间内，你每获得1个水果，就获得1分",
    effect_type: "greedy",
    has_fruit: true,
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/pizza_1f355.png",
    effect(G, ctx, player) {
      player.fruit_bonus += 1;
    }
  },

  {
    name: "西红柿",
    desc: "将2个西红柿放入持续区",
    // effect_type: "greedy",
    super_fruit: 0,
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/tomato_1f345.png",
    effect(G, ctx, player) {
      // for (let i=0; i<2; i++){
        // player.entities.push({fruit: 0});
        // add_fruits(G, ctx, player, [2,0,0]);
      // }
      player.score += 1;
    }
  },
{
    name: "柠檬",
    desc: "将2个柠檬放入持续区",
    // effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/lemon_1f34b.png",
    super_fruit: 1,
    effect(G, ctx, player) {
      // for (let i=0; i<2; i++){
        // player.entities.push({fruit: 1});
        // add_fruits(G, ctx, player, [0,2,0]);
      // }
      player.score += 1;
    }
  },
{
    name: "苹果",
    desc: "将2个苹果放入持续区",
    // effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/green-apple_1f34f.png",
    super_fruit: 2,
    effect(G, ctx, player) {
      // for (let i=0; i<2; i++){
      //   player.entities.push({fruit: 2});
      // }
      // add_fruits(G, ctx, player, [0,0,2]);
      player.score += 1;
    }
  },



  {
    name: "集体拆弹",
    desc: "所有其他玩家查看牌库顶的1张牌，如果是炸弹则弃掉，然后每有1个弃掉炸弹的玩家，你就获得2分",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/cityscape-at-dusk_1f306.png",
    effect(G, ctx, player) {
      let other_players = G.players.filter(x => x != player && !x.out);
      for (let p of other_players) {
        // let flipped = flip_card(p);
        let top_card = p.deck[0];
        if (top_card && top_card.name == "炸弹") {
          move(p.deck, p.discard);
          player.score += 2;
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
    name: "集体存档",
    desc: "所有其他玩家存档1张牌",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/night-with-stars_1f303.png",
    effect_type: "protective",
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
    name: "存档",
    desc: "存档1张牌",
    has_fruit: true,
    effect_type: "protective",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/whatsapp/273/floppy-disk_1f4be.png",
    effect(G, ctx, player) {
      move(player.deck, player.hand);
    },
  },
{
    name: "大存档",
    desc: "存档2张牌",
    has_fruit: true,
    effect_type: "protective",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/package_1f4e6.png",
    effect(G, ctx, player) {
      move(player.deck, player.hand);
      move(player.deck, player.hand);
    },
  },

{
    name: "天妇罗",
    desc: "如果这是你本回合第1/2/3次执行此效果，则获得1/3/5分",
    has_fruit: true,
    effect_type: "greedy",
    illust: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAvVBMVEVHcEz/rDP/rDP/rDP+qC3/rDP/rDP/rDL/rDP+qS//g5v/g5v/rDP/rDP/qzH/g5v/rDP2kxD/g5v/rDP8fJT/g5v7e5L3c4r9fZX1kQ3/g5v/g5v8oyf/g5v/g5v/g5vsXXL0kAzqWW7/hZf2lBH1kQ3/mWPqWW79qC3qWW7qWW71kg/0kAz/rDP0kAz+qi/3mBb9pir2lRL6nyD8oiX5mxv/g5vqWW7/k3HuYHXza4H8fZT/qDz/iov/oFNjMuL6AAAALXRSTlMAgCAwEO+fv0Bgv0CPz3CA3yCvr3AwEPwg75tgUO9Q3+97QM9A188w36/Pv5837ex5AAACvElEQVR4XqWX53qiQBRAAUVqsRuNqWX7DNWa7L7/Yy0wuoFpd2DPL03kfHduA7QrC8/zbrT/ZRnd7QmuG0We19dz87CncafRrbfsKnL3Au7cTXS/UA9oD/Ayje5V8uftVfjiDyDRQkn0G6Gxb4A5gjmiipEtDWml5CHMZFF9fXxX8hB0WUd+P63epQlqEsjSPj8cTmeh7A9qYTpi0fOh5sRXfSAKX9iUjxfRngtiGAniIZ7TGTgaZHommhVQNNj0owpG2gGIQ8iKDucV3EcsbJdzBO4mmnvePJo+iEMyh7SIWmzTeXMHeZuX4/ED8ZjRovtmKLfsYnSQgC1tur3u7A21wADTN+Zwy/nUdadzSgOa0ietK37MFa2HnU0/C54Idw9psuaYctwjpCdccETY0TrzxpoSjN/kAlsfWRW+Y3xWDuO07YlxyURsGYxM9Mk4vKZhjXFMnawkFGkMi5kpnah+YZwxAeWWwKMjDuN63W+r6xqeDNdmrmY4Q3yq4kxwSdzyJOVXm+cJEJKYKlHSqFhWiO5zJB6hCVekV1FSsMuEzQ+LOSCiBFGw2baRlGCCa5jxZUSBXBRbRLSDRA4CKIgoo0UDSjRGEAkxpZTI5mcIDimXi0YIhogSuWiMYHa8JOWv7ZFHSPlsrVru8CtdM5iY6aQ0ozeSjlTI2mWL67NqLSwlUUJETQ1e9xHlDVFch5cUVn9RTERJkhflR7+/iNovfUQ7Th8ZvZLNdvaYsxxhOLPms9sRJiW5li6Rbc8UBRrFUHlCCqpmNIFiqjMq1Qyh4hJJgYA0Q81TALcicEXGCcdjUs0IhUQGnXjYg7H4Qk1GNAnpIPDtdmgK4ylNyS6GXrTU70iC2ejTAvALMlw54JW9l8nUNRDHVNAMNQUMCzhUSDQK2GKVFQ60LhihZTKOkW5r/TDsf4Bx/AWDNjng5jqHSQAAAABJRU5ErkJggg==",
    effect(G, ctx, player) {
      if (player.has_tempura === true) {
        player.score += 3;
      }
      else {
        player.score += 1;
        player.has_tempura = true;
      }
    },
  },

{
    name: "汉堡",
    desc: "你的弃牌堆中每有2张牌，就获得1分",
    has_fruit: true,
    effect_type: "greedy",
    illust: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAAAvVBMVEVHcEzcoX/ZnoLZnoLZnoLZnoLal37JkHPZnoLZnoLHp3TZnoLdLkT/zE3/zE1mIRPdLkRmIRN3slWNtlR3slV3slWndE3ZnoJ3slWqblBmIRN/PCXdLkS9gGfcYF/TlnvaQ0+RkVHxx025v1GCtFX/zE3wyaHFTkjhro2XuVOhYilvKxf53K721qnou5fdpYfXi3bTxFD/6LaQTzCdXUi9V0m8gTTbf3Hps0SahU+EolPGjDfRmTunvFK3YErYlgAPAAAAF3RSTlMAX++PeKdHGL/fM89Axq+/70Cfx2Bw770Z5hUAAANJSURBVHhe1ZjXmpswEEbBdHtbsklE7+69bS3v/1iRV4gxCBkMXy5yLvVZR/8IZnds4d+jqbKk6yhH1yVZ1a6U9GWlhyrpKXK/sUUy0EUMqYFLk8FyySVrNZoeR7Ae7RaTQo2XVCLVsJ4dZlm6LpEXRyeCyYIeDix3J8p6XePEgU2LdVG0OHlGCOCHkoqnr8pXtFyusJzJLJU9CmwawX0wsJkVJg8wwcdP+BrIzGYSEZf1hFbEyyyCR+txPSu8haTjZu5BA+rcs9ECzuaiU49KTqk6e0Ieew0qBMrOHrEi0NdG0mDLkm0N0mI1kFuS81vdrSoeGmqATN5Fmoj78vD/IuzWZ2+lgdoxgRqMbxFqyejsQbQVQaMgvgj6m7sKpa0YEb+/+avrVW6Fy+b3N38VMODx8/ubvwoo0Grc/q5fhWYboI4MoPu7AN1/43fz+DdU5Iab9pogdEHkun7QUuO7bkGEVS1SbU4aEGkP7jeh/3yFbPPsh2TfAx0nflsuEIa+7z9jNtW7MfgDYegCf/rE89M0wdQCyzR/EQ8mGrfVjCMTg019kxAd22iOkUnQBO3RzHh7/QqvkYRfr3Rr+ohLu4sT0wSZdWxQ5fhovb6ZlHQ7vMOi2+FwaxZ5iyLLssYnzjafwMtRZJaIh8PbU6IhNk3TdJokyWdqNub781Mz/YyHRNTHkYCkTgDlnHErCpgfzuzjahN44vfZ/AfpENu25+Ca5tmn5RSwkmSWlyfHxmQ9YmPAFX+bpqfocXKuISsp8VALQSDcE1PuipNtTHOneT66tN1u48xCuScezaKiYo2Qj2aAVWKhWNlYE8yJJHe9nKu2aVYo3O7eLjAP5Gxgg0iMi+FjNrdLWNnI1kPIsRmcpwrXy6zqkwj16BARYBPL/h0UUBLjCWCIABO/RCiJ9YAIc7CrmT/FWEOfEsOBGWvWnsNTzWgYBsdDhOK/fm9vX8WeatCgPNZsLKepxbE2l8eawDrUypyDFZSmCM7I5nmHvVPhc5z9wfNQGaP+21rg5QSIiwhfszqhCxSt08w20ISuJvCASWnrUYgHUI02GkMVWMSr6xuIzX456vQrkiZKer1El0RNaEBflWVF15l4hq4rsqz2hf+Cv/n/ttGvGGfQAAAAAElFTkSuQmCC",
    effect(G, ctx, player) {
      let len = player.discard.length;
      player.score += Math.floor(len / 2);
    },
  },

{
    name: "照相机",
    // desc: "获得1分，场上每有1个已出局的玩家，就再得1分",
    desc: "如果场上有已出局的玩家，获得2分",
    has_fruit: true,
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/camera_1f4f7.png",
    effect(G, ctx, player) {
      // let idx = G.players.indexOf(player);
      // let upper_idx = (idx + 1) % 4;
      // let lower_idx = (idx + 3) % 4;
      // let upper_player = G.players[upper_idx];
      // let lower_player = G.players[lower_idx];
      // if (upper_player.out === true) {
      //   player.score += 2;
      // }
      // if (lower_player.out === true) {
      //   player.score += 2;
      // }
      // player.score += 1 + G.players.filter(p => p.out).length;
      player.score += G.players.filter(p => p.out).length > 0? 2 : 0;
    },
  },
{
    name: "苍蝇",
    desc: "如果你拥有水果，则失去3分，否则获得1分",
    has_fruit: false,
    effect_type: "topdown",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/322/fly_1fab0.png",
    effect(G, ctx, player) {
      let fruit = player.entities.find(x => typeof x == "object");
      if (fruit != undefined) {
        player.score -= 2;
      }
      else {
        player.score += 1;
      }
    },
  },

{
    name: "上传",
    desc: "如果你的存档中有牌，则获得2分",
    has_fruit: true,
    effect_type: "greedy",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/282/cloud_2601-fe0f.png",
    effect(G, ctx, player) {
      if (player.hand.length > 0) {
        player.score += 2;
      }
      // else {
        // move(player.deck, player.hand);
        // move(player.deck, player.hand);
      // }
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
    desc: "查看牌堆顶的1张牌，如果是炸弹，将其弃掉并获得2分",
    has_fruit: true,
    effect_type: "protective",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/wrench_1f527.png",
    effect(G, ctx, player) {
      let card = player.deck[0];
      if (card != undefined) {
        log_msg(G, ctx, <span>使用拆弹翻开 {card.name}</span>);
        if (card.name == "炸弹") {
          move(player.deck, player.discard);
          player.score += 2;
        }
        else {
          return;
        }
      }
    }
  },
  {
    name: "引爆",
    desc: "如果你至少有6分，直接出局，否则获得1分",
    effect_type: "aggressive",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/fire_1f525.png",
    effect(G, ctx, player) {
      // let discarded = G.deck.slice(0, 2);
      // player.deck = player.deck.slice(2);
      // player.discard = [...discarded, ...player.discard];
      // // log_msg(G, ctx, <span>因为引爆弃掉了 {discarded.map(x => <span>{x.name} </span>)}</span>);
      // if (discarded.map(x => x.name).includes("炸弹")) {
      //   out(player);
      // }
      // else {
      //   player.score += 2;
      // }
      if (player.score >= 6) {
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
    effect_type: "topdown",
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/game-die_1f3b2.png",
    effect(G, ctx, player) {
      player.deck = [...G.deck.slice(0,2), ...player.deck];
      G.deck = G.deck.slice(2);
    }
  },

  {
    name: "观星",
    desc: "查看牌库顶的2张牌",
    effect_type: "protective",
    has_fruit: true,
    illust: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/282/magnifying-glass-tilted-left_1f50d.png",
    effect(G, ctx, player) {
      // player.deck = [...G.deck.slice(0,2), ...player.deck];
      // G.deck = G.deck.slice(2);
      let top_cards = player.deck.slice(0,2);
      // if (G.ai_players.includes(G.players.indexOf(player))) {
      if (top_cards.map((card: ICard) => card.name).includes("炸弹")) {
        if (player.entities.includes("skip")) {
          let skip_idx = player.entities.indexOf("skip");
          player.entities[skip_idx] = "shield";
        }
      }
      // }
  }
},

  {
    name: "果汁",
    desc: "如果你拥有水果，则获得2分",
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