import { Globals } from "./Globals";
import { Hex } from "./lib/kpHex";
import Vic from "./lib/vic";


type CellCornerData = { pos: Vic, uv: [number, number] }
type FaceData = {
    corners: CellCornerData[],
}

export const neighborOffsets = [
    [0, 0, 0], // self
    [-1, 0, 0], // left
    [1, 0, 0], // right
    [0, -1, 0], // down
    [0, 1, 0], // up
    [0, 0, -1], // back
    [0, 0, 1], // front
];

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


export function hexGeo( hexX: number, hexY: number) {

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