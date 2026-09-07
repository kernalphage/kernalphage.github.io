

import * as THREE from 'three';
import VoxelWorld from './World';
import { Globals } from './Globals';
import { randInt } from 'three/src/math/MathUtils.js';
import { Camera } from './Camera';
import { SaveGame } from './SaveGame';
const { cellSize } = Globals;

export class Game {

    readonly canvas: HTMLCanvasElement;
    readonly log_elem: HTMLElement;
    readonly scene: THREE.Scene;
    readonly renderer: THREE.WebGLRenderer;
    readonly camera: Camera;
    readonly material: THREE.Material;
    readonly world = new VoxelWorld(Globals.cellSize, 16, 256, 64);
    readonly cellIdToMesh: Record<string, THREE.Mesh> = {};

    readonly save = new SaveGame();

    constructor() {

        // Set up DOM
        this.canvas = document.getElementById('main_game')! as HTMLCanvasElement;
        this.log_elem = document.getElementById('log')!;

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setClearColor(new THREE.Color(.26, .35, .88));
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.setAnimationLoop(animate);

        this.camera = new Camera(20);

        // const fLoader = new FontLoader();
        // font = await fLoader.loadAsync("resources/optimer_regular.typeface.json")


        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight());

        const loader = new THREE.TextureLoader();
        const texture = loader.load('resources/flourish-cc-by-nc-sa.png', () => requestAnimationFrame(this.render.bind(this)));
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.colorSpace = THREE.LinearSRGBColorSpace;
        this.material = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide, alphaTest: 0.1, transparent: false });

        this.gizmo();
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        this.renderCells();
        this.updateCellGeometry(0, 0);

        const components = [this.canvas, this.log_elem]
        this.log(components.every((e) => !!e) ? "All elements loaded" : components)

        this.log(this.save.state);
        this.save.save()
    }

    renderCells() {
        let N = 4;
        for (let q = -N; q <= N; q++) {
            const r1 = Math.max(-N, -q - N);
            const r2 = Math.min(N, -q + N);
            for (let r = r1; r <= r2; r++) {
                let color = randInt(1, 5);
                this.world.setVoxel(q + 4, r + 4, color);
            }
        }
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height, false);

        this.render();
    }

    render() {
        const rect = this.canvas.getBoundingClientRect();
        this.camera.resizeCanvas(rect);
        this.updateCellGeometry(0, 0);

        this.renderer.render(this.scene, this.camera.camera);
    }

    updateVoxelGeometry(x: number, y: number, z: number) {
        const updatedCellIds: Record<string, boolean> = {};
        for (const offset of neighborOffsets) {
            const ox = x + offset[0];
            const oy = y + offset[1];
            const cellId = this.world.computeCellId(ox, oy);
            if (!updatedCellIds[cellId]) {
                updatedCellIds[cellId] = true;
                this.updateCellGeometry(ox, oy);

            }
        }
    }

    updateCellGeometry(x: number, y: number) {

        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        const cellId = this.world.computeCellId(x, y);
        let mesh = this.cellIdToMesh[cellId];

        const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();
        const { positions, normals, uvs, indices } = this.world.generateGeoForCell(cellX, cellY);
        const positionNumComponents = 3;
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
        const normalNumComponents = 3;
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
        const uvNumComponents = 2;
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();

        if (!mesh) {
            mesh = new THREE.Mesh(geometry, this.material);
            mesh.name = cellId;
            this.cellIdToMesh[cellId] = mesh;
            this.scene.add(mesh);
            mesh.position.set(cellX * cellSize, cellY * cellSize);
        }
    }
    gizmo() {
        const ex = new THREE.ArrowHelper(new THREE.Vector3(2, 0, 0), new THREE.Vector3(0, 0, 0), 3, "#ff0000")
        const wy = new THREE.ArrowHelper(new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0, 0), 3, "#00ff00")
        const ze = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 2), new THREE.Vector3(0, 0, 0), 3, "#0000ff")

        this.scene.add(ex, wy, ze);
    }

    log(message: string | Object) {
        if (typeof message !== "string") {
            this.log(JSON.stringify(message, null, 2));
        } else {
            const logline = document.createElement("pre");
            logline.innerText = `[${this.log_elem.childNodes.length}] ${message}`;
            this.log_elem.appendChild(logline);
        }
    }
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