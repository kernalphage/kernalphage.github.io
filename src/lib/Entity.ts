import { ThreeMFLoader } from "three/examples/jsm/Addons.js";
import Vic from "./vic";
import { Mesh } from "three";

export interface Entity {
    update(dt: number): void;
    mesh?: Mesh;
}

export interface Building extends Entity {
    readonly position: Vic;
}