// @ts-nocheck
import React, { useEffect } from 'react';
import { Client, Lobby } from 'boardgame.io/react';
import { Local, SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client'
import { CSPR } from './Game';
import { Board } from './Board';

// const App = Client({
//   game: CSPR,
//   board: Board,
//   debug: false,
// });

// const App = () => {
//   useEffect(()=>{
//     console.log("Start loading");
//     let lc = new LobbyClient({server: "http://localhost:8001"});
//     lc.listGames().then(console.log).then(()=>console.log("Loaded"));
//   }, []);
//   return <Lobby
//     gameServer={`http://localhost:8000`} 
//     lobbyServer={`http://localhost:8001`}
//     gameComponents={[{game: CSPR, name: "default", board: Board}]} 
//   />;
// };

const CSPRClient = Client({
  game: CSPR,
  board: Board,
  debug: false,
  multiplayer: Local(),
  // multiplayer: SocketIO({server: 'localhost:8000'}),

  numPlayers: 1,
});

const App = () => {
  return <div style={{display: "flex"}}>
    <CSPRClient playerID="0" />
    {/* <CSPRClient playerID="1" matchID="default" /> */}
  </div>
};

// const App = () => (<div>Hello world!</div>);

export default App;