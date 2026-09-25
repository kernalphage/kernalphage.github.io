import * as THREE from 'three';
import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';


export type BufferMeshIndexData  = {
    positions: number[],
    normals: number[],
    uvs: number[], 

    indices: number[],
}

// The standard mesh type
export class BufferMesh {

    readonly geometry; 
    readonly mesh;
    constructor (name:string, indexData: BufferMeshIndexData, readonly material:THREE.Material) {
        this.geometry = new THREE.BufferGeometry();
        this.regenerate(indexData)
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.name = name;
    }

    regenerate(indexData: BufferMeshIndexData) {
        const { positions, normals, uvs, indices } = indexData;
        const positionNumComponents = 3;
        const normalNumComponents = 3;
        const uvNumComponents = 2;

        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        this.geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
        this.geometry.setIndex(indices);
        
        this.geometry.computeBoundingSphere();
    }
}