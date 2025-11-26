// Toilet Paper Pack Generator - main script

let scene, camera, renderer, controls;
let packGroup;
let targetCenter = new THREE.Vector3(0, 0, 0);

// DOM references
const inputs = {
  rollDiameter: document.getElementById("rollDiameter"),
  coreDiameter: document.getElementById("coreDiameter"),
  rollHeight: document.getElementById("rollHeight"),
  rows: document.getElementById("rows"),
  rollsPerRow: document.getElementById("rollsPerRow"),
  layers: document.getElementById("layers"),
};

const totalRollsEl = document.getElementById("totalRolls");
const packDimensionsEl = document.getElementById("packDimensions");
const footprintEl = document.getElementById("footprint");

const generateBtn = document.getElementById("generateBtn");
const exportPngBtn = document.getElementById("exportPngBtn");

// Rotation controls
const packRotX = document.getElementById("packRotX");
const packRotY = document.getElementById("packRotY");
const packRotXVal = document.getElementById("packRotXVal");
const packRotYVal = document.getElementById("packRotYVal");

// Camera controls
const camAngleX = document.getElementById("camAngleX");
const camAngleY = document.getElementById("camAngleY");
const camDistance = document.getElementById("camDistance");
const camPanX = document.getElementById("camPanX");
const camPanY = document.getElementById("camPanY");

const camAngleXVal = document.getElementById("camAngleXVal");
const camAngleYVal = document.getElementById("camAngleYVal");
const camDistanceVal = document.getElementById("camDistanceVal");
const camPanXVal = document.getElementById("camPanXVal");
const camPanYVal = document.getElementById("camPanYVal");

// Helpers
function parsePositiveNumber(inputEl) {
  const value = parseFloat(inputEl.value);
  if (isNaN(value) || value <= 0) {
    return null;
  }
  return value;
}

function updateResults(rollDiameter, rollHeight, rows, rollsPerRow, layers) {
  const intRows = Math.round(rows);
  const intRollsPerRow = Math.round(rollsPerRow);
  const intLayers = Math.round(layers);

  const totalRolls = intRows * intRollsPerRow * intLayers;
  const packWidth = intRows * rollDiameter;
  const packDepth = intRollsPerRow * rollDiameter;
  const packHeight = intLayers * rollHeight;

  totalRollsEl.textContent = `${totalRolls} rolls (${intRows} × ${intRollsPerRow} × ${intLayers})`;
  packDimensionsEl.textContent =
    `Width: ${packWidth.toFixed(1)} mm, ` +
    `Depth: ${packDepth.toFixed(1)} mm, ` +
    `Height: ${packHeight.toFixed(1)} mm`;
  footprintEl.textContent = `${packWidth.toFixed(1)} mm × ${packDepth.toFixed(1)} mm`;

  return { packWidth, packDepth, packHeight, totalRolls };
}

function showError(message) {
  totalRollsEl.textContent = message;
  packDimensionsEl.textContent = "–";
  footprintEl.textContent = "–";
}

// 3D setup
function init3D() {
  const container = document.getElementById("canvas-container");
  const width = container.clientWidth;
  const height = container.clientHeight || 400;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f3f6);

  camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
  camera.position.set(400, 300, 400);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    preserveDrawingBuffer: true, // needed for PNG export
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.copy(targetCenter);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.update();

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
  dirLight.position.set(200, 300, 200);
  scene.add(dirLight);

  // Ground grid (optional, very light)
  const grid = new THREE.GridHelper(2000, 40, 0xcccccc, 0xeeeeee);
  grid.position.y = -0.1;
  scene.add(grid);

  // Group for the pack
  packGroup = new THREE.Group();
  scene.add(packGroup);

  window.addEventListener("resize", onWindowResize);
  animate();
}

