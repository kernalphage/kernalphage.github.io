
import * as fs from 'node:fs';
import sharp from "sharp";

// read all assets in folder
// box pack in a spritesheet
// write out spritesheet and typescript generate a file with the sprite names and their positions in the spritesheet

function generateSpritesheet(inputFolder: string, outputImage: string, outputTypescript: string) {
    const files = fs.readdirSync(inputFolder).filter(file => file.endsWith('.png'));
    const images = files.map(file => {


    });
}


(function main() {
    generateSpritesheet('assets/sprites', 'static/spritesheet.png', 'src/Spritesheet.ts');
})();