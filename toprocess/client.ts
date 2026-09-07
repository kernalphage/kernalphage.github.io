

import * as THREE from 'three';
import { Hex, Layout, ThreeHex } from './kpHex';
import VoxelWorld from './mine_world';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

// TODO: 	npm install --save three-full
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import Vic from './vic';
import { TextHelper } from './TextHelper';
import { text } from 'stream/consumers';
import { Globals } from './globals';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let canvas: HTMLCanvasElement;
let camera: THREE.PerspectiveCamera;
let material: THREE.Material;
let currentVoxel = 0;
let currentId;
let font: Font;
let textHelper: TextHelper;
let timerText;
let clickRay;
const cellSize = 16;

const world = new VoxelWorld(cellSize, 16, 256, 64);
const cellIdToMesh: Record<string, THREE.Mesh> = {};

setTimeout(() => {
	init();
}, 100)

async function init() {
	// Setup renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(new THREE.Color(.26, .35, .88));
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	// renderer.setAnimationLoop(animate);
	canvas = renderer.domElement;

	setupUI();

	document.body.appendChild(renderer.domElement);
	document.body.style = '{backgroundColor: "#ff00ff"}'

	const fLoader = new FontLoader();
	font = await fLoader.loadAsync("resources/optimer_regular.typeface.json")
	const loader = new THREE.TextureLoader();
	const texture = loader.load('resources/flourish-cc-by-nc-sa.png', render);
	texture.magFilter = THREE.NearestFilter;
	texture.minFilter = THREE.NearestFilter;
	texture.colorSpace = THREE.LinearSRGBColorSpace;
	material = new THREE.MeshLambertMaterial({ map: texture, side: THREE.DoubleSide, alphaTest: 0.1, transparent: true });

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
	// camera = new THREE.OrthographicCamera(-1, 1, 1,-1, 0.1, 1000);
	camera.position.y = 10;
	camera.position.z = 20;

	const controls = new OrbitControls(camera, renderer.domElement);

	controls.target.set(0, 0, 0);
	controls.update();
	controls.addEventListener('change', render);


	// const h1 = new Vic(3,4,5);
	let h1 = new ThreeHex(3,4,5);
	let v1 = Globals.layout.threeHexToPixel(h1);
	let h2 =  Globals.layout.pixelToThreeHex(v1);
	let v2 =  Globals.layout.threeHexToPixel(h2);
	console.log({v1, v2, h1, h2})
	
	scene = new THREE.Scene();
	gizmo();
	textHelper = new TextHelper();

	timerText = textHelper.createText("renders: 0", new THREE.Vector3(0, 4, 0));

	// Lights
	// const skyColor = 0xB1E1FF;  // light blue
	// const groundColor = 0xB97A20;  // brownish orange
	const intensity = 1;
	// const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
	scene.add(new THREE.AmbientLight());
	



	// environemnt
	const anything = new THREE.BoxGeometry(1, 2, 3);
	const water = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 6, 6), new THREE.MeshBasicMaterial({ color: "rgba(0,0,255)" }))
	water.setRotationFromEuler(new THREE.Euler(Math.PI, 0, 0))
	scene.add(water);



	/// Draw world

	// for (let y = 0; y < cellSize; ++y) {
	// 	for (let z = 0; z < cellSize; ++z) {
	// 		for (let x = 0; x < cellSize; ++x) {
	// 			const height = (Math.sin(x / cellSize * Math.PI * 2) + Math.sin(z / cellSize * Math.PI * 3)) * (cellSize / 6) + (cellSize / 2) * .2;
	// 			if (y < height) {
	// 				// world.setVoxel(x, y, z, randInt(1, 5));
	// 				// world.setVoxel(x, y, z, 6);
	// 			}
	// 		}
	// 	}
	// }
	let N = 4;
		for (let q = -N; q <= N; q++) {
		const r1 = Math.max(-N, -q - N);
		const r2 = Math.min( N, -q + N);
		for (let r = r1; r <= r2; r++) {
			const height = (Math.sin(q / cellSize * Math.PI * 2) + Math.sin(r / cellSize * Math.PI * 3)) * (cellSize / 6) + (cellSize / 2) * .2;
			let color =  randInt(1,5);
			for(let z = 0; z < height; z++) {
				world.setVoxel(q+4, z,r + 4,color);
			}
		}
	}

	updateCellGeometry(0, 0, 0);

	window.addEventListener('resize', onWindowResize);

	render();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

