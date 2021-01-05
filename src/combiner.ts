import { CombinedAction, Dispatcher, ExecuteAction, FlipAction, IState } from './types';

// EH: Should be able to wait when a value is changed then make move, not only combine those things
const add_place_action: CombinedAction = (moves, actions, from_idx: number, card_idx: number, direction: number) => {
  moves.add_action({from_idx, card_idx, direction});
  actions.clear_state();
};

const ai_act: CombinedAction = (moves, actions, from_idx: number) => {
  moves.ai_act(from_idx);
};

const flip: CombinedAction = (moves, actions, player_idx: number, flip_action: FlipAction) => {
  moves.flip(player_idx, flip_action);
}


const execute: CombinedAction = (moves, actions, player_idx: number, execute_action: ExecuteAction) => {
  moves.execute(player_idx, execute_action);
}

// const select_hand: CombinedAction = (moves, actions, hand_idx: number) => {
//   actions.select_hand(hand_idx);
//   moves.show_hand_info(hand_idx);
// }

export const COMBINED: Record<string, CombinedAction> = {
  add_place_action,
  ai_act,
  flip,
  execute,
  // select_hand,
};