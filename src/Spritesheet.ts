export class Spritesheet {
    constructor(readonly tileSize: number,
        readonly tileTextureWidth: number,
        readonly tileTextureHeight: number) {

    }
    uvs(idx: number, uv: number[]) {
        return [
            (idx + uv[0]) * this.tileSize / this.tileTextureWidth,
            1 - (1 + uv[1]) * this.tileSize / this.tileTextureHeight
        ]
    }
}