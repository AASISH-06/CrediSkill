/**
 * generate-avatar.js
 * Procedurally generates a stylized humanoid 3D avatar as a valid binary GLB file.
 * Saved to /frontend/models/user-avatar.glb
 *
 * Avatar anatomy (all as separate meshes in one GLB):
 *   Head        – sphere
 *   Torso       – box (wider, hoodie shape)
 *   Left Arm    – box
 *   Right Arm   – box
 *   Left Leg    – box
 *   Right Leg   – box
 *   Visor/Lens  – small flat box (neon accent)
 *
 * All geometry is stored in a single binary buffer chunk.
 * Colors: Cyan (#00FFCC) body, Purple (#9D4EDD) accents, Dark (#050816) base.
 */

const fs = require('fs');
const path = require('path');

// ---------- Low-level glTF binary writer ----------

function encodeString(str) {
    return Buffer.from(str, 'utf8');
}

// Write a padded 4-byte aligned chunk
function pad4(n) { return Math.ceil(n / 4) * 4; }

// Build a unit BOX ( -0.5..+0.5 on each axis ) triangulated
// returns { positions, normals, indices } all as flat arrays
function buildBox(sizeX, sizeY, sizeZ) {
    const hx = sizeX / 2, hy = sizeY / 2, hz = sizeZ / 2;

    // 6 faces, each 4 verts, each vert has position+normal
    const faces = [
        // +Y top
        { n: [0,1,0], verts: [[-hx,hy,-hz],[hx,hy,-hz],[hx,hy,hz],[-hx,hy,hz]] },
        // -Y bottom
        { n: [0,-1,0], verts: [[-hx,-hy,hz],[hx,-hy,hz],[hx,-hy,-hz],[-hx,-hy,-hz]] },
        // +X right
        { n: [1,0,0], verts: [[hx,-hy,-hz],[hx,-hy,hz],[hx,hy,hz],[hx,hy,-hz]] },
        // -X left
        { n: [-1,0,0], verts: [[-hx,-hy,hz],[-hx,-hy,-hz],[-hx,hy,-hz],[-hx,hy,hz]] },
        // +Z front
        { n: [0,0,1], verts: [[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]] },
        // -Z back
        { n: [0,0,-1], verts: [[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]] },
    ];

    const positions = [];
    const normals = [];
    const indices = [];
    let vBase = 0;

    for (const face of faces) {
        for (const v of face.verts) {
            positions.push(...v);
            normals.push(...face.n);
        }
        // Two triangles per quad
        indices.push(vBase, vBase+1, vBase+2, vBase, vBase+2, vBase+3);
        vBase += 4;
    }

    return { positions, normals, indices };
}

// Build a UV Sphere (lat/lon) for head
function buildSphere(radius, latSegs, lonSegs) {
    const positions = [], normals = [], indices = [];

    for (let lat = 0; lat <= latSegs; lat++) {
        const theta = (lat / latSegs) * Math.PI;
        for (let lon = 0; lon <= lonSegs; lon++) {
            const phi = (lon / lonSegs) * 2 * Math.PI;
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.cos(theta);
            const z = radius * Math.sin(theta) * Math.sin(phi);
            positions.push(x, y, z);
            normals.push(x/radius, y/radius, z/radius);
        }
    }
    for (let lat = 0; lat < latSegs; lat++) {
        for (let lon = 0; lon < lonSegs; lon++) {
            const a = lat * (lonSegs + 1) + lon;
            const b = a + (lonSegs + 1);
            indices.push(a, b+1, b, a, a+1, b+1);
        }
    }
    return { positions, normals, indices };
}

// ------- Colour helpers --------

function hexToLinear(hex) {
    // #RRGGBB → [r, g, b] linear
    const r = parseInt(hex.slice(1,3),16)/255;
    const g = parseInt(hex.slice(3,5),16)/255;
    const b = parseInt(hex.slice(5,7),16)/255;
    return [r**2.2, g**2.2, b**2.2]; // gamma decode
}

// -------- Build the full avatar definition --------

const CYAN_COL   = '#00FFCC';
const PURPLE_COL = '#9D4EDD';
const DARK_COL   = '#1A1A2E';
const SKIN_COL   = '#FFBE98';
const GREY_COL   = '#2A2A3E';

