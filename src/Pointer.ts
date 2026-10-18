import { Mesh } from "three";
import { BufferMesh } from "./BufferMesh";
import { hexGeo } from "./HexGeo";
import { MeshBasicMaterial } from 'three';
import { Globals } from "./Globals";
import { Hex } from "./lib/kpHex";
import { SpriteConstants } from "./Spritesheet";
import { Miner } from "./Buildings/Miner";
const { InputManager } = Globals;

export const C_placeable = 0x00ffff
export const C_blocked = 0xff0000

export class Pointer {
    ptr: BufferMesh;
    mesh: Mesh;
    material: MeshBasicMaterial;

    prevCell: Hex;

    constructor() {
        this.material = new MeshBasicMaterial({ color: C_placeable, wireframe: true });
        this.ptr = new BufferMesh("pointer", hexGeo(0, 0), this.material);
        this.prevCell = new Hex(0, 0);
        this.mesh = this.ptr.mesh;
    }

    update(dt: number) {
        const hexPos = Globals.layout.pixelToHex(Globals.activeCamera.pixelToWorld(InputManager.mousePos));
        const placeable = this.placeable(hexPos);
        // Update reticle
        if (!this.prevCell.equals(hexPos)) {
            this.prevCell = hexPos;
            const worldPos = Globals.layout.hexToPixel(hexPos);
            this.ptr.mesh.position.set(worldPos.x, worldPos.y, 2);
            this.material.color.set(placeable ? C_placeable : C_blocked);
        }

        if (Globals.InputManager.isKeyPressed(0) && placeable) {
            const m = new Miner(this.prevCell);
            Globals.game.registerEntity(m);
        }
    }

    placeable(p: Hex) {
        if (Globals.world.getVoxel(p.q, p.r) === SpriteConstants.Water)
            return false;

        // if buildings.at
        return true;
    }
}
