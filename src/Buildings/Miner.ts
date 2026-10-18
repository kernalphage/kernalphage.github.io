import { Mesh } from "three";
import { BufferMesh } from "../BufferMesh";
import { Globals } from "../Globals";
import { hexGeo } from "../HexGeo";
import { Hex } from "../lib/kpHex";
import { Entity } from "../lib/Entity";

export class Miner implements Entity {
    _mesh: BufferMesh;
    mesh: Mesh;


    constructor(readonly pos: Hex) {
        this._mesh = new BufferMesh("Miner", hexGeo(0, 0, 4), Globals.Spritesheet.material)
        const worldPos = Globals.layout.hexToPixel(this.pos);
        this._mesh.mesh.position.set(worldPos.x, worldPos.y, 2);
        this.mesh = this._mesh.mesh;
    }

    update(dt: number) {

    }
}