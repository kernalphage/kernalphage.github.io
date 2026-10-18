import { DoubleSide, LinearSRGBColorSpace, Material, MeshBasicMaterial, NearestFilter, TextureLoader } from 'three';
import { SpritesheetLayout, SpriteSourceSizeClass } from './SpritesheetLayout';

export enum SpriteConstants {
    Earth = 1,
    Grass,
    Water,
    Miner,
    Tree,

    Conveyor = 8,
}

export class Spritesheet {
    readonly material!: Material;
    private tileTextureWidth!: number;
    private tileTextureHeight!: number
    private layout!: SpritesheetLayout

    constructor(
        readonly tileSize: number,
        readonly spriteSheet: string,
        onReady: () => void
    ) {
        fetch(`resources/${this.spriteSheet}.json`)
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load ${res.url}: ${res.status}`);
                return res.json() as Promise<SpritesheetLayout>;
            })
            .then((layout) => {
                this.layout = layout;
                this.loadTexture(onReady);
            });
    }

    private loadTexture(onReady: () => void) {
        const loader = new TextureLoader();

        loader.load(`resources/${this.layout.meta.image}`, (texture) => {
            this.tileTextureWidth = texture.width;
            this.tileTextureHeight = texture.height;

            texture.magFilter = NearestFilter;
            texture.minFilter = NearestFilter;
            texture.colorSpace = LinearSRGBColorSpace;

            (this as any).material = new MeshBasicMaterial({
                map: texture,
                side: DoubleSide,
                alphaTest: 0.1,
                transparent: false
            });

            onReady();
        });
    }

    sheetToUVSpace(size: SpriteSourceSizeClass): SpriteSourceSizeClass {
        return {
            w: size.w / this.tileTextureWidth,
            h: size.h / this.tileTextureHeight,
            x: size.x / this.tileTextureWidth,
            // JSON y is top-down; three.js flips textures (flipY), so v=0 is the bottom
            y: 1 - ((size.y + size.h) / this.tileTextureHeight),
        }
    }
    uvs(idx: number, uv: number[]) {
        // TODO: Cache
        const frame = this.layout.frames[this.spriteSheet + " " + idx];
        const space = this.sheetToUVSpace(frame.frame)
        return [
            ((uv[0]) * space.w) + space.x,
            ((uv[1]) * space.h) + space.y
        ]
    }
}