import { Cell } from "@/domain/entities/Cell.ts";

export class Board {
    public readonly width: number;
    public readonly height: number;
    public readonly cells: Cell[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = [];

        this.createCells();
    }

    private createCells() {
        const totalCells = this.width * this.height;

        for (let i = 0; i < totalCells; i++) {
            this.cells.push(new Cell(i))
        }
    }
}