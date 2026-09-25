// Decorator for a "set once at startup, read many times after" field.
// Turns:
//   private _camera: Camera | null = null;
//   get camera() { if (!this._camera) throw ...; return this._camera; }
//   set camera(v: Camera) { this._camera = v; }
// into:
//   @LazyLoaded() accessor camera: Camera;
//
// Reading the field before it's set throws instead of silently returning null,
// so callers don't need `Globals.camera?.foo` checks everywhere.
export function LazyLoaded<C, T>() {
    return function (
        _target: ClassAccessorDecoratorTarget<C, T>,
        context: ClassAccessorDecoratorContext<C, T>
    ): ClassAccessorDecoratorResult<C, T> {
        const name = String(context.name);
        let value: T | undefined;
        let isSet = false;

        return {
            get(this: C): T {
                if (!isSet) {
                    throw new Error(`LazyLoaded field "${name}" was read before it was set`);
                }
                return value as T;
            },
            set(this: C, newValue: T) {
                value = newValue;
                isSet = true;
            },
        };
    };
}
