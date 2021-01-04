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

const SERVER = SocketIO({server:"47.96.2.148:8000"});
// const SERVER = SocketIO({server:"localhost:8000"});
// const SERVER = Local();

interface IAppState {
  scene: string,
  game_instance: {matchID: string, playerID: string} | undefined,
  ai_players: number,
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
    // in_game: false,
  });

  const scenes: Record<string, JSX.Element> = {
    CSPRLobby,
    Title,
    SingleClient,
  }

  const actions: Record<string, Dispatcher> = {
    changer: (scene: string) => setS({...S, scene}),
    enter_game: (matchID: string, playerID: string) => {
      // alert(`对局代码为: ${matchID}${playerID}`);
      setS({...S, game_instance: {matchID, playerID}});
    },
    finish_game: () => setS({...S, game_instance:undefined}),
    direct_enter: () => {
      let game_data = prompt("输入对局代码:")
      let playerID = game_data[4];
      let matchID = game_data.slice(0,4);
      let ai_players = game_data[6];
      setS({...S, game_instance:{matchID, playerID}});
      if (ai_players) {
        console.log("There are some ai players");
        setS({...S, ai_players: parseInt(ai_players)});
      }
    },
  }

  let Scene = scenes[S.scene] || Title;
  if (S.game_instance != undefined) {
    let GameInstance = Client({
      // game: {...CSPR, seed:S.game_instance.matchID},
      game: CSPR,
      board: Board,
      debug: false,
      multiplayer: SERVER,
      numPlayers: 4,
      // seed: S.game_instance.matchID,
    });
    Scene = (props:any) => <GameInstance matchID={S.game_instance.matchID} playerID={S.game_instance.playerID} {...props} />;
  }

  return <Scene {...{S, actions}} />;
};

export default App;