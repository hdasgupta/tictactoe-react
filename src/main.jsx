import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,4,6]];
const winnerOf = (board) => {
  for (const [a,b,c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line: [a,b,c] };
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
};
const nextSymbol = (symbol) => symbol === 'X' ? 'O' : 'X';
const bestMove = (board, computer, human) => {
  const minimax = (state, computerTurn, depth) => {
    const result = winnerOf(state);
    if (result) {
      if (result.winner === computer) return 10 - depth;
      if (result.winner === human) return depth - 10;
      return 0;
    }
    const scores = state.map((cell, index) => {
      if (cell) return null;
      const next = state.map((value, i) => i === index ? (computerTurn ? computer : human) : value);
      return minimax(next, !computerTurn, depth + 1);
    }).filter(value => value !== null);
    return computerTurn ? Math.max(...scores) : Math.min(...scores);
  };
  let selected = null;
  let highest = -Infinity;
  board.forEach((cell, index) => {
    if (cell) return;
    const next = board.map((value, i) => i === index ? computer : value);
    const value = minimax(next, false, 0);
    if (value > highest) { highest = value; selected = index; }
  });
  return selected;
};

function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [turn, setTurn] = useState('X');
  const [result, setResult] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [scores, setScores] = useState({ player: 0, computer: 0, draw: 0 });
  const computerSymbol = useMemo(() => nextSymbol(playerSymbol), [playerSymbol]);

  const endGame = (outcome) => {
    setResult(outcome);
    const key = outcome.winner === 'draw' ? 'draw' : outcome.winner === playerSymbol ? 'player' : 'computer';
    setScores(current => ({ ...current, [key]: current[key] + 1 }));
  };
  const startNewGame = () => {
    const nextPlayer = nextSymbol(playerSymbol);
    setPlayerSymbol(nextPlayer);
    setBoard(Array(9).fill(null));
    setTurn('X');
    setResult(null);
    setThinking(false);
  };
  const placeHumanMove = (index) => {
    if (board[index] || result || thinking || turn !== playerSymbol) return;
    const next = board.map((cell, i) => i === index ? playerSymbol : cell);
    setBoard(next);
    const outcome = winnerOf(next);
    if (outcome) endGame(outcome); else setTurn(computerSymbol);
  };
  useEffect(() => {
    if (turn !== computerSymbol || result) return;
    setThinking(true);
    const timer = setTimeout(() => {
      const index = bestMove(board, computerSymbol, playerSymbol);
      const next = board.map((cell, i) => i === index ? computerSymbol : cell);
      setBoard(next);
      setThinking(false);
      const outcome = winnerOf(next);
      if (outcome) endGame(outcome); else setTurn(playerSymbol);
    }, 480);
    return () => clearTimeout(timer);
  }, [turn, board, result, computerSymbol, playerSymbol]);

  const status = result
    ? result.winner === 'draw' ? 'It’s a draw!' : result.winner === playerSymbol ? 'You won! Brilliant move.' : 'Computer wins this round.'
    : thinking ? 'Computer is thinking…'
    : turn === playerSymbol ? `Your turn — place ${playerSymbol}` : 'Computer’s turn';

  return <main className="app"><section className="game-card"><div className="glow glow-one"/><div className="glow glow-two"/>
    <header><div><p className="eyebrow">PLAY AGAINST THE COMPUTER</p><h1>Tic <span>Tac</span> Toe</h1></div><button className="new" onClick={startNewGame}>↻ New game</button></header>
    <div className="scoreboard"><div><small>YOU · {playerSymbol}</small><strong className={playerSymbol.toLowerCase()}>{playerSymbol}</strong><b>{scores.player}</b></div><div><small>DRAW</small><strong className="dash">—</strong><b>{scores.draw}</b></div><div><small>COMPUTER · {computerSymbol}</small><strong className={computerSymbol.toLowerCase()}>{computerSymbol}</strong><b>{scores.computer}</b></div></div>
    <p className={'status ' + (result ? 'finished' : '')}>{status}</p>
    <div className="board" aria-label="Tic tac toe board">{board.map((cell, index) => <button key={index} onClick={() => placeHumanMove(index)} className={`cell ${cell?.toLowerCase() || ''} ${result?.line.includes(index) ? 'winner' : ''}`} aria-label={`Cell ${index + 1}`}>{cell}</button>)}</div>
    {result && <div className="overlay"><div className="modal"><div className="trophy">{result.winner === 'draw' ? '🤝' : result.winner === playerSymbol ? '🏆' : '🤖'}</div><h2>{result.winner === 'draw' ? 'A perfect tie' : result.winner === playerSymbol ? 'You won!' : 'Good game!'}</h2><p>Your symbol will alternate next game: <b>{nextSymbol(playerSymbol)}</b>.</p><button className="play" onClick={startNewGame}>Start new game <span>→</span></button></div></div>}
    <footer>You are <b>{playerSymbol}</b> · Computer is <b>{computerSymbol}</b> · Symbols switch every game</footer>
  </section></main>;
}
createRoot(document.getElementById('root')).render(<App />);
