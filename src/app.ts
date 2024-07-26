import express, { Router, Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

// https://www.qualisys.com/about/careers/challenge/tic-tac-toe/
// https://github.com/DanielFredriksson/TicTacToe

const PORT = process.env.PORT || 3000;

const router = Router();

type Player = 'X' | 'O';
type Board = Array<Player | '-'>;
type Side = 1 | 3 | 5 | 7;

const board: Board = [
  '-', '-', '-',
  '-', '-', '-',
  '-', '-', '-',
];

const sideIndices: Side[] = [1, 3, 5, 7];
const cornerIndicesOfSideIndice = {
  1: [0, 2],
  3: [0, 6],
  5: [2, 8],
  7: [6, 8],
};

const allLineIndices = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

let moveCounter = 0;

const findGameWinningMove = (player: Player) => {
  console.log('------')
  for (const lineIndices of allLineIndices) {
    const [a, b, c] = lineIndices;
    const currentLine = [board[a], board[b], board[c]];

    const indicesFilledByPlayer = currentLine.filter(valueOfIndex => valueOfIndex === player);

    if (indicesFilledByPlayer.length === 2 && currentLine.includes('-')) {
      return lineIndices[currentLine.indexOf('-')];
    }
  }

  return -1;
}

const isMoveViable = (index: number) => {
  return board[index] === '-';
}

const addMove = (index: number) => {
  board[index] = moveCounter % 2 === 0 ? 'X' : 'O';
  console.log('board modified', board);
  moveCounter++;
}

enum GameState {
  ONGOING,
  PLAYER1_WON,
  PLAYER2_WON,
  DRAW,
}

const getGameState = () => {
  if (moveCounter >= 9) {
    return GameState.DRAW;
  }

  for (const lineIndices of allLineIndices) {
    const [a, b, c] = lineIndices;
    const currentLine = [board[a], board[b], board[c]];

    if (currentLine.every((value) => value === 'X')) {
      return GameState.PLAYER1_WON
    }
    if (currentLine.every((value) => value === 'O')) {
      return GameState.PLAYER2_WON
    }
  }

  return GameState.ONGOING;
};

const resetGame = () => {
  for (let i = 0; i < board.length; i++) {
    board[i] = '-';
  }
  moveCounter = 0;
};

const getBoard = () => {
  return board.reduce((acc, curr, index) => {
    if (index % 3 === 0) {
      acc += '\n';
    }
    acc += curr;
    return acc;
  }, '');
}

const calculateComputerMove = (board: Board, computerPlayer: Player): number => {
  const opponent: Player = computerPlayer === 'X' ? 'O' : 'X';
  const center = 4;

  // Rule 1: Take the center if it's available
  if (board[center] === '-') {
    console.log('Computer choosing center');
    return center;
  }

  // Rule 2: Win if possible
  const winningMove = findGameWinningMove(computerPlayer);
  if (winningMove !== -1) {
    console.log('Computer thinks winning move is at', winningMove);
    return winningMove;
  }

  // Rule 3: Block opponent's winning move
  const blockingMove = findGameWinningMove(opponent);
  if (blockingMove !== -1) {
    console.log('Computer thinks blocking move is at', blockingMove);
    return blockingMove; 
  }

  // Rule 4: Game determining corner move if Computer chose center and Player chose a side instead of corner
  if (moveCounter === 2 && board[center] === computerPlayer) {
    console.log('Computer thinks game determining corner move might be possible');
    const playerChoseSide = sideIndices.find(index => board[index] === opponent);

    if (playerChoseSide) {
      console.log('Player chose side', playerChoseSide, 'Computer will try to take a corner');
      const gameDeterminingMove = cornerIndicesOfSideIndice[playerChoseSide].find(boardIndex => board[boardIndex] === '-');
      console.log('Computer thinks game determining corner move is at', gameDeterminingMove);
      if (gameDeterminingMove !== undefined) return gameDeterminingMove;
    }
  }

  // Rule 5: If opponent took the center on their first move, the computer should take a corner
  if (moveCounter === 1 && board[center] === opponent) {
    console.log('Computer thinks opponent took center on first move, will try to take a corner at 0');
    return 0;
  }

  // Doesn't matter what computer picks at this point, as draw is inevitable if both players play optimally
  return board.findIndex(spot => spot === '-');
}

const handleEndGame = (gameState?: GameState): string => {
  let output = '';

  switch (gameState) {
    case GameState.ONGOING:
      output += getBoard();
      break;

    case GameState.DRAW:
      output += 'Game is a draw!\n';
      output += getBoard();
      resetGame();
      break;

    case GameState.PLAYER1_WON:
      output += 'Player 1 won!\n';
      output += getBoard();
      resetGame();
      break;

    case GameState.PLAYER1_WON:
      output += 'Player 2 won!\n';
      output += getBoard();
      resetGame();
      break;
  
    default:
      // Occurs if move is invalid
      output += getBoard();
      break;
  }

  return output;
}

router.get('/addMoveComputer', expressAsyncHandler(async (req, res) => {
  const move = calculateComputerMove(board, moveCounter % 2 === 0 ? 'X' : 'O');
  console.log('Computer wants to move', move);

  addMove(move);

  const output = handleEndGame(getGameState());

  res.send(output);
}));

router.get('/addMovePlayer', expressAsyncHandler(async (req, res) => {
  const attemptedMove = parseInt(req.query.x as string, 10);
  let output = '';
  let gameState = undefined;

  if (isMoveViable(attemptedMove)) {
    addMove(attemptedMove);

    gameState = getGameState();
  } else {
    output += 'Invalid move\n';
  }

  output += handleEndGame(gameState);
  
  res.send(output);
}));

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const now = new Date();
  console.log(`[${now.toISOString()}] ${req.method} ${req.path}`);
  next();
};

const initializeExpressApp = async () => {
  const app = express();
  app.use(express.json());
  app.use(requestLoggerMiddleware);
  app.use('/api', router);
  return app;
};

const app = await initializeExpressApp();

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}/`)
});