function animate(time) {

	const elapsedTime = time / 1000; // ms to s


}


function gizmo() {
	const ex = new THREE.ArrowHelper(new THREE.Vector3(2, 0, 0), new THREE.Vector3(0, 0, 0), 3, "#ff0000")
	const wy = new THREE.ArrowHelper(new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0, 0), 3, "#00ff00")
	const ze = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 2), new THREE.Vector3(0, 0, 0), 3, "#0000ff")

	scene.add(ex, wy, ze);
}


function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min);
}


let renders = 0;
function render() {
	renders++;
	textHelper.updateText(timerText, `Renders: ${renders}`)
	textHelper.render(camera, canvas);
	renderer.render(scene, camera);
}

export type SandTile = { type: "Sand" }
export type RockTile = { type: "Rock" }
export type GrassTile = { type: "Grass" }


export type TileKinds = SandTile | RockTile | GrassTile;

export class Tile {
	constructor(
		readonly hex: Hex,
		readonly height: number,
		readonly kind: TileKinds["type"]
	) {

	}

	transform(): THREE.Matrix4 {
		const pos = new THREE.Matrix4()
		return pos.makeTranslation(new THREE.Vector3(0, 0, .5))
	}
}


function getCanvasRelativePosition(event: PointerEvent) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (event.clientX - rect.left) * canvas.width / rect.width,
		y: (event.clientY - rect.top) * canvas.height / rect.height,
	};
}

function placeVoxel(event: PointerEvent) {
	const pos = getCanvasRelativePosition(event);
	const x = (pos.x / canvas.width) * 2 - 1;
	const y = (pos.y / canvas.height) * -2 + 1;

	const start = new THREE.Vector3();
	const end = new THREE.Vector3();
	start.setFromMatrixPosition(camera.matrixWorld);
	end.set(x, y, 1).unproject(camera);
	let n = end.sub(start);
	let len = n.length();
	n.y = 0;

	if(clickRay) {
		scene.remove(clickRay);
	}
	clickRay = new THREE.ArrowHelper(n.normalize(), start, len);
	scene.add(clickRay);

	let startHex = Globals.layout.pixelToThreeHex(Vic.vFromTHREE(start));
	let endHex =  Globals.layout.pixelToThreeHex(Vic.vFromTHREE(end));
	let rayHexes = startHex.linedraw(endHex);
	let  i=1;
	for(const cell of rayHexes) {
		if(cell.y < 0) {
			console.log("Went through the ground");
			break;
		}
		textHelper.createText("" + i, new THREE.Vector3(...Globals.layout.hexToPixel(cell.hex).toArray()))
		const pos = cell.posArray();
		world.setVoxel(pos[0], pos[1] + 1, pos[2], (i++) % 5 + 1);
		updateVoxelGeometry(pos[0], pos[1] + 1, pos[2]);
		render();
	}


	// const intersection = world.intersectRay(start, end);
	// if (intersection) {
	// 	const voxelId = event.shiftKey ? 0 : currentVoxel;
	// 	// the intersection point is on the face. That means
	// 	// the math imprecision could put us on either side of the face.
	// 	// so go half a normal into the voxel if removing (currentVoxel = 0)
	// 	// our out of the voxel if adding (currentVoxel  > 0)
	// 	const pos = intersection.posArray();
	// 	world.setVoxel(pos[0], pos[1] + 1, pos[2], voxelId);
	// 	updateVoxelGeometry(pos[0], pos[1] + 1, pos[2]);
	// 	render();
	// }
}

