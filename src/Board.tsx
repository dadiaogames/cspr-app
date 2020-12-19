import React, { ReactNode as EL, FC, useState, useEffect } from 'react';
import _ from 'lodash';
import { produce } from 'immer';
import { AVATARS } from './assets';

import './Board.css';

import { ICard, IPlayer, IGame, IState, Action, IOperation, Dispatcher, CombinedAction, BoardProps } from './types';
import { FRUITS, get_entity_icon } from './icons';
import { Ctx } from 'boardgame.io';
import { BoardProps as BGBoardProps } from 'boardgame.io/react';
import { CARDS } from './cards';
import { ACTIONS, get_operations, init_state } from './actions';
import { map_object, reorder } from './utils';
import { COMBINED } from './combiner';
import { goal_illust as goal_illust_src } from './assets';

function TopPanel(props: {gameCount: string|number, checkGoal:()=>void}) {
  return <div className="top-panel">
    <button className="check-goal-button" onClick={props.checkGoal} >查看目标</button>
    {props.gameCount}
  </div>;
}

function DeckArea(props: {cardNum: number}) {
  return <div className="deck-area">
    <div className="card-num">
      {props.cardNum}
    </div>
  </div>;
}

function PlayArea(props: {playedCard?: ICard}) {
  return <div className="play-area">
    <Card {...props.playedCard} />
  </div>;
}

function CardAreas(props: {cardNum: number, playedCard?: ICard}) {
  // Both draw pile and discard pile go together,
  // Also, Card should be 100% and be contained with card containers
  return <div className="card-areas">
    <DeckArea cardNum={props.cardNum} />
    <PlayArea playedCard={props.playedCard} />
  </div>;
}

function Avatar(props: {illust?: string, selected?: boolean}) {
  return <div className="avatar" style={{border:(props.selected)?"3px solid #61dafb":undefined}}>
    <img src={props.illust} className="avatar-img" />
  </div>;
}

function InfoLine(props: {content: string|EL}) {
  return <div className="info-line">
    {props.content}
  </div>;
}

// TODO: Make an adapter to fit those two
export interface IPlayerInfo extends IPlayer {
  selected?: boolean, 
  name: string, 
  info: string | EL[],
};

function PlayerInfo(props: IPlayerInfo) {
  return <div className="player-info">
    <Avatar illust={props.illust} selected={props.selected} />
    <InfoLine content={`${props.name}(${props.score}分)`} />
    <InfoLine content={props.info}/>
  </div>;
}

function Player(props: {playerInfo: IPlayerInfo}) {
  return <div className="player">
    <CardAreas cardNum={props.playerInfo.deck.length} playedCard={props.playerInfo.discard[0]} />
    <PlayerInfo {...props.playerInfo} />
  </div>;
}

function Central(props: {players: IPlayerInfo[]}) {
  return <div className="central">
    {props.players.map(player => 
    // illust name score info
      <Player playerInfo={player} />
    )}
  </div>;
}

function InfoPanel(props: {log: string|EL}) {
  // Top panel is only used to display count, all other logs are displayed in info panel
  return <div className="info-panel">
    {props.log}
  </div>;
}

function Controller(props: {operations: IOperation[], combined: Record<string, Dispatcher>}) {
  useEffect(() => {
    if (props.operations.length == 1) {
      let operation = props.operations[0];
      setTimeout(()=>{
        props.combined[operation.action](...(operation.args || []));
      }, 600);
    }
    else {
      return;
    }
  });

  let operations = (props.operations.length == 1)? [] : props.operations;

  return <div className="controller">
    {operations.map(operation => 
      <button className="controller-button" onClick={() => props.combined[operation.action](...(operation.args || []))}>{operation.name}</button>
    )}
  </div>;
}

function Card(props: Partial<ICard>) {
  return <div className="card">
    <div className="illust-container">
      <img className="illust" src={props.illust} />
    </div>
    <div className="card-fruit" style={{display:(props.fruit != undefined)?undefined:"none"}}>{(props.fruit != undefined)? FRUITS[props.fruit] : ""}</div>
  </div>;
}

function CardContainer(props: {card: Partial<ICard>, handleClick: ()=>void}) {
  return <div 
    className = "card-container" 
    style = {{border:(props.card.selected == true)?"3px solid #61dafb":undefined}}
    onClick = {props.handleClick}
  >
    <Card {...props.card} />
  </div>;
}

function CardRow(props: {cards: ICard[], handleCardClick: (idx: number)=>()=>void}) {
  return <div className="card-row">
    {props.cards.map((card, idx) => <CardContainer card={card} handleClick={props.handleCardClick(idx)} />)}
  </div>;
}

function Template(props: {}) {
  return <div className="template">
  </div>;
}

function hand_processor(S: IState): (card: ICard, idx: number) => ICard {
  return (card, idx) => ({
    ...card,
    selected: S.hand_selected == idx,
  });
}

