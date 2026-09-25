// You gotta do what you gotta do 

import { Sprite } from "three";
import { InputManager } from "./InputManager";
import { Layout } from "./lib/kpHex";
import Vic from "./lib/vic";
import { Spritesheet } from "./Spritesheet";

export const Globals = {
    layout: new Layout(Layout.pointy),
    cellSize: 16,
    InputManager: new InputManager(),
    Spritesheet: new Spritesheet(16, 246, 64),
}