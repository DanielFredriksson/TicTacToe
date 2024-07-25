import express, { Router, Request, Response, NextFunction } from 'express';
import expressAsyncHandler from 'express-async-handler';

// https://www.qualisys.com/about/careers/challenge/tic-tac-toe/
// https://github.com/DanielFredriksson/TicTacToe

const PORT = process.env.PORT || 3000;

const router = Router();

router.get('/hello', expressAsyncHandler(async (req, res) => {

  res.send('Hello World!');
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
