import { Board } from "@/domain/entities/Board.ts";
import { MineCounter } from "@/domain/services/MineCounter.ts";
import { MineGenerator} from "@/domain/services/MineGenerator.ts";

export class Game {
    public readonly board: Board;

    constructor(
        width: number,
        height: number,
        mineCount: number
    ) {
        this.board = new Board(width, height);

        const mineGenerator = new MineGenerator();
        mineGenerator.generate(this.board, mineCount);

        const mineCounter = new MineCounter();
        mineCounter.calculate(this.board)
    }

    public isGameOver: boolean = false;
    public isWon: boolean = false;

    private checkWin(): void {
        const unrevealedSafeCells = this.board.cells.some(
            cell => !cell.hasMine && !cell.revealed
        );

        if (!unrevealedSafeCells) {
            this.isWon = true;
            this.isGameOver = true;
        }
    }

    public reveal(cellId: number) {
        const cell = this.board.cells[cellId];

        if (!cell) {
            throw new Error("Can't found");
        }

        if (this.isGameOver) {
            return;
        }

        if (cell.revealed) {
            return;
        }

        if (cell.flagged) {
            return;
        }

        cell.revealed = true;

        if (cell.hasMine) {
            this.isGameOver = true;
        }

        if (cell.adjacentMines === 0) {
            this.revealEmptyArea(cellId)
        }

        if (cell.adjacentMines === 0) {
            this.revealEmptyArea(cellId);
        }

        this.checkWin();
    }

    public toggleFlag(cellId: number) {
        const cell = this.board.cells[cellId];

        if (!cell) {
            throw new Error("Cell not found");
        }

        if (this.isGameOver) {
            return;
        }

        if (cell.revealed) {
            return;
        }

        cell.flagged = !cell.flagged;
    }

    private revealEmptyArea(cellId: number) {
        const queue: number[] = [cellId];
        const visited = new Set<number>();

        while (queue.length > 0) {
            const currentId = queue.shift();

            if (currentId === undefined || visited.has(currentId)) {
                continue;
            }

            visited.add(currentId);

            const cell = this.board.cells[currentId];

            if (!cell || cell.hasMine || cell.flagged) {
                continue;
            }

            cell.revealed = true;

            if (cell.adjacentMines > 0) {
                continue;
            }

            const row = Math.floor(currentId / this.board.width);
            const column = currentId % this.board.width;

            for (let rowOffset = -1; rowOffset <= 1; rowOffset ++) {
                for (let columnOffset = -1; columnOffset <= 1; columnOffset ++) {
                    if (rowOffset === 0 && columnOffset === 0) {
                        continue;
                    }

                    const neighborRow = row + rowOffset;
                    const neighborColumn = column + columnOffset;

                    if (
                        neighborRow < 0 ||
                        neighborRow >= this.board.height ||
                        neighborColumn < 0 ||
                        neighborColumn >= this.board.width
                    ) {
                        continue;
                    }

                    const neighborId = neighborRow * this.board.width + neighborColumn;

                    if (!visited.has(neighborId)) {
                        queue.push(neighborId);
                    }
                }
            }
        }
    }
}

