import Vic from "./lib/vic";

/** Some common keycode constants */
export const KeyCode = {
    SPACE: "Space",
    ENTER: "Enter",
    ESCAPE: "Escape",
    BACKSPACE: "Backspace",
    TAB: "Tab",
    DELETE: "Delete",

    UP: "ArrowUp,KeyW",
    DOWN: "ArrowDown,KeyS",
    LEFT: "ArrowLeft,KeyA",
    RIGHT: "ArrowRight,KeyD",

    SHIFT: "ShiftLeft,ShiftRight",
    CONTROL: "ControlLeft,ControlRight",
    ALT: "AltLeft,AltRight",
    META: "MetaLeft,MetaRight",
};

export class InputManager {

    public keyDown: Set<string> = new Set();
    public keyPressed: Set<String> = new Set();
    // mousePos.z accumulates scroll/pinch delta since the last update() call.
    // Positive means zoom out, negative means zoom in.
    public mousePos:Vic = new Vic();

    private pinchDist: number | null = null;

    static MouseButton(button:number) {
        return "MOUSE_BUTTON_" + button;
    }

    

    public isKeyDown(key: keyof typeof KeyCode | string|number, modifiers:string[] = []) {
        if(typeof key === 'number') {
            key = InputManager.MouseButton(key);
        }
        if(key.includes(',')) {
            const keys = key.split(',');
            for(const k of keys) {
                if(this.keyDown.has(k)) {
                    return true;
                }
            }
        }
        if(modifiers.length > 0) {
            for(const mod of modifiers) {
                if(!this.isKeyPressed(mod)) {
                    return false;
                }
            }
        }

        return this.keyDown.has(key) ;
    }

    public isKeyPressed(key:string|number, modifiers:string[] = []) {
        if(typeof key === 'number') {
            key = InputManager.MouseButton(key);
        }

        if(key.includes(',')) {
            const keys = key.split(',');
            for(const k of keys) {
                if(this.keyPressed.has(k)) {
                    return true;
                }
            }
        }

        if(modifiers.length > 0) {
            for(const mod of modifiers) {
                if(!this.isKeyPressed(mod)) {
                    return false;
                }
            }
        }
        return this.keyPressed.has(key);
    }


    constructor() {
        
    }

    init() {
        document.addEventListener('keydown', this.onKeyboardEvent.bind(this));
        document.addEventListener('keyup', this.onKeyboardEvent.bind(this));
        document.addEventListener('mousemove', this.onMouseEvent.bind(this));
        document.addEventListener('mousedown', this.onMouseEvent.bind(this));
        document.addEventListener('mouseup', this.onMouseEvent.bind(this));
        document.addEventListener('wheel', this.onWheelEvent.bind(this), { passive: true });
        document.addEventListener('touchstart', this.onTouchEvent.bind(this), { passive: true });
        document.addEventListener('touchmove', this.onTouchEvent.bind(this), { passive: true });
        document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
        document.addEventListener('touchcancel', this.onTouchEnd.bind(this), { passive: true });
        window.addEventListener('blur', this.onBlurEvent.bind(this));
    }



    onMouseEvent(e:MouseEvent) {
        this.mousePos.x = e.clientX;
        this.mousePos.y = e.clientY;

        const buttoncode = InputManager.MouseButton(e.button);
        if (e.type === 'mousedown') {
            this.keyDown.add(buttoncode);
            this.keyPressed.add(buttoncode);
        } else if (e.type === 'mouseup') {
            this.keyDown.delete(buttoncode);
            this.keyPressed.delete(buttoncode);
        }
    }

    onWheelEvent(e:WheelEvent) {
        this.mousePos.z += e.deltaY;
    }

    private touchDist(touches: TouchList) {
        const [a, b] = [touches[0], touches[1]];
        return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    onTouchEvent(e:TouchEvent) {
        if (e.touches.length === 1) {
            this.mousePos.x = e.touches[0].clientX;
            this.mousePos.y = e.touches[0].clientY;
            this.pinchDist = null;
        } else if (e.touches.length >= 2) {
            const dist = this.touchDist(e.touches);
            if (this.pinchDist !== null) {
                this.mousePos.z += this.pinchDist - dist;
            }
            this.pinchDist = dist;
        }
    }

    onTouchEnd(e:TouchEvent) {
        if (e.touches.length < 2) {
            this.pinchDist = null;
        }
    }

    onKeyboardEvent(e:KeyboardEvent) {
        if (e.type === 'keydown') {
            this.keyDown.add(e.code);  
            this.keyPressed.add(e.code);
        } else if (e.type === 'keyup') {
            this.keyDown.delete(e.code);
            this.keyPressed.delete(e.code);
        }
    }

    onBlurEvent() {
        this.keyDown = new Set();
        this.keyPressed = new Set()
    }

    update() {
        this.keyPressed = new Set();
        this.mousePos.z = 0;
    }

}

