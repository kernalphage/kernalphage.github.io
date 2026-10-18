export interface SpritesheetLayout {
    frames: Record<string, SpriteFrame>;
    meta:   SpriteMeta;
}

export interface SpriteFrame {
    duration:         number;
    filename:         string;
    frame:            SpriteSourceSizeClass;
    rotated:          boolean;
    sourceSize:       SpriteSize;
    spriteSourceSize: SpriteSourceSizeClass;
    trimmed:          boolean;
}

export interface SpriteSourceSizeClass {
    w: number;
    h: number;
    x: number;
    y: number;
}

export interface SpriteSize {
    h: number;
    w: number;
}

export interface SpriteMeta {
    app:       string;
    format:    string;
    frameTags: any[];
    image:     string;
    scale:     number;
    size:      SpriteSize;
    version:   string;
}