// Each part: { geometry, color, translation, rotation? }
const parts = [
    // Head
    { geo: buildSphere(0.22, 10, 12), color: SKIN_COL,   pos: [0, 1.55, 0] },
    // Torso (hoodie – wider at shoulders)
    { geo: buildBox(0.60, 0.55, 0.30), color: DARK_COL,  pos: [0, 1.0, 0] },
    // Hoodie stripe/logo accent
    { geo: buildBox(0.15, 0.05, 0.31), color: CYAN_COL,  pos: [0, 1.05, 0] },
    // Neck
    { geo: buildBox(0.10, 0.12, 0.10), color: SKIN_COL,  pos: [0, 1.30, 0] },
    // Left arm
    { geo: buildBox(0.14, 0.48, 0.14), color: DARK_COL,  pos: [-0.38, 0.96, 0] },
    // Right arm
    { geo: buildBox(0.14, 0.48, 0.14), color: DARK_COL,  pos: [0.38, 0.96, 0] },
    // Left forearm (cuffs)
    { geo: buildBox(0.12, 0.10, 0.12), color: CYAN_COL,  pos: [-0.38, 0.70, 0] },
    // Right forearm (cuffs)
    { geo: buildBox(0.12, 0.10, 0.12), color: CYAN_COL,  pos: [0.38, 0.70, 0] },
    // Waist
    { geo: buildBox(0.56, 0.10, 0.28), color: GREY_COL,  pos: [0, 0.70, 0] },
    // Left leg
    { geo: buildBox(0.20, 0.52, 0.22), color: DARK_COL,  pos: [-0.16, 0.37, 0] },
    // Right leg
    { geo: buildBox(0.20, 0.52, 0.22), color: DARK_COL,  pos: [0.16, 0.37, 0] },
    // Left shoe
    { geo: buildBox(0.22, 0.08, 0.28), color: PURPLE_COL, pos: [-0.16, 0.08, 0.03] },
    // Right shoe
    { geo: buildBox(0.22, 0.08, 0.28), color: PURPLE_COL, pos: [0.16, 0.08, 0.03] },
    // Visor (eye lens – neon slit)
    { geo: buildBox(0.24, 0.05, 0.02), color: CYAN_COL,   pos: [0, 1.57, 0.22] },
];

// -------- Pack all geometry into a single binary buffer --------

// We'll produce: per-part positionBuffer, normalBuffer, indexBuffer
// Then assemble glTF JSON + BIN chunk

const accessors = [];
const bufferViews = [];
const meshes = [];
const nodes = [];

let binParts = []; // ArrayBuffer pieces
let byteOffset = 0;

