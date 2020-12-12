import React, {ReactNode as EL, FC} from 'react';
import _ from 'lodash';
import { AVATARS } from './assets';

import './Board.css';

import { ICard, IPlayer } from './types';

function TopPanel(props: {gameCount: string|number}) {
  return <div className="top-panel">
    {props.gameCount}
  </div>;
}

function DeckArea(props: {cardNum?: number}) {
  return <div className="deck-area">
    <div className="card-num">
      {6}
    </div>
  </div>;
}

function PlayArea(props: {}) {
  return <div className="play-area">
  </div>;
}

function CardAreas(props: {}) {
  // Both draw pile and discard pile go together,
  // Also, Card should be 100% and be contained with card containers
  return <div className="card-areas">
    <DeckArea />
    <PlayArea />
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
export interface IPlayerInfo {
  illust?: string,
  selected?: boolean, 
  score: number,
  name: string, 
  info: string|EL,
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
    <CardAreas />
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

export interface IOperation {
  name: string | EL,
  handleClick?: () => void,
}

function Controller(props: {operations: IOperation[]}) {
  return <div className="controller">
    {props.operations.map(operation => 
      <button className="controller-button">{operation.name}</button>
    )}
  </div>;
}


function Card(props: ICard) {
  return <div className="card">
    <div className="card-fruit" style={{display:(props.fruit != undefined)?"":"none"}}>{props.fruit}</div>
    {/* TODO: props.fruit && FRUITS[props.fruit] */}
  </div>;
}

function CardContainer(props: {card: ICard}) {
  return <div className="card-container" style={{border:(props.card.selected == true)?"3px solid #61dafb":undefined}}>
    <Card {...props.card} />
  </div>;
}

function CardRow(props: {}) {
  return <div className="card-row">
    <CardContainer card={{selected:true}} />
    <CardContainer card={{fruit:0}} />
  </div>;
}

function Template(props: {}) {
  return <div className="template">
  </div>;
}

export function Board(props: {}) {
  let avatars = _.shuffle(AVATARS).slice(0,4);

  let players: IPlayerInfo[] = [
    {
      illust: avatars[0],
      name: "对家",
      score: 2,
      info: "扣给你",
    },
    {
      illust: avatars[1],
      name: "上家",
      score: 2,
      info: "扣给其上家",
    },
    {
      illust: avatars[2],
      name: "下家",
      score: 2,
      info: "扣给你",
    },
    {
      illust: avatars[3],
      name: "玩家",
      score: 2,
      info: "扣给自己",
      selected: true,
    },
  ];
  return <div className="board">
    <Central 
      players = {players}
    />
    <InfoPanel log={"这是一条log"} />
    <Controller 
      operations = {[{name:"搞事"}, {name:"整活"}]}
    />
    <CardRow />
    <TopPanel gameCount={"東1局"} />
  </div>

}