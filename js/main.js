import { Game } from './game.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('gameContainer');
    const game = new Game(container);
    game.init();
    game.animate();
});