for (let pi = 0; pi < parts.length; pi++) {
    const part = parts[pi];
    const { positions, normals, indices } = part.geo;

    // -- Positions float32
    const posBuf = Buffer.alloc(positions.length * 4);
    positions.forEach((v, i) => posBuf.writeFloatLE(v, i * 4));
    const posPad = Buffer.alloc(pad4(posBuf.length) - posBuf.length);

    // -- Normals float32
    const normBuf = Buffer.alloc(normals.length * 4);
    normals.forEach((v, i) => normBuf.writeFloatLE(v, i * 4));
    const normPad = Buffer.alloc(pad4(normBuf.length) - normBuf.length);

    // -- Indices uint16
    const idxBuf = Buffer.alloc(indices.length * 2);
    indices.forEach((v, i) => idxBuf.writeUInt16LE(v, i * 2));
    const idxPad = Buffer.alloc(pad4(idxBuf.length) - idxBuf.length);

    // Bounding box for POSITION accessor
    let minPos = [Infinity,Infinity,Infinity], maxPos = [-Infinity,-Infinity,-Infinity];
    for (let i = 0; i < positions.length; i+=3) {
        for (let k=0;k<3;k++) {
            if (positions[i+k] < minPos[k]) minPos[k] = positions[i+k];
            if (positions[i+k] > maxPos[k]) maxPos[k] = positions[i+k];
        }
    }

    // BufferView for positions
    bufferViews.push({ buffer: 0, byteOffset, byteLength: posBuf.length, target: 34962 });
    accessors.push({ bufferView: bufferViews.length-1, componentType: 5126, count: positions.length/3, type: "VEC3", min: minPos, max: maxPos });
    const posAccessorIdx = accessors.length - 1;
    byteOffset += pad4(posBuf.length);

    // BufferView for normals
    bufferViews.push({ buffer: 0, byteOffset, byteLength: normBuf.length, target: 34962 });
    accessors.push({ bufferView: bufferViews.length-1, componentType: 5126, count: normals.length/3, type: "VEC3" });
    const normAccessorIdx = accessors.length - 1;
    byteOffset += pad4(normBuf.length);

    // BufferView for indices
    bufferViews.push({ buffer: 0, byteOffset, byteLength: idxBuf.length, target: 34963 });
    accessors.push({ bufferView: bufferViews.length-1, componentType: 5123, count: indices.length, type: "SCALAR" });
    const idxAccessorIdx = accessors.length - 1;
    byteOffset += pad4(idxBuf.length);

    binParts.push(posBuf, posPad, normBuf, normPad, idxBuf, idxPad);

    // Material from colour
    const [r, g, b] = hexToLinear(part.color);
    const materialIdx = pi; // unique per part

    // Mesh
    meshes.push({
        name: `part_${pi}`,
        primitives: [{
            attributes: { POSITION: posAccessorIdx, NORMAL: normAccessorIdx },
            indices: idxAccessorIdx,
            material: materialIdx
        }]
    });

    // Node with translation
    nodes.push({
        name: `node_${pi}`,
        mesh: pi,
        translation: part.pos
    });
}

// Build materials array
const materials = parts.map((part, pi) => {
    const [r, g, b] = hexToLinear(part.color);
    return {
        name: `mat_${pi}`,
        pbrMetallicRoughness: {
            baseColorFactor: [r, g, b, 1.0],
            metallicFactor: part.color === CYAN_COL || part.color === PURPLE_COL ? 0.8 : 0.2,
            roughnessFactor: part.color === CYAN_COL || part.color === PURPLE_COL ? 0.2 : 0.7
        },
        emissiveFactor: part.color === CYAN_COL ? [0.0, 0.8, 0.6] :
                        part.color === PURPLE_COL ? [0.4, 0.1, 0.7] : [0,0,0],
        doubleSided: false
    };
});

const sceneNodes = nodes.map((_, i) => i);

const gltfJson = {
    asset: { version: "2.0", generator: "CrediSkill-ProceduralAvatar" },
    scene: 0,
    scenes: [{ name: "Avatar", nodes: sceneNodes }],
    nodes,
    meshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: byteOffset }]
};

// --------- Assemble GLB ---------

const jsonStr = JSON.stringify(gltfJson);
const jsonBuf = Buffer.from(jsonStr, 'utf8');
// Pad JSON chunk to 4 bytes with spaces
const jsonPadLen = pad4(jsonBuf.length) - jsonBuf.length;
const jsonPadded = Buffer.concat([jsonBuf, Buffer.alloc(jsonPadLen, 0x20)]); // spaces

const binBuf = Buffer.concat(binParts);
// Pad BIN chunk to 4 bytes with nulls
const binPadLen = pad4(binBuf.length) - binBuf.length;
const binPadded = Buffer.concat([binBuf, Buffer.alloc(binPadLen, 0x00)]);

const totalLen = 12 + 8 + jsonPadded.length + 8 + binPadded.length;
const header = Buffer.alloc(12);
header.writeUInt32LE(0x46546C67, 0); // magic 'glTF'
header.writeUInt32LE(2, 4);         // version 2
header.writeUInt32LE(totalLen, 8);  // total file length

const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(jsonPadded.length, 0);
jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'

const binChunkHeader = Buffer.alloc(8);
binChunkHeader.writeUInt32LE(binPadded.length, 0);
binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'

const glb = Buffer.concat([header, jsonChunkHeader, jsonPadded, binChunkHeader, binPadded]);

const outPath = path.join(__dirname, 'frontend', 'models', 'user-avatar.glb');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, glb);
console.log(`SUCCESS: ${glb.length} bytes → ${outPath}`);
