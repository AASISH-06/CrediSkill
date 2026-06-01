/**
 * embed-avatar.js
 * Reads the generated GLB, base64-encodes it, and writes
 *   /frontend/models/avatar-data.js
 * which exports a DATA_URL string that Three.js can load directly
 * without any HTTP server (works even over file://).
 */

const fs = require('fs');
const path = require('path');

const glbPath = path.join(__dirname, 'frontend', 'models', 'user-avatar.glb');
const outPath = path.join(__dirname, 'frontend', 'models', 'avatar-data.js');

if (!fs.existsSync(glbPath)) {
    console.error('ERROR: user-avatar.glb not found. Run generate-avatar.js first.');
    process.exit(1);
}

const glbBytes = fs.readFileSync(glbPath);
const b64 = glbBytes.toString('base64');

// Wrap as a data URL (application/octet-stream)
const dataUrl = `data:application/octet-stream;base64,${b64}`;

const jsContent = `/* AUTO-GENERATED — DO NOT EDIT */
/* GLB embedded as base64 so it loads without a server (file:// works). */
window.AVATAR_GLB_DATA_URL = "${dataUrl}";
`;

fs.writeFileSync(outPath, jsContent, 'utf8');
console.log(`SUCCESS: avatar-data.js written (${(jsContent.length / 1024).toFixed(1)} KB)`);
