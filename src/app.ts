import express, { Router, Request, Response } from 'express';
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
    res.send('Board reset!');
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
    const attemptedMove = parseInt(req.query.x as string, 10);
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

const initializeExpressApp = () => {
  const app = express();
  app.use(express.json());
  app.use(
    OpenApiValidator.middleware({
      apiSpec: './openapi.yaml',
      validateRequests: true,
      validateResponses: false,
    }),
  );
  app.use('/api', router);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  console.log(`Example app listening on http://localhost:${PORT}/api/`);
});

export default app;
