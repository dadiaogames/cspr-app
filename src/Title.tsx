import React from 'react';
import './Board.css';
import './Title.css';

interface ITitleOperation {
  name: string,
  effect?: () => void,
}

export const TitleScreen = (props: {title: string, operations: ITitleOperation[], titleImg?: string}) => (
  <div className="board">
  <div className="title-block">
    <div className="title-img-container">
      <img className="title-img" src={props.titleImg} />
    </div>
    <h2 className="title" >{props.title}</h2>
    <div >
      制作: <a href="https://space.bilibili.com/8492192/dynamic/" className="title-a">大雕游戏</a>
    </div>
    {props.operations.map(operation => <span><button className="title-screen-button primary" onClick={operation.effect}>{operation.name}</button><br/></span>)}
  </div>
  </div>
);