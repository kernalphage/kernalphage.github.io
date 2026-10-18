// You gotta do what you gotta do

import { Sprite } from "three";
import { InputManager } from "./InputManager";
import { Layout } from "./lib/kpHex";
import Vic from "./lib/vic";
import { Spritesheet } from "./Spritesheet";
import type { Camera } from "./Camera";
import { LazyLoaded } from "./lib/LazyLoaded";
import VoxelWorld from "./World";
import { Game } from "./Game";

class GlobalsImpl {
    layout = new Layout(Layout.flat);
    cellSize = 32;
    InputManager = new InputManager();

    camera = {
        accell: 0.001,
        speed: .4,
        friction: 0.9,
        // 0 = pan speed ignores zoom, 1 = pan speed scales fully with zoom level
        zoomDamping: 0.8,
    };

    // Set once, by Game, on startup.
    @LazyLoaded() accessor Spritesheet!: Spritesheet;
    @LazyLoaded() accessor activeCamera!: Camera;
    @LazyLoaded() accessor world!: VoxelWorld
    @LazyLoaded() accessor game!: Game;
}

export const Globals = new GlobalsImpl();
