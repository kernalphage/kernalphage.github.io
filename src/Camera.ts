

import * as THREE from 'three';
import Vic from './lib/vic';
import { Globals} from './Globals';
import { KeyCode } from './InputManager';
const {InputManager, camera} = Globals;


// Top-down view of an x/y tile grid 
export class Camera {
    readonly camera;

    readonly pos:Vic = new Vic(7,5)
    readonly vel = new Vic();
    readonly cameraSpeed = 0;
    private rect: DOMRect = new DOMRect();

    private readonly minViewSize = 5;
    private readonly maxViewSize = 60;
    private readonly zoomSpeed = 0.02;

    constructor(private viewSize: number) {
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    }

    update(dt:number, rect: DOMRect) {
        let dirty = false;
        if(InputManager.isKeyDown(KeyCode.UP)) {
            this.vel.y += camera.accell * dt;
            dirty = true;
        }
        else if(InputManager.isKeyDown(KeyCode.DOWN)) {
            this.vel.y -= camera.accell * dt;
            dirty = true;
        }
        else if(InputManager.isKeyDown(KeyCode.LEFT)) {
            this.vel.x -= camera.accell * dt;
            dirty = true;
        }
        else if(InputManager.isKeyDown(KeyCode.RIGHT)) {
            this.vel.x += camera.accell * dt;
            dirty = true;
        }

        this.vel.x = Math.max(Math.min(this.vel.x, camera.speed), -camera.speed);
        this.vel.y = Math.max(Math.min(this.vel.y, camera.speed), -camera.speed);

        this.pos.addEquals(this.vel.mul(dt));
        this.vel.mulEquals(camera.friction);

        if (InputManager.mousePos.z !== 0) {
            this.viewSize += InputManager.mousePos.z * this.zoomSpeed;
            this.viewSize = Math.max(this.minViewSize, Math.min(this.maxViewSize, this.viewSize));
            InputManager.mousePos.z = 0;
        }

        this.resizeCanvas(rect);
    }


    resizeCanvas(rect: DOMRect) {
        this.rect = rect;

        // Redo projection
        const aspect = rect.width / rect.height;
        const halfSize = this.viewSize / 2;
        if (aspect >= 1) {
            this.camera.left = -halfSize * aspect;
            this.camera.right = halfSize * aspect;
            this.camera.top = halfSize;
            this.camera.bottom = -halfSize;
        } else {
            this.camera.left = -halfSize;
            this.camera.right = halfSize;
            this.camera.top = halfSize / aspect;
            this.camera.bottom = -halfSize / aspect;
        }

        const center = new THREE.Vector3(...this.pos.toArray());
        this.camera.position.set(center.x, center.y, center.z + 20);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(center);
        this.camera.updateProjectionMatrix();
    }

    // Converts a DOM pixel coordinate (e.g. e.clientX/Y relative to page)
    // into world space, using the canvas rect cached by resizeCanvas.
    pixelToWorld(pixel: Vic, out?: Vic): Vic {
        out = out ?? new Vic();
        const rect = this.rect;
        const ndcX = ((pixel.x - rect.left) / rect.width) * 2 - 1;
        const ndcY = -(((pixel.y - rect.top) / rect.height) * 2 - 1);

        out.x = this.camera.left + (ndcX + 1) / 2 * (this.camera.right - this.camera.left);
        out.y = this.camera.bottom + (ndcY + 1) / 2 * (this.camera.top - this.camera.bottom);
        out.addEquals(this.pos);
        out.z = 0;
        return out;
    }

    // Converts a world space coordinate into DOM pixel space (relative to page).
    // Inverse of pixelToWorld.
    worldToPixel(world: Vic, out?: Vic): Vic {
        out = out ?? new Vic();
        const rect = this.rect;
        const local = world.sub(this.pos);

        const ndcX = (local.x - this.camera.left) / (this.camera.right - this.camera.left) * 2 - 1;
        const ndcY = (local.y - this.camera.bottom) / (this.camera.top - this.camera.bottom) * 2 - 1;

        out.x = rect.left + (ndcX + 1) / 2 * rect.width;
        out.y = rect.top + (1 - ndcY) / 2 * rect.height;
        return out;
    }
}