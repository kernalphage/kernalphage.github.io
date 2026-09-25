

import * as THREE from 'three';
import VoxelWorld from './World';
import { Globals } from './Globals';
import { randInt } from 'three/src/math/MathUtils.js';
import { Camera } from './Camera';
import { SaveGame } from './SaveGame';
import { Spritesheet } from './Spritesheet';
import { Pointer } from './Pointer';
const { cellSize } = Globals;

export class Game {

    readonly canvas: HTMLCanvasElement;
    readonly log_elem: HTMLElement;
    readonly scene: THREE.Scene;
    readonly renderer: THREE.WebGLRenderer;
    readonly camera: Camera;
    private pointer:Pointer;
    private world!: VoxelWorld

    readonly save = new SaveGame();

    private curTick = 0;

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
        Globals.activeCamera = this.camera;

        this.pointer = new Pointer();


        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AmbientLight());
        this.scene.add(this.pointer.ptr.mesh);
        
        this.gizmo();
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        Globals.Spritesheet = new Spritesheet(16, () => {
            this.world = new VoxelWorld(this.scene, Globals.Spritesheet.material);
            this.renderCells();
            this.world.updateCellGeometry(0, 0);
        
            requestAnimationFrame(this.render.bind(this))
        });


        const components = [this.canvas, this.log_elem]
        this.log(components.every((e) => !!e) ? "All elements loaded" : components)

        this.log(this.save.state);
        this.save.save()
    }

    renderCells() {
        let N = 8;
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

        this.render(0);
    }

    render(time:number) {
        let dt = time - this.curTick;
        this.curTick = time;
        
        const rect = this.canvas.getBoundingClientRect();
        this.camera.update(dt, rect);
        this.pointer.update(dt);

        this.renderer.render(this.scene, this.camera.camera);
        requestAnimationFrame(this.render.bind(this))
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

