import { Hex } from "./lib/kpHex";

export type EntityMapKey = string;

export class EntityMap<T> {
    readonly vals: Record<EntityMapKey, T> = {}

    set(h: Hex, val: T | undefined) {
        const key = hash(h);
        if (val) {
            this.vals[key] = val;
        } else {
            delete this.vals[key];
        }
    }
    get(h: Hex): T | undefined {
        const key = hash(h);
        return this.vals[key]
    }

}


export function hash(h: Hex): EntityMapKey {
    return `${h.r}|${h.q}`
}
export function unhash(key: EntityMapKey) {
    const [r, q] = key.split("|").map((s) => parseInt(s));

    return new Hex(r, q);
}