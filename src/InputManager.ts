import Vic from "./lib/vic";

/** Some common keycode constants */
export const KeyCode = {
    SPACE: "Space",
    ENTER: "Enter",
    ESCAPE: "Escape",
    BACKSPACE: "Backspace",
    TAB: "Tab",
    DELETE: "Delete",

    SHIFT: "ShiftLeft,ShiftRight",
    CONTROL: "ControlLeft,ControlRight",
    ALT: "AltLeft,AltRight",
    META: "MetaLeft,MetaRight",
};

export class InputManager {

    public keyDown: Set<string> = new Set();
    public keyPressed: Set<String> = new Set();
    public mousePos:Vic = new Vic(); 

    static MouseButton(button:number) {
        return "MOUSE_BUTTON_" + button;
    }

    

    public isKeyDown(key:string|number, modifiers:string[] = []) {
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
    }

}

