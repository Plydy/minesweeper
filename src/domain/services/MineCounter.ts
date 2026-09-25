import { Board } from "@/domain/entities/Board.ts";

export class MineCounter {
    public calculate(board: Board): void {
        for (const cell of board.cells) {
            const row = Math.floor(cell.id / board.width);
            const column = cell.id % board.width;

            let mineCount = 0;

            for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
                for (let columnOffset = -1; columnOffset <= 1; columnOffset++) {

                    if (rowOffset === 0 && columnOffset === 0) {
                        continue;
                    }

                    const neighborRow = row + rowOffset;
                    const neighborColumn = column + columnOffset;

                    if(
                        neighborRow < 0 ||
                        neighborRow >= board.height ||
                        neighborColumn < 0 ||
                        neighborColumn >= board.width
                    ) {
                        continue;
                    }

                    const neighborId = neighborRow * board.width + neighborColumn;

                    const neighbor = board.cells[neighborId];

                    if (neighbor?.hasMine) {
                        mineCount++;
                    }
                }
            }
            cell.adjacentMines = mineCount;
        }
    }
}
