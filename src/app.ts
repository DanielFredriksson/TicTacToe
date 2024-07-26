import express, { Router, Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import GameBoard from './board';

// https://www.qualisys.com/about/careers/challenge/tic-tac-toe/
// https://github.com/DanielFredriksson/TicTacToe

const PORT = process.env.PORT || 3000;

const router = Router();

const Game = new GameBoard();

router.get('/resetBoard', expressAsyncHandler(async (req, res) => {
  Game.resetGame();
  res.send('Board reset');
}));

router.get('/addMoveComputer', expressAsyncHandler(async (req, res) => {
  const move = Game.calculateComputerMove();
  
  Game.addMove(move);

  const output = Game.handleEndGame();

  res.send(output);
}));

router.get('/addMovePlayer', expressAsyncHandler(async (req, res) => {
  console.log('Request query', req.query);
  const attemptedMove = parseInt(req.query.x as string, 10);
  console.log('Player wants to move', attemptedMove);
  let output = '';

  if (Game.isMoveViable(attemptedMove)) {
    Game.addMove(attemptedMove);
  } else {
    output += 'Invalid move!\n';
  }

  output += Game.handleEndGame();
  
  res.send(output);
}));

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // const now = new Date();
  // console.log(`[${now.toISOString()}] ${req.method} ${req.path}`);
  next();
};

const initializeExpressApp = () => {
  const app = express();
  app.use(express.json());
  app.use(requestLoggerMiddleware);
  app.use('/api', router);
  return app;
};

const app = initializeExpressApp();

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}/`)
});

export default app;