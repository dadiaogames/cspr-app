// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Client } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client'
import { CSPR } from './Game';
import { Board } from './Board';
import { TitleScreen } from './Title';
import { Lobby } from './Lobby';
import { Dispatcher } from './types';

const SERVER = "47.96.2.148:8000"
// const SERVER = "localhost:8000"

interface IAppState {
  scene: string,
  game_instance: {matchID: string, playerID: string} | undefined,
}

// const App = Client({
//   game: CSPR,
//   board: Board,
//   debug: false,
// });

const SingleClient = Client({
  game: CSPR,
  board: Board,
  debug: false,
  // multiplayer: Local(),
  // multiplayer: SocketIO({server: 'localhost:8000'}),

  numPlayers: 1,
});

// const App = () => {
//   return <div style={{display: "flex"}}>
//     <CSPRClient playerID="0" />
//     {/* <CSPRClient playerID="1" matchID="default" /> */}
//   </div>
// };

const Title = (props: {actions: any}) => {
  return <TitleScreen 
    title = "雀魂: 爆炸一姬"
    titleImg = "https://s3.ax1x.com/2020/12/30/rqw8KA.png"
    operations = {[
      {name: "单人练习", effect: () => props.actions.changer("SingleClient")},
      {name: "多人运动", effect: () => props.actions.changer("CSPRLobby")},
      {name: "玩法教学"},
  ]}
  />;
};

const CSPRLobby = (props:any) => {
  return <Lobby {...props} />;
}

const App = () => {
  let [S, setS] = useState<IAppState>({
    scene: "Title",
    in_game: false,
  });

  const scenes: Record<string, JSX.Element> = {
    CSPRLobby,
    Title,
    SingleClient,
  }

  const actions: Record<string, Dispatcher> = {
    changer: (scene: string) => setS({...S, scene}),
    enter_game: (matchID: string, playerID: string) => setS({...S, game_instance: {matchID, playerID}}),
    finish_game: () => setS({...S, game_instance:undefined}),
    direct_enter: () => {
      let game_data = prompt("输入对局代码:");
      let playerID = game_data.slice(-1);
      let matchID = game_data.slice(0,-1);
      setS({...S, game_instance:{matchID, playerID}});
    },
  }

  let Scene = scenes[S.scene] || Title;
  if (S.game_instance != undefined) {
    let GameInstance = Client({
      game: CSPR,
      board: Board,
      debug: false,
      multiplayer: SocketIO({server: SERVER}),
      numPlayers: 4,
    });
    Scene = () => <GameInstance matchID={S.game_instance.matchID} playerID={S.game_instance.playerID} />;
  }

  return <Scene {...{S, actions}} />;
};

export default App;