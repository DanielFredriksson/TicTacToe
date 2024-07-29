type Player = 'X' | 'O';
type Board = Array<Player | '-'>;
type Side = 1 | 3 | 5 | 7;

enum GameState {
  ONGOING,
  PLAYER1_WON,
  PLAYER2_WON,
  DRAW,
}

const sideIndices: Side[] = [1, 3, 5, 7];
const cornerIndicesOfSideIndice = {
  1: [0, 2],
  3: [0, 6],
  5: [2, 8],
  7: [6, 8],
};

const allLineIndices = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

class GameBoard {
  board: Board;
  moveCounter: number;

  constructor() {
    this.board = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
    this.moveCounter = 0;
  }

  findGameWinningMove(player: Player) {
    for (const lineIndices of allLineIndices) {
      const [a, b, c] = lineIndices;
      const currentLine = [this.board[a], this.board[b], this.board[c]];

      const indicesFilledByPlayer = currentLine.filter((valueOfIndex) => valueOfIndex === player);

      if (indicesFilledByPlayer.length === 2 && currentLine.includes('-')) {
        return lineIndices[currentLine.indexOf('-')];
      }
    }

    return -1;
  }

  isMoveViable(index: number) {
    return this.board[index] === '-';
  }

  addMove(index: number) {
    this.board[index] = this.moveCounter % 2 === 0 ? 'X' : 'O';
    // console.log('board modified', thboard);
    this.moveCounter++;
  }

  resetGame() {
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = '-';
    }
    this.moveCounter = 0;
  }

  getBoard() {
    return this.board.reduce((acc, curr, index) => {
      if (index % 3 === 0) {
        acc += '\n';
      }
      acc += curr;
      return acc;
    }, '');
  }

  calculateComputerMove() {
    const computerPlayer = this.moveCounter % 2 === 0 ? 'X' : 'O';
    const opponent: Player = computerPlayer === 'X' ? 'O' : 'X';
    const center = 4;

    // Rule 1: Win if possible
    const winningMove = this.findGameWinningMove(computerPlayer);
    if (winningMove !== -1) {
      return winningMove;
    }

    // Rule 2: Block opponent's winning move
    const blockingMove = this.findGameWinningMove(opponent);
    if (blockingMove !== -1) {
      return blockingMove;
    }

    // Rule 3: Game determining corner move if Computer chose center and Player chose a side instead of corner
    if (this.moveCounter === 2 && this.board[center] === computerPlayer) {
      const playerChoseSide = sideIndices.find((index) => this.board[index] === opponent);

      if (playerChoseSide) {
        const gameDeterminingMove = cornerIndicesOfSideIndice[playerChoseSide].find(
          (boardIndex) => this.board[boardIndex] === '-',
        );
        if (gameDeterminingMove !== undefined) {
          return gameDeterminingMove;
        }
      }
    }

    // Rule 4: If opponent took the center on their first move, the computer should take a corner
    if (this.moveCounter === 1 && this.board[center] === opponent) {
      return 0;
    }

    // Rule 5: Take the center if it's available
    if (this.board[center] === '-') {
      return center;
    }

    // Rule 6: Block opponents line intersections
    const emptyIndices = this.board.map((value, index) => (value === '-' ? index : -1)).filter((value) => value !== -1);
    const intersectionThreat = emptyIndices.find((emptyIndex) => {
      const linesContainingEmptyIndex = allLineIndices.filter((lineIndices) => lineIndices.includes(emptyIndex));

      const linesWithExclusivelyOpponentsMoves = linesContainingEmptyIndex.filter((lineIndices) => {
        const containsOpponentsMove = lineIndices.some((index) => this.board[index] === opponent);
        const doesntContainComputersMove = !lineIndices.some((index) => this.board[index] === computerPlayer);

        return containsOpponentsMove && doesntContainComputersMove;
      });

      return linesWithExclusivelyOpponentsMoves.length >= 2;
    });

    if (intersectionThreat) {
      return intersectionThreat;
    }

    // Doesn't matter what computer picks at this point, as draw is inevitable if both players play optimally
    return this.board.findIndex((spot) => spot === '-');
  }

  getGameState() {
    for (const lineIndices of allLineIndices) {
      const [a, b, c] = lineIndices;
      const currentLine = [this.board[a], this.board[b], this.board[c]];

      if (currentLine.every((value) => value === 'X')) {
        return GameState.PLAYER1_WON;
      }
      if (currentLine.every((value) => value === 'O')) {
        return GameState.PLAYER2_WON;
      }
    }

    // Draw can be inferred from second move if both players play optimally but not fun so we let the game play out
    if (this.moveCounter >= 9) {
      return GameState.DRAW;
    }

    return GameState.ONGOING;
  }

  handleEndGame() {
    const gameState = this.getGameState();
    let output = '';

    switch (gameState) {
      case GameState.ONGOING:
        output += this.getBoard();
        break;

      case GameState.DRAW:
        output += 'Game is a draw!\n';
        output += this.getBoard();
        this.resetGame();
        break;

      case GameState.PLAYER1_WON:
        output += 'Player 1 won!\n';
        output += this.getBoard();
        this.resetGame();
        break;

      case GameState.PLAYER2_WON:
        // Random Change
        output += 'Player 2 won!\n';
        output += this.getBoard();
        this.resetGame();
        break;

      default:
        // Occurs if move is invalid
        output += this.getBoard();
        break;
    }

    return output;
  }
}

export default GameBoard;
