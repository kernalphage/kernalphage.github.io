import * as THREE from 'three'
import { Hex, Layout } from './lib/kpHex';
import Vic from './lib/vic';
import { Globals } from './Globals';
export type Cell = number;


export type RayVoxelIntersection = {
    position: number[],
    normal: number[],
    voxel: number,
}


const pts = Globals.layout.polygonCorners(new Hex(0, 0, 0));
const hexCapIndices = [
	0, 1, 6,
	1, 2, 6,
	2, 3, 6,
	3, 4, 6,
	4, 5, 6,
	5, 0, 6,
]

// The hex cap - the only shape used in the 2D (y-up) hex grid, facing the camera along +z
const HexFace: FaceData = {
    uvRow: 1,
    corners: [...pts, new Vic(0, 0, 0)].map((pos) => {
        return ({
            pos: new Vic(pos.x, pos.y, 0), uv: [(pos.x*.5 - .5) + 1, (pos.y * .5 - .5)]
        })
    })
}

export default class VoxelWorld {
    cells: Record<string, Uint8Array>;

    constructor(
        readonly cellSize: number,
        readonly tileSize: number,
        readonly tileTextureWidth: number,
        readonly tileTextureHeight: number,
    ) {
        this.cells = {};
    }

    computeCellId(x: number, y: number) {
        const { cellSize } = this;
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        return `${cellX},${cellY}`
    }


    computeVoxelOffset(x: number, y: number) {
        const { cellSize } = this;
        const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
        return voxelY * cellSize + voxelX;
    }

    generateGeoForCell(x: number, y: number) {
        const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;

        const startX = x * cellSize;
        const startY = y * cellSize;

        const positions: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];

        // x, y are the hex grid axes (in-plane, y-up).
        for (let y = 0; y < cellSize; ++y) {
            const voxelY = startY + y;
            for (let x = 0; x < cellSize; ++x) {
                const voxelX = startX + x;
                const voxel = this.getVoxel(voxelX, voxelY);
                if (voxel) {
                    const uvVoxel = voxel - 1;  // voxel 0 is sky so for UVs we start at 0
                    const hexPos = Globals.layout.hexToPixel(new Hex(x, y));
                    const cellPos = new Vic(hexPos.x, hexPos.y, 0);

                    const { corners, uvRow } = HexFace;
                    const ndx = positions.length / 3;
                    for (const { pos, uv } of corners) {
                        positions.push(pos.x + cellPos.x, pos.y + cellPos.y, pos.z + cellPos.z);
                        normals.push(0, 0, 1);
                        uvs.push(
                            (uvVoxel + uv[0]) * tileSize / tileTextureWidth,
                            1 - (uvRow + uv[1]) * tileSize / tileTextureHeight);
                    }
                    indices.push(... hexCapIndices.map((i) => i + ndx))
                }
            }
        }
        return {
            positions,
            normals,
            indices,
            uvs
        };
    }

    getCellForVoxel(x: number, y: number): Uint8Array {
        return this.cells[this.computeCellId(x, y)];
    }

    getVoxel(x: number, y: number): Cell {
        let cell = this.getCellForVoxel(x, y);
        if (!cell) {
            cell = this.addCellForVoxel(x, y);
        }
        const voxelOffset = this.computeVoxelOffset(x, y);
        return cell[voxelOffset];
    }

    addCellForVoxel(x: number, y: number) {
        const cellId = this.computeCellId(x, y);
        let cell = this.cells[cellId];
        if (!cell) {
            const { cellSize } = this;
            cell = new Uint8Array(cellSize * cellSize);
            this.cells[cellId] = cell;
        }
        return cell;
    }

    setVoxel(x: number, y: number, v: number) {
        let cell = this.getCellForVoxel(x, y);
        if (!cell) {
            cell = this.addCellForVoxel(x, y);
        }

        const voxelOffset = this.computeVoxelOffset(x, y);
        cell[voxelOffset] = v;

    }
}


type CellCornerData = { pos: Vic, uv: [number, number] }
type FaceData = {
    uvRow: number,
    corners: CellCornerData[],
}
