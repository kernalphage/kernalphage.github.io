

import { AmbientLight, ArrowHelper, Color, MathUtils, Scene, Vector3, WebGLRenderer } from 'three';
import VoxelWorld from './World';
import { Globals } from './Globals';
import { Camera } from './Camera';
import { SaveGame } from './saveState/SaveGame';
import { Spritesheet } from './Spritesheet';
import { Pointer } from './Pointer';
import KPMath from './lib/kpMath';
import Vic from './lib/vic';
import { Entity } from './lib/Entity';
import _ from 'lodash';
import { v4 } from 'uuid';
const { cellSize } = Globals;

export class Game {

    readonly canvas: HTMLCanvasElement;
    readonly log_elem: HTMLElement;
    readonly scene: Scene;
    readonly renderer: WebGLRenderer;
    readonly camera: Camera;
    private pointer: Pointer;
    readonly entities: Record<string, Entity> = {}

    readonly save = new SaveGame();

    private curTick = 0;

    constructor() {

        // Set up DOM
        this.canvas = document.getElementById('main_game')! as HTMLCanvasElement;
        this.log_elem = document.getElementById('log')!;

        // Setup renderer
        this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setClearColor(new Color(.26, .35, .88));
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.setAnimationLoop(animate);

        this.camera = new Camera(10, new Vic(cellSize, cellSize));
        Globals.activeCamera = this.camera;

        this.pointer = new Pointer();


        this.scene = new Scene();
        this.scene.add(new AmbientLight());

        this.gizmo();

        Globals.Spritesheet = new Spritesheet(512, 'Hexsprites', () => {
            Globals.game = this;
            Globals.world = new VoxelWorld(this.scene, Globals.Spritesheet.material);
            MathUtils.seededRandom(KPMath.seedToInt(this.save.state.seed, "WORLDGEN"))
            this.renderCells();
            Globals.world.updateCellGeometry(0, 0);

            this.resizeCanvas();
            window.addEventListener('resize', () => {
                this.resizeCanvas();
            });
            requestAnimationFrame(this.render.bind(this))
        });


        this.registerEntity(this.camera, "Camera");
        this.registerEntity(this.pointer, "Pointer");

        const components = [this.canvas, this.log_elem]
        this.log(components.every((e) => !!e) ? "All elements loaded" : components)

        this.log(this.save.state);
        this.save.save()
    }

    renderCells() {
        let N = cellSize;

        for (let x = 0; x < N; x++) {
            for (let y = 0; y < N; y++) {
                let color = 1 + Math.floor(MathUtils.seededRandom() * 3);
                Globals.world.setVoxel(x, y, color);
            }
        }
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.renderer.setSize(rect.width, rect.height, false);
        this.camera.resizeCanvas(rect);
    }

    render(time: number) {
        let dt = time - this.curTick;
        this.curTick = time;

        _.forEach(this.entities, (e) => {
            e.update(dt);
        })

        Globals.InputManager.update();

        const rect = this.canvas.getBoundingClientRect();
        this.camera.resizeCanvas(rect);
        this.renderer.render(this.scene, this.camera.camera);

        requestAnimationFrame(this.render.bind(this))
    }


    registerEntity(entity: Entity, key: string = v4()) {
        this.entities[key] = entity;
        if (entity.mesh) {
            this.scene.add(entity.mesh);
        }
    }

    gizmo() {
        const ex = new ArrowHelper(new Vector3(2, 0, 0), new Vector3(0, 0, 0), 3, "#ff0000")
        const wy = new ArrowHelper(new Vector3(0, 2, 0), new Vector3(0, 0, 0), 3, "#00ff00")
        const ze = new ArrowHelper(new Vector3(0, 0, 2), new Vector3(0, 0, 0), 3, "#0000ff")

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

