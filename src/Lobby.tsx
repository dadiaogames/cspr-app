import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import './Board.css';
import './Lobby.css';
import { AVATARS } from './avatars';
import { rand } from './utils';
import { SocketIO } from 'boardgame.io/dist/types/packages/multiplayer';

const NUM_PLAYERS = 4;

// const API = "localhost:3050";
const API = "47.96.2.148:3050";

// EH: Client and server should be communicated in a good way, not in this way
interface ILobby {
  player_id: string,
  rooms: any[],
  locked: boolean,
}

interface IRoomOperation {
  name?: string,
  effect?: () => void,
}

type Setter = (setter: (L: ILobby) => ILobby) => void;

function LobbyAvatar(props:{avatar?: string, is_player?: boolean}) {
  return <div className="lobby-avatar-container" style={{borderColor: props.is_player?"#389e0d":undefined}}>
    <img className="lobby-avatar" src={props.avatar} />
  </div>
}

// align-self
function Room(props:{players: string[], playerID?: string, operation?:IRoomOperation, locked?:boolean}) {
  return <div className="room">
    {props.players.map(p => <LobbyAvatar is_player={p==props.playerID} avatar={get_avatar(p)} />)}
    <button className="room-btn" style={{display:(props.operation == undefined || props.locked)?"none":undefined}} onClick={props.operation && props.operation.effect} >{props.operation && props.operation.name}</button>
  </div>
}

function get_avatar(pid:string): string {
  let len = AVATARS.length;
  return AVATARS[Math.floor(rand(pid)*len)][1];
}

function fetch_rooms(setter: (setter_function: (L: ILobby) => ILobby) => void) {
  let api = `http://${API}/rooms`;
  fetch(api).then(res => res.json()).then(res => setter(L => ({...L, rooms:res.rooms})));
}

function send_post_req(api:string, data:any) {
  return fetch(api, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

function onOperate(setter: Setter) {
  setter(L => ({...L, locked:true}));
  // This is not a cool way, but change this needs tons of refractors
  setTimeout(()=>fetch_rooms(setter), 500);
}

function create_room(player_id: string) {
  let api = `http://${API}/create`;
  return send_post_req(api, {player_id, max_players: NUM_PLAYERS});
}

function enter_room(player_id: string, room_id: string) {
  let api = `http://${API}/enter`;
  return send_post_req(api, {player_id, room_id});
}

function leave_room(player_id: string, room_id: string) {
  let api = `http://${API}/leave`;
  return send_post_req(api, {player_id, room_id});
}

function enter_game(player_id: string, room_id: string) {
  let api = `http://${API}/entergame`;
  return send_post_req(api, {player_id, room_id});
}

function leave_lobby(player_id: string) {
  let api = `http://${API}/leavelobby`;
  return send_post_req(api, {player_id});
}

function get_room_operation(room: any, player_id: string, player_contained: boolean, setter:Setter) {
  let player_in_room = room.players.find((x:any) => x.player_id == player_id);
  if (player_in_room != undefined) {
    return {name: "退出", effect:()=>{leave_room(player_id, room.room_id);onOperate(setter)}};
  }
  else {
    if (player_contained) {
      return undefined;
    }
    else {
      return {name: "加入", effect:()=>{
        enter_room(player_id, room.room_id);
        onOperate(setter);
      }};
    }
  }
}

export function Lobby(props:{actions:any}) {
  let [L, setL] = useState<ILobby>({
    player_id: uuidv4(),
    rooms: [],
    locked: false,
  });

  useEffect(()=>{
    // setL({...L, player_id: uuidv4()});
    fetch_rooms(setL);
    const interval = setInterval(()=>{
      fetch_rooms(setL);
      console.log("Fetching room from server...");
    }, 2500);
    let exit_lobby = () => {
      leave_lobby(L.player_id);
      clearInterval(interval);
      console.log(`Exit lobby ${L.player_id}`);
    };
    window.addEventListener("beforeunload", exit_lobby);
    return () => {
      exit_lobby();
      window.removeEventListener("beforeunload", exit_lobby);
    }
  }, []);

  useEffect(() => {
    let player_room = L.rooms.find(room => room.players.find((p:any) => p.player_id == L.player_id) != undefined);
    if (player_room && player_room.players.length == NUM_PLAYERS) {
      let player_idx = player_room.players.map((p:any) => p.player_id).indexOf(L.player_id) + "";
      // enter_game(L.player_id, player_room.room_id);
      props.actions.enter_game(player_room.room_id, player_idx);
    }
  }, [L.rooms]);

  useEffect(() => {
    if (L.locked) {
      setTimeout(()=>setL(L=>({...L, locked:false})), 2000);
    }
  }, [L.locked]);

  let player_contained = L.rooms.flatMap(room => room.players.map((p:any) => p.player_id)).includes(L.player_id);

  return <div className="board">
    <div className="lobby-player-panel">
      <LobbyAvatar avatar={get_avatar(L.player_id)} is_player={true} />
      <button className="room-btn" style={{display: (player_contained || L.locked)?"none":undefined}} onClick={() => setL({...L, player_id:uuidv4()})}>换个形象</button>
    </div>
    <div className="rooms">
      {/* <Room players={["1","2","3"]} operation={{name:"加入"}} /> */}
      {/* .filter(room => room.players.length < NUM_PLAYERS) */}
      {L.rooms.map(room => <Room players={room.players.map((p:any) => p.player_id)} playerID={L.player_id} operation={get_room_operation(room, L.player_id, player_contained, setL)} locked={L.locked} />)}
    </div>
    <div></div>
    <div style={{display: player_contained?"none":undefined}} className="lobby-controller">      
    <button className="lobby-btn" onClick={()=>props.actions.changer("Title")}>返回</button>
    <button className="lobby-btn" onClick={()=>{create_room(L.player_id);onOperate(setL);}} >创建房间</button>
    <button className="lobby-btn" onClick={()=>props.actions.direct_enter()} >重进</button>
    </div>
  </div>;
}
