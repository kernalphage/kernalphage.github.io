

import * as THREE from 'three';
import Vic from './lib/vic';

// Top-down view of an x/y tile grid 
export class Camera {
    readonly camera;

    readonly pos:Vic = new Vic(7,5)

    constructor(private viewSize: number) {
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
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


        // Redo Position
        const center = new THREE.Vector3(...this.pos.toArray());
        this.camera.position.set(center.x, center.y, center.z + 20);
        this.camera.up.set(0, 1, 0);
        this.camera.lookAt(center);
        this.camera.updateProjectionMatrix();
    }
}