function get_player_info(player: IPlayer, G: IGame, S: IState): string | EL[] {
  if (G.phase == "place") {
    if (player.previous_action != undefined) {
      let target_idx = (G.players.indexOf(player) + player.previous_action) % 4;
      if (target_idx == S.player_idx && player.previous_action != 0) {
        return "扣给你";
      }
      else {
        return ["扣给自己", "扣给下家", "扣给对家", "扣给上家",][player.previous_action];
      }
    }
    else {
      return "准备扣牌";
    }
  }
  else {
    if (player.finished) {
      if (player.out) {
        return "已出局";
      }
      else {
        return "已完成";
      }
    }
    else {
      return player.entities.map(entity => get_entity_icon(entity));
    }
  }
}

function get_position(idx: number, player_idx: number) {
  let diff = idx - player_idx;
  if (diff < 0) {
    return 4 - diff;
  }
  else {
    return diff;
  }
}

function process_player(player: IPlayer, idx: number, G: IGame, S: IState): IPlayerInfo {
  return {
    ...player,
    name: ["玩家", "下家", "对家", "上家"][get_position(idx, S.player_idx)],
    info: get_player_info(player, G, S),
    selected: (G.phase == "action") && (idx == G.active_player_idx),
  };
}

function GameBoard(props: BoardProps){
  return <div className="board">
    <Central 
      players = {reorder(props.G.players.map((player, idx) => process_player(player, idx, props.G, props.S)), [(props.S.player_idx+2)%4,(props.S.player_idx+3)%4,(props.S.player_idx+1)%4,props.S.player_idx])}
    />
    {/* <InfoPanel log={msg} /> */}
    <InfoPanel log={(props.G.phase == "place")? props.S.log : props.G.gamelogs[0]} />
    {/* <InfoPanel log="这是一条log" /> */}
    {/* <InfoPanel log={props.S.log} /> */}
    {/* <InfoPanel log={props.G.gamelog} /> */}
    <Controller 
      operations = {get_operations(props.G, props.S)}
      combined = {props.combined}
    />
    <CardRow 
      cards = {props.G.players[0].hand.map(hand_processor(props.S))}  
      handleCardClick = {idx => () => props.actions.select_hand(idx, props.G.players[props.S.player_idx].hand)}
    />
    <TopPanel gameCount={`${"東南西"[Math.floor(props.G.round/4)]}${props.G.round % 4 + 1}局`} checkGoal={()=>props.actions.change_board("GoalBoard")} />
  </div>;
}

function Goal(props: {goal: ICard}) {
  let goal_illust = (props.goal.is_public == true)? "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/green-salad_1f957.png":goal_illust_src;
  return <div className="goal">
    <div className="goal-illust-container">
      <img className="goal-illust" src={goal_illust} />
    </div>
    <div className="goal-desc-container">
      {/*props.goal.name <br/> props.goal.desc*/}
      <div className="goal-desc">
        {props.goal.name}<br/>
        {props.goal.desc}
      </div>
    </div>
  </div>;
}

function GoalBoard(props: BoardProps) {
  return <div className="board">
    <div className="goals-container">
      {props.G.players[props.S.player_idx].goals.map(goal => <Goal goal={goal}/>)}
    </div>
    <button className="gb-back-button" onClick={() => props.actions.change_board("GameBoard")} >返回</button>
  </div>;
}

const BOARDS: Record<string, (props:BoardProps)=>JSX.Element> = {
  GameBoard,
  GoalBoard,
};

export function Board(props: BGBoardProps<IGame>) {
  let [S, setS] = useState<IState>(init_state);
  let actions = map_object<Action, Dispatcher>(
    action => (...args: any[]) => setS(produce(S => action(S, ...args))), 
    ACTIONS,
  );
  let combined = map_object<CombinedAction, Dispatcher>(
    action => (...args: any[]) => action(props.moves, actions, ...args),
    COMBINED,
  );
  let {G, ctx, moves} = props;
  let board_props: BoardProps = {
    G, ctx, moves, S, actions, combined,
  };

  // Show hand info
  // Don't use useEffect to change the log, a strange bug may happen
  // useEffect(()=>{
  //   if (S.hand_selected != undefined) {
  //     let card = G.players[S.player_idx].hand[S.hand_selected];
  //     actions.log_msg(`${card.name}: ${card.desc}`);
  //   }
  //   else {
  //     return;
  //   }
  // }, [S.hand_selected]);

  // Show game info
  // useEffect(() => actions.log_msg(G.gamelog), [G.gamelog]);

  useEffect(() => {
    if (G.phase == "place") {
      actions.change_board("GoalBoard");
    }
  }, [G.phase]);

  let board: (props:BoardProps) => JSX.Element = BOARDS[S.board] || GameBoard;
  // let board = GoalBoard;

  return board(board_props);
}

