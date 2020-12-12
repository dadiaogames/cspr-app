import { Client } from 'boardgame.io/react';
import { CSPR } from './Game';
import { Board } from './Board';

const App = Client({
  game: CSPR,
  board: Board,
  debug: false,
});

export default App;