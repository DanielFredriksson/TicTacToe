import express, { Router, Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';
import * as OpenApiValidator from 'express-openapi-validator';
import GameBoard from './board';

// https://www.qualisys.com/about/careers/challenge/tic-tac-toe/
// https://github.com/DanielFredriksson/TicTacToe

const PORT = 3000;

const router = Router();

const Game = new GameBoard();

router.get(
  '/resetBoard',
  expressAsyncHandler(async (req, res) => {
    Game.resetGame();
    res.send('Board reset');
  }),
);

router.get(
  '/addMoveComputer',
  expressAsyncHandler(async (req, res) => {
    const move = Game.calculateComputerMove();

    Game.addMove(move);

    const output = Game.handleEndGame();

    res.send(output);
  }),
);

router.get(
  '/addMovePlayer',
  expressAsyncHandler(async (req, res) => {
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
  }),
);

const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // console.log(`[${now.toISOString()}] ${req.method} ${req.path}`);

  next();
};

const initializeExpressApp = () => {
  const app = express();
  app.use(express.json());
  app.use(requestLoggerMiddleware);
  app.use(
    OpenApiValidator.middleware({
      apiSpec: './openapi.yaml',
      validateRequests: true,
      validateResponses: false,
    }),
  );
  app.use('/api', router);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response) => {
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  });
  return app;
};

const app = initializeExpressApp();

app.listen(PORT, () => {
  console.log(`Example app listening on http://localhost:${PORT}/`);
});

export default app;
