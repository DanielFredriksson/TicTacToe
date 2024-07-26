import app from '../src/app';
import request from 'supertest';

describe('GET /api', () => {
  afterEach(async () => {
    await request(app).get('/api/resetBoard');
  });

  describe('Game Logic', () => {
    it('Game should return board after a move', async () => {
      const response = await request(app).get('/api/addMovePlayer').query({ x: 4 });

      expect(response.status).toBe(200);
      expect(response.text).toBe(`
---
-X-
---`);
    });

    it('Game should return "Invalid Move" when moving to occupied space', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      const response = await request(app).get('/api/addMovePlayer').query({ x: 0 });
  
      expect(response.status).toBe(200);
      expect(response.text).toBe(`Invalid move!

X--
---
---`);
    });
  
    it('Game should register a win for player one (ex line)', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      await request(app).get('/api/addMovePlayer').query({ x: 3 });
      await request(app).get('/api/addMovePlayer').query({ x: 1 });
      await request(app).get('/api/addMovePlayer').query({ x: 6 });
      const response = await request(app).get('/api/addMovePlayer').query({ x: 2 });
  
      expect(response.status).toBe(200);
      expect(response.text).toBe(`Player 1 won!

XXX
O--
O--`);
    });

    it('Game should register a win for player two (ex diagonal)', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 1 });
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      await request(app).get('/api/addMovePlayer').query({ x: 2 });
      await request(app).get('/api/addMovePlayer').query({ x: 4 });
      await request(app).get('/api/addMovePlayer').query({ x: 7 });
      const response = await request(app).get('/api/addMovePlayer').query({ x: 8 });
  
      expect(response.status).toBe(200);
      expect(response.text).toBe(`Player 2 won!

OXX
-O-
-XO`);
    });

    it('Game should register a draw when no moves are left', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      await request(app).get('/api/addMovePlayer').query({ x: 2 });
      await request(app).get('/api/addMovePlayer').query({ x: 1 });
      await request(app).get('/api/addMovePlayer').query({ x: 3 });
      await request(app).get('/api/addMovePlayer').query({ x: 5 });
      await request(app).get('/api/addMovePlayer').query({ x: 4 });
      await request(app).get('/api/addMovePlayer').query({ x: 6 });
      await request(app).get('/api/addMovePlayer').query({ x: 7 });
      const response = await request(app).get('/api/addMovePlayer').query({ x: 8 });
  
      expect(response.status).toBe(200);
      expect(response.text).toBe(`Game is a draw!

XXO
OOX
XOX`);
    });

    it('Winning last move should win, not draw', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      await request(app).get('/api/addMovePlayer').query({ x: 1 });
      await request(app).get('/api/addMovePlayer').query({ x: 3 });
      await request(app).get('/api/addMovePlayer').query({ x: 2 });
      await request(app).get('/api/addMovePlayer').query({ x: 5 });
      await request(app).get('/api/addMovePlayer').query({ x: 4 });
      await request(app).get('/api/addMovePlayer').query({ x: 7 });
      await request(app).get('/api/addMovePlayer').query({ x: 8 });
      const response = await request(app).get('/api/addMovePlayer').query({ x: 6 });
  
      expect(response.status).toBe(200);
      expect(response.text).toBe(`Player 1 won!

XOO
XOX
XXO`);
    });
  })

  describe('Computer Logic', () => {
    it('Computer should choose center first', async () => {
      const response = await request(app).get('/api/addMoveComputer');
  
      expect(response.status).toBe(200);
      expect(response.text).toBe(`
---
-X-
---`);
    });

    it('Computer should choose winning move', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      await request(app).get('/api/addMovePlayer').query({ x: 6 });
      await request(app).get('/api/addMovePlayer').query({ x: 1 });
      await request(app).get('/api/addMovePlayer').query({ x: 3 });
      const response = await request(app).get('/api/addMoveComputer');

      expect(response.status).toBe(200);
      expect(response.text).toBe(`Player 1 won!

XXX
O--
O--`);
    });

    it('Computer should block winning move', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      await request(app).get('/api/addMovePlayer').query({ x: 6 });
      await request(app).get('/api/addMovePlayer').query({ x: 1 });
      const response = await request(app).get('/api/addMoveComputer');

      expect(response.status).toBe(200);
      expect(response.text).toBe(`
XXO
---
O--`);
    });

    it('Computer should block threatening intersection', async () => {
      await request(app).get('/api/addMovePlayer').query({ x: 4 });
      await request(app).get('/api/addMovePlayer').query({ x: 0 });
      await request(app).get('/api/addMovePlayer').query({ x: 1 });
      await request(app).get('/api/addMovePlayer').query({ x: 7 });
      const response = await request(app).get('/api/addMoveComputer');

      expect(response.status).toBe(200);
      expect(response.text).toBe(`
OX-
-X-
XO-`);
    });

    it('Two computers should draw', async () => {
      await request(app).get('/api/addMoveComputer');
      await request(app).get('/api/addMoveComputer');
      await request(app).get('/api/addMoveComputer');
      await request(app).get('/api/addMoveComputer');
      await request(app).get('/api/addMoveComputer');
      await request(app).get('/api/addMoveComputer');
      await request(app).get('/api/addMoveComputer');
      await request(app).get('/api/addMoveComputer');
      const response = await request(app).get('/api/addMoveComputer');

      expect(response.status).toBe(200);
      expect(response.text).toBe(`Game is a draw!

OXO
XXO
XOX`);
    });
  })
});
