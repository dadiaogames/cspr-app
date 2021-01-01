import React from 'react';
import { Server } from 'boardgame.io/server';
import { CSPR } from './Game'; 

const server = Server({
  games: [CSPR],
});
const lobbyConfig = {
  apiPort: 8001,
  apiCallback: () => console.log('Running Lobby API on port 8001...'),
};

const port = parseInt(process.env.PORT || "8000");

server.run(port, ()=>console.log(`Game server running on port ${port}`));