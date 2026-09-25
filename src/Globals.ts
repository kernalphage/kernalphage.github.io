// You gotta do what you gotta do 

import { InputManager } from "./InputManager";
import { Layout } from "./lib/kpHex";
import Vic from "./lib/vic";

export const Globals = {
    layout: new Layout(Layout.pointy),
    cellSize: 16,
    InputManager: new InputManager(),
}