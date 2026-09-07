import * as THREE from 'three'
import { Hex, Layout, ThreeHex } from './kpHex';
import Vic from './vic';
import { dir } from 'console';
import { Globals } from './globals';
export type Cell = number;


export type RayVoxelIntersection = {
    position: number[],
    normal: number[],
    voxel: number,
}


const origin = new Hex(0, 0, 0);

const pts = Globals.layout.polygonCorners(new Hex(0, 0, 0));
const hexCapIndices = [
	0, 1, 6,
	1, 2, 6,
	2, 3, 6,
	3, 4, 6,
	4, 5, 6,
	5, 0, 6,
]

const HexFaces: FaceData[] = [
    // Faces: East, SE ..... NE, clockwise 
    ...(new Array(6).fill(0).map((_, i) => ({
        uvRow: 0,
        dir: [origin.neighbors()[i].q, 0, origin.neighbors()[i].r],
        corners: hexFace(pts[i], pts[(i + 1) % 6])
    }))), 
    { 
        // bottom
        uvRow: 1,
        dir: [0,-1,0],
        corners: [...pts, new Vic(0,0,0)].map((pos) => {
            return ({
                pos, uv: [(pos.x*.5 - .5) + 1, (pos.z * .5 - .5)]
            })
        })
    },
        { 
        // top
        uvRow: 1,
        dir: [0,1,0],
        corners: [...pts, new Vic(0,1,0)].map((pos) => {
            return ({
                pos: new Vic(pos.x, 1, pos.z), uv: [(pos.x*.5 - .5) + 1, (pos.z * .5 - .5)]
            })
        })
    }
]

console.log(JSON.stringify(HexFaces, null, 2));

export default class VoxelWorld {
    cells: Record<string, Uint8Array>;
    cellSliceSize: number;

    constructor(
        readonly cellSize: number,
        readonly tileSize: number,
        readonly tileTextureWidth: number,
        readonly tileTextureHeight: number,
    ) {
        this.cellSliceSize = cellSize * cellSize;
        this.cells = {};
    }

    computeCellId(x: number, y: number, z: number) {
        const { cellSize } = this;
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const cellZ = Math.floor(z / cellSize);
        return `${cellX},${cellY},${cellZ}`
    }


    computeVoxelOffset(x: number, y: number, z: number) {
        const { cellSize, cellSliceSize } = this;
        const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
        const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
        return voxelY * cellSliceSize +
            voxelZ * cellSize +
            voxelX;
    }

    generateGeoForCell(x: number, y: number, z: number) {
        const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;

        const startX = x * cellSize;
        const startY = y * cellSize;
        const startZ = z * cellSize;

        const positions: number[] = [];
        const normals: number[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];

        for (let y = 0; y < cellSize; y++) {
            const voxelY = startY + y;
            for (let z = 0; z < cellSize; ++z) {
                const voxelZ = startZ + z;
                for (let x = 0; x < cellSize; ++x) {
                    const voxelX = startX + x;
                    const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
                    if (voxel) {
                        const uvVoxel = voxel - 1;  // voxel 0 is sky so for UVs we start at 0
                        const cellPos = Globals.layout.hexToPixel(new Hex(x,z))
                        cellPos.y = y;
                        
                        for (const { dir, corners, uvRow } of VoxelWorld.faces) {
                            const neighbor = this.getVoxel(
                                voxelX + dir[0],
                                voxelY + dir[1],
                                voxelZ + dir[2]);
                            if (!neighbor) {
                                // this voxel has no neighbor in this direction so we need a face
                                // here.
                                const ndx = positions.length / 3;
                                for (const { pos, uv } of corners) {
                                    //TODO: For the cap - check the neighbors and try raising / lowering them?
                                    positions.push(pos.x + cellPos.x, pos.y + cellPos.y, pos.z + cellPos.z);
                                    normals.push(dir[0], dir[1], dir[2]); // TODO: this is not normal
                                    uvs.push(
                                        (uvVoxel + uv[0]) * tileSize / tileTextureWidth,
                                        1 - (uvRow + uv[1]) * tileSize / tileTextureHeight);

                                }
                                if(corners.length === 4) {
                                    // the sides of the hexagon 
                                    indices.push(
                                        ndx, ndx + 1, ndx + 2,
                                        ndx + 2, ndx + 1, ndx + 3,
                                    );
                                } else {
                                    // the caps of the hexagon
                                    indices.push(... hexCapIndices.map((i) => i+ndx))
                                }

                            }
                        }
                    }
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

    getCellForVoxel(x: number, y: number, z: number): Uint8Array {
        return this.cells[this.computeCellId(x, y, z)];
    }

    getVoxel(x: number, y: number, z: number): Cell {
        let cell = this.getCellForVoxel(x, y, z);
        if (!cell) {
            cell = this.addCellForVoxel(x, y, z);
        }
        const voxelOffset = this.computeVoxelOffset(x, y, z);
        return cell[voxelOffset];
    }

    addCellForVoxel(x: number, y: number, z: number) {
        const cellId = this.computeCellId(x, y, z);
        let cell = this.cells[cellId];
        if (!cell) {
            const { cellSize } = this;
            cell = new Uint8Array(cellSize * cellSize * cellSize);
            this.cells[cellId] = cell;
        }
        return cell;
    }

    setVoxel(x: number, y: number, z: number, v) {
        let cell = this.getCellForVoxel(x, y, z);
        if (!cell) {
            cell = this.addCellForVoxel(x, y, z);
        }

        const voxelOffset = this.computeVoxelOffset(x, y, z);
        cell[voxelOffset] = v;

    }

    // from https://threejs.org/manual/#en/voxel-geometry 
    // wich references a defunct PDF 
    intersectRay(start: THREE.Vector3, end: THREE.Vector3) : ThreeHex | undefined {

        
        let startHex = new ThreeHex(start.z, start.y, start.z);
        let endHex = new ThreeHex(end.x, end.y, end.z);
        let rayHexes = startHex.linedraw(endHex);

        for(const cell of rayHexes) {
            if(cell.y < 0) {
                console.log("Went through the ground");
                break;
            }
            if(this.getVoxel(...cell.posArray()) > 0) {
                return cell;
            }
        }
        return undefined;
    }

    getShadow(t: ThreeHex, direction:number, maxDist: number) {
        let neighbor = t.neighbor(direction);
        for(let i=0; i < maxDist; i++) {
            neighbor.y++
            if(this.getVoxel(neighbor.hex.q, neighbor.y, neighbor.hex.r)) {
                return true;
            }
            neighbor = neighbor.neighbor(direction);
        }
        return false;
    }
    static faces = HexFaces;
}


type CellCornerData = { pos: Vic, uv: [number, number] }
type FaceData = {
    uvRow: number,
    dir: number[],  // redundant?
    corners: CellCornerData[],
}

function hexFace(a: Vic, b: Vic): { pos: Vic, uv: [number, number] }[] {
    return [
        { pos: a, uv: [0, 1], },
        { pos: b, uv: [0, 0], },
        { pos: a.add(new Vic(0,1,0)), uv: [1, 1], },
        { pos: b.add(new Vic(0,1,0)), uv: [1, 0], },
    ]
}