const mouse = {
	x: 0,
	y: 0,
	dx: 0,
	dy: 0
};

function recordStartPosition(event: PointerEvent) {
	mouse.x = event.clientX;
	mouse.y = event.clientY,
	mouse.dx = 0;
	mouse.dy = 0;
}

function recordMovement(event: PointerEvent) {
	mouse.dx += Math.abs(mouse.x - event.clientX);
	mouse.dy += Math.abs(mouse.y - event.clientY);
}

// TODO: also don't place if you hold the mouse for awhile?
function placeVoxelIfNoMovement(event: PointerEvent) {
	if (mouse.dx < 5 && mouse.dy < 5) {
		placeVoxel(event);
	}
	window.removeEventListener('pointermove', recordMovement);
	window.removeEventListener('pointerup', placeVoxelIfNoMovement);
}

function setupUI() {
	// Setup UI
	document.querySelectorAll('#ui .tiles input[type=radio][name=voxel]').forEach((elem) => {
		elem.addEventListener('click', allowUncheck);
	});

	canvas.addEventListener('keydown', (event: KeyboardEvent) => {
		event.key
	},{capture: true, passive: false})
	canvas.addEventListener('keyup', (event: KeyboardEvent) => {
		
	}) 

	canvas.addEventListener('pointerdown', (event: PointerEvent) => {
		if(event.button != 0) {
			return;
		}
		event.preventDefault();
		recordStartPosition(event);
		window.addEventListener('pointermove', recordMovement);
		window.addEventListener('pointerup', placeVoxelIfNoMovement);

	}, { passive: false });
	canvas.addEventListener('touchstart', (event: PointerEvent) => {
		// stop scrolling
		event.preventDefault();
	}, { passive: false });

	function allowUncheck() {
		if (this.id === currentId) {
			this.checked = false;
			currentId = undefined;
			currentVoxel = 0;
		} else {
			currentId = this.id;
			currentVoxel = parseInt(this.value);
		}
	}

}

const neighborOffsets = [
	[0, 0, 0], // self
	[-1, 0, 0], // left
	[1, 0, 0], // right
	[0, -1, 0], // down
	[0, 1, 0], // up
	[0, 0, -1], // back
	[0, 0, 1], // front
];

function updateVoxelGeometry(x: number, y: number, z: number) {
	const updatedCellIds = {};
	for (const offset of neighborOffsets) {
		const ox = x + offset[0];
		const oy = y + offset[1];
		const oz = z + offset[2];
		const cellId = world.computeCellId(ox, oy, oz);
		if (!updatedCellIds[cellId]) {
			updatedCellIds[cellId] = true;
			updateCellGeometry(ox, oy, oz);

		}
	}
}

function updateCellGeometry(x: number, y: number, z: number) {

	const cellX = Math.floor(x / cellSize);
	const cellY = Math.floor(y / cellSize);
	const cellZ = Math.floor(z / cellSize);
	const cellId = world.computeCellId(x, y, z);
	let mesh = cellIdToMesh[cellId];

	const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();
	const { positions, normals, uvs, indices } = world.generateGeoForCell(cellX, cellY, cellZ);
	const positionNumComponents = 3;
	geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents));
	const normalNumComponents = 3;
	geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));
	const uvNumComponents = 2;
	geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
	geometry.setIndex(indices);
	geometry.computeBoundingSphere();

	if (!mesh) {
		mesh = new THREE.Mesh(geometry, material);
		mesh.name = cellId;
		cellIdToMesh[cellId] = mesh;
		scene.add(mesh);
		mesh.position.set(cellX * cellSize, cellY * cellSize, cellZ * cellSize);
	}
}

// A 3d geometry text 
function txt(t: string, pos: Vic) {
	const tex = new THREE.Mesh(new TextGeometry(t, { font, size: 1, depth: .2 }), new THREE.MeshBasicMaterial());
	tex.applyMatrix4(new THREE.Matrix4().makeTranslation(new THREE.Vector3(pos.x, pos.y, pos.z)));
	return tex;
}
