

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
        this.resizeCanvas(rect);
    }


    resizeCanvas(rect: DOMRect) {

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
}