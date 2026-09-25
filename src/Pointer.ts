import { Mesh } from "three";
import { BufferMesh } from "./BufferMesh";
import { hexGeo } from "./HexGeo";
import * as THREE from 'three';
import { Globals } from "./Globals";
const {InputManager} = Globals;

export class Pointer {
    ptr: BufferMesh;
    constructor() {
        this.ptr = new BufferMesh("pointer", hexGeo(0, 0), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
    }

    update(dt:number) {
        const hexPos = Globals.layout.pixelToHex(Globals.activeCamera.pixelToWorld(InputManager.mousePos));
        const worldPos = Globals.layout.hexToPixel(hexPos);
        this.ptr.mesh.position.set(worldPos.x, worldPos.y, 2);
    }

}
