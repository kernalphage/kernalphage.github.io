import * as THREE from 'three'
import { Hex, Layout } from './lib/kpHex';
import Vic from './lib/vic';
import { Globals } from './Globals';
import { BufferMesh } from './BufferMesh';
import _ from 'lodash';
import kpFunctional from './lib/kpFunctional';
import { util } from 'zod';
export type Cell = number;
const { cellSize, Spritesheet } = Globals;

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

const HexFace: FaceData = {
    corners: [...pts, new Vic(0, 0, 0)].map((pos) => {
        return ({
            pos: new Vic(pos.x, pos.y, 0), uv: [(pos.x * .5 - .5) + 1, (pos.y * .5 - .5)]
        })
    })
}


function hexGeo( hexX: number, hexY: number) {

    const [positions, normals, uvs, indices]: number[][] = [[], [], [], []];

    // TODO: maybe this should be abstracted to a "HexMesh"
    const hexPos = Globals.layout.hexToPixel(new Hex(hexX, hexY));
    const cellPos = new Vic(hexPos.x, hexPos.y, 0);

    const { corners } = HexFace;
    for (const { pos, uv } of corners) {
        positions.push(pos.x + cellPos.x, pos.y + cellPos.y, pos.z + cellPos.z);
        normals.push(0, 0, 1);
        uvs.push(...uv);
    }
    indices.push(...hexCapIndices)

    return { positions, normals, uvs, indices };
}

export default class VoxelWorld {
    cells: Record<string, Uint8Array>;
    readonly cellIdToMesh: Record<string, BufferMesh> = {};

    constructor(
        readonly scene: THREE.Scene,
        readonly material: THREE.Material
    ) {
        this.cells = {};
    }


    updateCellGeometry(x: number, y: number) {

        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const cellId = this.computeCellId(x, y);
        const indexData = this.generateGeoForCell(cellX, cellY);

        let mesh = this.cellIdToMesh[cellId];

        if (!mesh) {
            mesh = new BufferMesh(cellId, indexData, this.material);
            this.scene.add(mesh.mesh);
        } else {
            mesh.regenerate(indexData);
        }

        this.cellIdToMesh[cellId] = mesh;
        mesh.mesh.position.set(cellX * cellSize, cellY * cellSize);
    }


    computeCellId(x: number, y: number) {
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        return `${cellX},${cellY}`
    }

    computeVoxelOffset(x: number, y: number) {
        const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
        return voxelY * cellSize + voxelX;
    }

    generateGeoForCell(x: number, y: number) {
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
                    const ndx = positions.length / 3;
                    
                    const voxelMesh = hexGeo(x, y);
                    positions.push(...voxelMesh.positions);
                    normals.push(...voxelMesh.normals);                    
                    uvs.push(...kpFunctional.eachCons(voxelMesh.uvs, 2, 2).flatMap((uv) => 
                        Spritesheet.uvs(voxel-1, uv)
                    ));
                    indices.push(...voxelMesh.indices.map((i) => i + ndx))
                }
            }
        }
        let out = {
            positions,
            normals,
            indices,
            uvs
        };
        return out;
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

    updateVoxelGeometry(x: number, y: number, z: number) {
        const updatedCellIds: Record<string, boolean> = {};
        for (const offset of neighborOffsets) {
            const ox = x + offset[0];
            const oy = y + offset[1];
            const cellId = this.computeCellId(ox, oy);
            if (!updatedCellIds[cellId]) {
                updatedCellIds[cellId] = true;
                this.updateCellGeometry(ox, oy);

            }
        }
    }
}


type CellCornerData = { pos: Vic, uv: [number, number] }
type FaceData = {
    corners: CellCornerData[],
}

const neighborOffsets = [
    [0, 0, 0], // self
    [-1, 0, 0], // left
    [1, 0, 0], // right
    [0, -1, 0], // down
    [0, 1, 0], // up
    [0, 0, -1], // back
    [0, 0, 1], // front
];