import React from 'react';
import { IState, Action, Phase, IOperation, IGame, ICard, FlipAction } from './types'

export function init_state(): IState {
  return {
    board: "GoalBoard",
    player_idx: 0,
    log: "",
  };
}

const change_hand_selected: Action = (S, idx: number) => {
  if (S.hand_selected == idx) {
    S.hand_selected = undefined;
  }
  else {
    S.hand_selected = idx;
  }
}

function get_place_operations(from_idx: number, card_idx: number): IOperation[] {
  let directions = [0, 1, 3, 2];
  let names = ["自己", "下家", "上家", "对家"];

  return directions.map((direction, idx) => ({
    name: names[idx],
    action: "add_place_action",
    args: [from_idx, card_idx, direction],
  }));
}

// const change_operations_on_select_hand: Action = (S, should_change: boolean) => {
//   if (should_change) {
//     if (S.hand_selected != undefined) {
//       S.operations = get_place_operations(S.player_idx, S.hand_selected);
//     }
//     else {
//       S.operations = [];
//     }
//   }
//   else {
//     console.log("Should not change");
//     return;
//   }
// }

export function get_operations(G: IGame, S: IState): IOperation[] {
  let player = G.players[S.player_idx];
  if (G.phase == "place") {
    if (!player.placed && S.hand_selected != undefined) {
      return get_place_operations(S.player_idx, S.hand_selected);
    }
    else {
      return [];
    }
  }
  else {
    if (G.active_player_idx == S.player_idx) {
      if (G.next_action == "flip") {
        let flip_actions: IOperation[] = [
          {name: "翻开", action: "flip", args: [S.player_idx, "flip"]},
        ];
        if (player.entities.includes("skip")) {
          flip_actions.push({name: "跳过", action: "flip", args: [S.player_idx, "skip"]});
        }
        if ((player.hand.length > 0) && (S.hand_selected != undefined)) {
          flip_actions.unshift({name: "打出存档", action: "flip", args: [S.player_idx, {archive_idx: S.hand_selected}]});
        }
        return flip_actions;
      }
      else {
        let execute_actions: IOperation[] = [
          {name: "执行", action: "execute", args: [S.player_idx, "execute"]},
        ];
        let top_card = player.discard[0];
        if (top_card.fruit != undefined) {
          execute_actions.push({name: "作为水果", action: "execute", args: [S.player_idx, "fruit"]});
        }
        return execute_actions;
      }
    }
    else {
      if (S.player_idx == G.host && G.ai_players.includes(G.active_player_idx)) {
        return [
          {
            name: "行动",
            action: "ai_act",
            args: [S.player_idx],
          }
        ];
      }
      else {
        return [];
      }
    }
  }
}

const select_hand: Action = (S, idx: number, hand: ICard[]) => {
  change_hand_selected(S, idx);
  let card = hand[idx];
  log_msg(S, <span>{card.name}: {card.desc}</span>);
}

const clear_state: Action = (S) => {
  S.hand_selected = undefined;
}

const change_board: Action = (S, board) => {
  S.board = board;
}

const log_msg: Action = (S, msg) => {
  S.log = msg;
}

export const ACTIONS: Record<string, Action> = {
  select_hand,
  clear_state,
  change_board,
  log_msg,
};