function onWindowResize() {
  const container = document.getElementById("canvas-container");
  if (!container || !camera || !renderer) return;

  const width = container.clientWidth;
  const height = container.clientHeight || 400;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) {
    controls.update();
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

// Build pack geometry
function buildPack() {
  const rollDiameter = parsePositiveNumber(inputs.rollDiameter);
  const coreDiameter = parsePositiveNumber(inputs.coreDiameter);
  const rollHeight = parsePositiveNumber(inputs.rollHeight);
  const rows = parsePositiveNumber(inputs.rows);
  const rollsPerRow = parsePositiveNumber(inputs.rollsPerRow);
  const layers = parsePositiveNumber(inputs.layers);

  if (
    rollDiameter === null ||
    coreDiameter === null ||
    rollHeight === null ||
    rows === null ||
    rollsPerRow === null ||
    layers === null
  ) {
    showError("Please enter valid positive numbers for all fields.");
    return;
  }

  if (coreDiameter >= rollDiameter) {
    showError("Error: Core diameter must be smaller than roll diameter.");
    return;
  }

  const { packWidth, packDepth, packHeight } = updateResults(
    rollDiameter,
    rollHeight,
    rows,
    rollsPerRow,
    layers
  );

  // Clear existing pack
  while (packGroup.children.length > 0) {
    const child = packGroup.children[0];
    packGroup.remove(child);
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }

  const intRows = Math.round(rows);
  const intRollsPerRow = Math.round(rollsPerRow);
  const intLayers = Math.round(layers);

  const rollRadius = rollDiameter / 2;
  const coreRadius = coreDiameter / 2;

  const rollGeom = new THREE.CylinderGeometry(rollRadius, rollRadius, rollHeight, 32);
  const rollMat = new THREE.MeshPhongMaterial({ color: 0xffffff });

  const coreGeom = new THREE.CylinderGeometry(coreRadius, coreRadius, rollHeight + 1, 24);
  const coreMat = new THREE.MeshPhongMaterial({ color: 0xd0d0d0 });

  // Centered grid: X (rows) and Z (rollsPerRow), Y is vertical (layers)
  const startX = -packWidth / 2 + rollRadius;
  const startZ = -packDepth / 2 + rollRadius;
  const startY = rollHeight / 2;

  for (let layer = 0; layer < intLayers; layer++) {
    const y = startY + layer * rollHeight;

    for (let ix = 0; ix < intRows; ix++) {
      const x = startX + ix * rollDiameter;

      for (let iz = 0; iz < intRollsPerRow; iz++) {
        const z = startZ + iz * rollDiameter;

        // Roll
        const rollMesh = new THREE.Mesh(rollGeom, rollMat);
        rollMesh.position.set(x, y, z);
        rollMesh.rotation.x = Math.PI / 2; // lay the roll on its side (axis along X)
        packGroup.add(rollMesh);

        // Core
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.set(x, y, z);
        coreMesh.rotation.x = Math.PI / 2;
        packGroup.add(coreMesh);
      }
    }
  }

  // Pack bounding box (transparent)
  const boxGeom = new THREE.BoxGeometry(packWidth, packHeight, packDepth);
  const edges = new THREE.EdgesGeometry(boxGeom);
  const lineMat = new THREE.LineBasicMaterial({ color: 0x0066cc });
  const wireframe = new THREE.LineSegments(edges, lineMat);
  packGroup.add(wireframe);

  const boxMat = new THREE.MeshPhongMaterial({
    color: 0x99c4ff,
    transparent: true,
    opacity: 0.1,
  });
  const boxMesh = new THREE.Mesh(boxGeom, boxMat);
  packGroup.add(boxMesh);

  // Reset pack rotation according to sliders
  applyPackRotation();

  // Adjust camera target to pack center
  targetCenter.set(0, packHeight / 2, 0);
  controls.target.copy(targetCenter);
  controls.update();
}

// Pack rotation handlers
function applyPackRotation() {
  if (!packGroup) return;
  const rotXDeg = parseFloat(packRotX.value) || 0;
  const rotYDeg = parseFloat(packRotY.value) || 0;

  packRotXVal.textContent = rotXDeg + "°";
  packRotYVal.textContent = rotYDeg + "°";

  const rotX = THREE.MathUtils.degToRad(rotXDeg);
  const rotY = THREE.MathUtils.degToRad(rotYDeg);

  packGroup.rotation.set(rotX, rotY, 0);
}

// Camera control handlers
function applyCameraControls() {
  if (!camera || !controls) return;

  const angleXDeg = parseFloat(camAngleX.value) || 0;
  const angleYDeg = parseFloat(camAngleY.value) || 0;
  const distance = parseFloat(camDistance.value) || 400;
  const panX = parseFloat(camPanX.value) || 0;
  const panY = parseFloat(camPanY.value) || 0;

  camAngleXVal.textContent = angleXDeg + "°";
  camAngleYVal.textContent = angleYDeg + "°";
  camDistanceVal.textContent = distance.toFixed(0);
  camPanXVal.textContent = panX.toFixed(0);
  camPanYVal.textContent = panY.toFixed(0);

  const theta = THREE.MathUtils.degToRad(angleXDeg); // around Y axis
  const phi = THREE.MathUtils.degToRad(angleYDeg);   // up/down

  const x = distance * Math.cos(phi) * Math.sin(theta);
  const y = distance * Math.sin(phi);
  const z = distance * Math.cos(phi) * Math.cos(theta);

  const target = new THREE.Vector3(
    targetCenter.x + panX,
    targetCenter.y + panY,
    targetCenter.z
  );

  camera.position.set(target.x + x, target.y + y, target.z + z);
  controls.target.copy(target);
  controls.update();
}

// PNG export
function exportPNG() {
  if (!renderer) return;
  const dataURL = renderer.domElement.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "toilet-paper-pack.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Event wiring
function setupEvents() {
  // Generate pack when button clicked
  generateBtn.addEventListener("click", buildPack);

  // Recalculate results as numbers change (without rebuilding 3D every time)
  Object.values(inputs).forEach((input) => {
    input.addEventListener("input", () => {
      const rollDiameter = parsePositiveNumber(inputs.rollDiameter);
      const coreDiameter = parsePositiveNumber(inputs.coreDiameter);
      const rollHeight = parsePositiveNumber(inputs.rollHeight);
      const rows = parsePositiveNumber(inputs.rows);
      const rollsPerRow = parsePositiveNumber(inputs.rollsPerRow);
      const layers = parsePositiveNumber(inputs.layers);

      if (
        rollDiameter === null ||
        coreDiameter === null ||
        rollHeight === null ||
        rows === null ||
        rollsPerRow === null ||
        layers === null
      ) {
        showError("Please enter valid positive numbers for all fields.");
        return;
      }
      if (coreDiameter >= rollDiameter) {
        showError("Error: Core diameter must be smaller than roll diameter.");
        return;
      }

      updateResults(rollDiameter, rollHeight, rows, rollsPerRow, layers);
    });
  });

  // Pack rotation sliders
  packRotX.addEventListener("input", applyPackRotation);
  packRotY.addEventListener("input", applyPackRotation);

  // Camera sliders
  [camAngleX, camAngleY, camDistance, camPanX, camPanY].forEach((el) => {
    el.addEventListener("input", applyCameraControls);
  });

  exportPngBtn.addEventListener("click", exportPNG);
}

// Initialize everything
window.addEventListener("DOMContentLoaded", () => {
  init3D();
  setupEvents();
  // Initial calculation and pack creation
  buildPack();
  applyCameraControls();
});
