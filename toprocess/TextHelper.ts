import * as THREE from 'three';

// A utility that will render text boxes with CSS and track a target object
export type CSSTextHandle = number;

export type CSSTextProps = {
    dom: HTMLElement;
    id: number;
    text: string;
    target: THREE.Mesh | THREE.Vector3; // TODO: Weakref? 
}

export function isVec3(o: any): o is THREE.Vector3 {
    return o && o.isVector3
}

export class TextHelper {
    texts: Record<CSSTextHandle, CSSTextProps> = {}
    private curHandleID: CSSTextHandle = 0;

    constructor(
    ) {

    }

    // Create a css text and return the handle to that object
    createText(text: string, target: THREE.Mesh | THREE.Vector3, dom?: HTMLElement): number {
        this.curHandleID++;

        this.texts[this.curHandleID] = {
            dom: dom ?? this.createTextDom(this.curHandleID),
            id: this.curHandleID,
            target,
            text,
        }

        return this.curHandleID;
    }

    render(camera: THREE.Camera, canvas: HTMLCanvasElement) {
        for (const text in this.texts) {
            this.renderTextElement(camera, canvas, this.texts[text]);
        }
    }

    // Updates one element on screen 
    renderTextElement(camera: THREE.Camera, canvas: HTMLCanvasElement, text: CSSTextProps) {
        // Track the current position of the target
        let cssPos = new THREE.Vector3();
        if (isVec3(text.target)) {
            cssPos = text.target.clone();
        } else {
            text.target.getWorldPosition(cssPos)
        }

        // Project into screen coordinates
        cssPos = cssPos.project(camera)
        cssPos.x = Math.round((0.5 + cssPos.x / 2) * (canvas.width / window.devicePixelRatio));
        cssPos.y = Math.round((0.5 - cssPos.y / 2) * (canvas.height / window.devicePixelRatio));

        // Move the element onscreen
        text.dom.style.left = (cssPos.x) + "px";
        text.dom.style.top = (cssPos.y) + "px";

        // Update text (done in render to prevent multiple updates per frame)
        text.dom.textContent = text.text;
    }

    updateText(id: CSSTextHandle, text?: string, target?: THREE.Mesh | THREE.Vector3) {
        const txt = this.texts[id];
        if (!txt) {
            return false;
        }

        if (text) {
            txt.text = text;
        }
        if (target) {
            txt.target = target;
        }
    }

    createTextDom(id: CSSTextHandle) {
        const domElement = document.createElement("span");
        domElement.className = "cssText"
        domElement.id = "cssText" + id;
        document.body.appendChild(domElement);
        return domElement;
    }

    deleteTextDom(id: CSSTextHandle): boolean {
        const txt = this.texts[id];
        if (!txt) {
            return false;
        }

        document.body.removeChild(txt.dom);
        delete this.texts[id];
    }
}