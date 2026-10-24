import { Board } from "@/domain/entities/Board.ts";
import { MineCounter } from "@/domain/services/MineCounter.ts";
import { MineGenerator} from "@/domain/services/MineGenerator.ts";
import { Difficulty, DIFFICULTY_SETTINGS} from "@/domain/value-objects/Difficulty.ts";

export type GameSnapshot = {
    difficulty: Difficulty;
    isGameOver: boolean;
    isWon: boolean;
    cells: Array<{
        id: number;
        hasMine: boolean;
        revealed: boolean;
        flagged: boolean;
    }>;
};

function isGameSnapshot(value: unknown): value is GameSnapshot {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    const snapshot = value as Record<string, unknown>;

    return (
        Object.values(Difficulty).includes(snapshot.difficulty as Difficulty) &&
        typeof snapshot.isGameOver === "boolean" &&
        typeof snapshot.isWon === "boolean" &&
        Array.isArray(snapshot.cells) &&
        snapshot.cells.every(cell => {
            if (typeof cell !== "object" || cell === null) {
                return false;
            }

            const savedCell = cell as Record<string, unknown>;

            return (
                Number.isInteger(savedCell.id) &&
                typeof savedCell.hasMine === "boolean" &&
                typeof savedCell.revealed === "boolean" &&
                typeof savedCell.flagged === "boolean"
            );
        })
    );
}

export class Game {
    public readonly board: Board;
    public readonly difficulty: Difficulty;

    constructor(difficulty: Difficulty, snapshot?: GameSnapshot) {
        this.difficulty = difficulty;

        const settings = DIFFICULTY_SETTINGS[difficulty];
        this.board = new Board(settings.width, settings.height);

        if (snapshot) {
            const restoredCellIds = new Set<number>();
            if (
                snapshot.difficulty !== difficulty ||
                snapshot.cells.length !== this.board.cells.length
            ) {
                throw new Error("Invalid game snapshot");
            }

            for (const savedCell of snapshot.cells) {
                const cell = this.board.cells[savedCell.id];

                if (!cell || restoredCellIds.has(savedCell.id)) {
                    throw new Error("Snapshot contains an invalid or duplicate cell id");
                }

                restoredCellIds.add(savedCell.id);

                cell.hasMine = savedCell.hasMine;
                cell.revealed = savedCell.revealed;
                cell.flagged = savedCell.flagged;
            }

            const restoredMineCount = snapshot.cells.filter(cell => cell.hasMine).length;

            if (restoredMineCount !== settings.mineCount) {
                throw new Error("Snapshot has an invalid mine count");
            }

            this.isGameOver = snapshot.isGameOver;
            this.isWon = snapshot.isWon;

            const hasRevealedMine = this.board.cells.some(
                cell => cell.hasMine && cell.revealed
            );
            const allSafeCellsRevealed = this.board.cells.every(
                cell => cell.hasMine || cell.revealed
            );

            if (
                snapshot.isWon !== allSafeCellsRevealed ||
                snapshot.isGameOver !== (hasRevealedMine || allSafeCellsRevealed)
            ) {
                throw new Error("Snapshot has an inconsistent game state");
            }

        } else {
            const mineGenerator = new MineGenerator();
            mineGenerator.generate(this.board, settings.mineCount);
        }

        const mineCounter = new MineCounter();
        mineCounter.calculate(this.board);
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
            return;
        }

        if (cell.adjacentMines === 0) {
            this.revealEmptyArea(cellId)
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

    public static deserialize(serialized: string): Game {
        const parsed: unknown = JSON.parse(serialized);

        if (!isGameSnapshot(parsed)) {
            throw new Error("Invalid game snapshot");
        }

        return new Game(parsed.difficulty, parsed);
    }

    public toSnapshot(): GameSnapshot {
        return {
            difficulty: this.difficulty,
            isGameOver: this.isGameOver,
            isWon: this.isWon,
            cells: this.board.cells.map(cell => ({
                id: cell.id,
                hasMine: cell.hasMine,
                revealed: cell.revealed,
                flagged: cell.flagged,
            })),
        };
    }

    public serialize(): string {
        return JSON.stringify(this.toSnapshot());
    }
}

