import { Game } from "./Game";
import { Globals } from "./Globals";



function main() {
    Globals.InputManager.init();
    const game = new Game();
    game.resizeCanvas();
}

window.addEventListener('load', main);
