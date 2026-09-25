// You gotta do what you gotta do

import { Sprite } from "three";
import { InputManager } from "./InputManager";
import { Layout } from "./lib/kpHex";
import Vic from "./lib/vic";
import { Spritesheet } from "./Spritesheet";
import type { Camera } from "./Camera";
import { LazyLoaded } from "./lib/LazyLoaded";

class GlobalsImpl {
    layout = new Layout(Layout.pointy);
    cellSize = 16;
    InputManager = new InputManager();

    camera = {
        accell: 0.001,
        speed: .4,
        friction: 0.9,
    };

    // Set once, by Game, on startup.
    @LazyLoaded() accessor Spritesheet!: Spritesheet;
    @LazyLoaded() accessor activeCamera!: Camera;
}

export const Globals = new GlobalsImpl();
