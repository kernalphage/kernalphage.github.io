import * as z from "zod";
import { v4 } from "uuid";

export const SaveStateV1 = z.object({
    version: z.literal(1),
    timesOpened: z.number().default(0),
    seed: z.uuid().default(() => v4())
});

export type SaveStateV1_T = z.infer<typeof SaveStateV1>

const STORAGE_KEY = "savegame";

function toBase64(str: string): string {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((b) => binary += String.fromCharCode(b));
    return btoa(binary);
}

function fromBase64(b64: string): string {
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

export class SaveGame {
    state: SaveStateV1_T;

    constructor() {
        this.state = this.load();
        this.state.timesOpened++;
    }

    static default(): SaveStateV1_T {
        return SaveStateV1.parse({ version: 1 });
    }

    // Reads the raw, still-encoded save data from its source (browser storage today,
    // clipboard eventually). Kept separate from parse() so a future clipboard-based
    // load can reuse the same parsing path.
    private loadRaw(): string | null {
        return localStorage.getItem(STORAGE_KEY);
    }

    // Turns raw base64-encoded save data into a validated save state.
    private parse(raw: string): SaveStateV1_T {
        const json = fromBase64(raw);
        return SaveStateV1.parse(JSON.parse(json));
    }

    private serialize(state: SaveStateV1_T): string {
        return toBase64(JSON.stringify(state));
    }

    load(): SaveStateV1_T {
        const raw = this.loadRaw();
        if (raw === null) {
            return SaveGame.default();
        }
        try {
            return this.parse(raw);
        } catch {
            return SaveGame.default();
        }
    }

    save() {
        localStorage.setItem(STORAGE_KEY, this.serialize(this.state));
    }
}
