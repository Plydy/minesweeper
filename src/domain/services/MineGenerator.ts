import { Board } from "@/domain/entities/Board.ts";

export class MineGenerator {
    public generate(board: Board, mineCount: number) {
        const availableCells = [...board.cells];

        for (let i = 0; i < mineCount; i++) {
            if (availableCells.length === 0) {
                throw new Error('No available cells');
            }

            const randomIndex = Math.floor(Math.random() * availableCells.length);

            const cell = availableCells[randomIndex];

            if (cell === undefined) {
                throw new Error('Unable to select a cell for mine');
            }

            cell.hasMine = true;

            availableCells.splice(randomIndex, 1);
        }
    }
}