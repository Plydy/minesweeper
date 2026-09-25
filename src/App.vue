<script setup lang="ts">
import { Game } from "@/domain/entities/Game.ts";

const game = new Game(3, 3, 0);

for (const cell of game.board.cells) {
  game.reveal(cell.id);
}

console.log("Won:", game.isWon);
console.log("Game over:", game.isGameOver);
</script>

<template>
  <h1>Minesweeper test</h1>
</template>