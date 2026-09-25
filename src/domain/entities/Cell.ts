export class Cell {
    public readonly id: number;
    public hasMine: boolean;
    public adjacentMines: number;
    public revealed: boolean;
    public flagged: boolean;

    constructor(id: number) {
        this.id = id;
        this.hasMine = false;
        this.adjacentMines = 0;
        this.revealed = false;
        this.flagged = false;
    }
}