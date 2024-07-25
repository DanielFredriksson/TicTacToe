import express, { Router, Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

// https://www.qualisys.com/about/careers/challenge/tic-tac-toe/
// https://github.com/DanielFredriksson/TicTacToe

const PORT = process.env.PORT || 3000;

const router = Router();

const array = [
  '-', '-', '-',
  '-', '-', '-',
  '-', '-', '-',
];

let moveCounter = 0;

const isMoveViable = (index: number) => {
  return array[index] === '-';
}

const addMove = (index: number) => {
  array[index] = moveCounter % 2 === 0 ? 'X' : 'O';
  console.log('Array modified', array);
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

  const allLineIndices = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6], // diagonals
  ];

  for (const lineIndices of allLineIndices) {
    const [a, b, c] = lineIndices;
    const currentLine = [array[a], array[b], array[c]];

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
  for (let i = 0; i < array.length; i++) {
    array[i] = '-';
  }
  moveCounter = 0;
};

const getBoard = () => {
  return array.reduce((acc, curr, index) => {
    if (index % 3 === 0) {
      acc += '\n';
    }
    acc += curr;
    return acc;
  }, '');
}

router.get('/addMovePlayer', expressAsyncHandler(async (req, res) => {
  const x = req.query.x;
  const xAsNumber = parseInt(x as string, 10);
  let output = '';
  let gameState = null;

  if (isMoveViable(xAsNumber)) {
    addMove(xAsNumber);
    gameState = getGameState();
  } else {
    output += 'Invalid move\n';
  }

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
