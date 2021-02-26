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

function introduce_gameplay() {
  alert("欢迎来到《雀魂：爆炸一姬》！\n游戏目标：在8局之后，分数全场最高\n每盘游戏由8局组成(东1局-南4局)，每局由两个阶段组成：\n* 扣牌阶段：将1张牌扣到任意一名玩家面前，重复7次；\n* 翻牌阶段：洗混扣在自己面前的所有牌，然后一张一张地翻开；\n翻到炸弹时直接出局，翻到护甲时可抵挡一次炸弹，翻到操作牌时则执行其效果，\"目标牌\"在牌堆最底层，翻开后如果达成目标，就能获得分数；\n(额外说明：翻牌阶段，如果翻到左上角有水果的操作牌时，则要做出抉择：是将这张牌作为操作还是作为水果)\n举例：\n* 东1局，扣牌阶段，一姬的目标是\"击杀下家\"，因此一姬将一张炸弹扣给了下家\n* 一姬的下家，二姐，发现别人扣给自己牌，感觉不对，于是将一张\"护甲\"扣给了自己\n* 一姬的对家，女仆的目标是\"获得柠檬\"，因此女仆将手里一张左上角有\"柠檬\"的牌扣给了自己\n* 就这样扣了7次之后，所有人洗混了自己面前的牌，进入翻牌阶段");
}

const Title = (props: {actions: any}) => {
  return <TitleScreen 
    title = "雀魂: 爆炸一姬"
    titleImg = "https://s3.ax1x.com/2021/02/02/ym9Sln.png"
    operations = {[
      {name: "单人练习", effect: () => props.actions.changer("SingleClient")},
      {name: "多人运动", effect: () => props.actions.changer("CSPRLobby")},
      {name: "玩法教学", effect: introduce_gameplay},
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