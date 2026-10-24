export enum Difficulty {
    Easy = "easy",
    Medium = "medium",
    Hard = "hard",
}

export const DIFFICULTY_SETTINGS = {
    [Difficulty.Easy]: {width: 9, height: 9, mineCount: 10},
    [Difficulty.Medium]: {width: 16, height: 16, mineCount: 40},
    [Difficulty.Hard]: {width: 30, height: 16, mineCount: 99},
} as const;