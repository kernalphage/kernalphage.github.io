import * as THREE from 'three';

export class Spritesheet {
    readonly material!: THREE.Material;
    private tileTextureWidth!: number;
    private tileTextureHeight!: number;

    constructor(
        readonly tileSize: number,
        onReady: () => void
    ) {
        const loader = new THREE.TextureLoader();
        loader.load('resources/flourish-cc-by-nc-sa.png', (texture) => {
            this.tileTextureWidth = texture.width;
            this.tileTextureHeight = texture.height;

            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.colorSpace = THREE.LinearSRGBColorSpace;

            (this as any).material = new THREE.MeshLambertMaterial({
                map: texture,
                side: THREE.DoubleSide,
                alphaTest: 0.1,
                transparent: false
            });

            onReady();
        });
    }

    uvs(idx: number, uv: number[]) {
        return [
            (idx + uv[0]) * this.tileSize / this.tileTextureWidth,
            1 - (1 + uv[1]) * this.tileSize / this.tileTextureHeight
        ]
    }
}