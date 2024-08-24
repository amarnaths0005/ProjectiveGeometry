"use strict";

let geomCombo;

let xObs, yObs, zObs;
let xObsRange, yObsRange, zObsRange;

let xPoint, yPoint;
let xPointRange, yPointRange;

let xPerspPointCase, zPerspPointCase;

let canvasLeftMargin, canvasTopMargin;
let canvasRightMargin, canvasBottomMargin;

let canvasXmin, canvasXmax, canvasZmin, canvasZmax;

let scene, camera, renderer;

let canvas01;
let context01;
let sphereObserver;
let spherePointOnObjectPlane;
let spherePointOnImagePlane;
let lineObjectToObserver;
let lineVanishing;

window.onload = init;

function init() {
  canvas01 = document.getElementById("canvasPersp");
  context01 = canvas01.getContext("2d");

  initializeValues();

  scene = new THREE.Scene();
  let width1 = (1 * window.innerWidth) / 2;
  camera = new THREE.PerspectiveCamera(
    45,
    width1 / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0x111111));
  renderer.setSize(width1, 0.7 * window.innerHeight);

  scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

  // White directional light at 0.65 intensity shining from the top.
  let directionalLight = new THREE.DirectionalLight(0xffffff, 0.65);
  scene.add(directionalLight);

  geomCombo = document.getElementById("geom");

  xObsRange = document.getElementById("pointObsX");
  xObsRange.addEventListener(
    "input",
    function () {
      xObs = parseFloat(xObsRange.value);
      document.getElementById("obPoint1x").textContent = xObs.toFixed(3);
      computePointProjection();
    },
    false
  );

  yObsRange = document.getElementById("pointObsY");
  yObsRange.addEventListener(
    "input",
    function () {
      yObs = parseFloat(yObsRange.value);
      document.getElementById("obPoint1y").textContent = yObs.toFixed(3);
      computePointProjection();
    },
    false
  );

  zObsRange = document.getElementById("pointObsZ");
  zObsRange.addEventListener(
    "input",
    function () {
      zObs = parseFloat(zObsRange.value);
      document.getElementById("obPoint1z").textContent = zObs.toFixed(3);
      computePointProjection();
    },
    false
  );

  xPointRange = document.getElementById("pointCaseX");
  xPointRange.addEventListener(
    "input",
    function () {
      xPoint = parseFloat(xPointRange.value);
      document.getElementById("objectPoint1x").textContent = xPoint.toFixed(3);
      computePointProjection();
    },
    false
  );

  yPointRange = document.getElementById("pointCaseY");
  yPointRange.addEventListener(
    "input",
    function () {
      yPoint = parseFloat(yPointRange.value);
      document.getElementById("objectPoint1y").textContent = yPoint.toFixed(3);
      computePointProjection();
    },
    false
  );

  geomCombo.selectedIndex = 0;
  document.getElementById("webglOp").appendChild(renderer.domElement);
  handleGeomCombo();
  setupCameraPosition();

  animate();
  render();
}

function initializeValues() {
  canvasLeftMargin = 10;
  canvasTopMargin = 10;
  canvasRightMargin = 4;
  canvasBottomMargin = 25;

  canvasXmin = -10.0;
  canvasXmax = 10.0;
  canvasZmin = 0.01;
  canvasZmax = 15.0;

  xObs = 2.0;
  yObs = -3.0;
  zObs = 2.5;
  xPoint = 2.0;
  yPoint = 3.0;
}

function handleGeomCombo() {
  geomCombo.addEventListener("change", function () {
    let vis = document.querySelector(".vis"),
      target = document.getElementById(this.value);
    if (vis !== null) {
      vis.className = "inv";
    }
    if (target !== null) {
      target.className = "vis";
    }
  });
}

function computePointProjection() {
  let paramLambda = (-1.0 * yObs) / (yPoint - yObs);
  xPerspPointCase = xObs + paramLambda * (xPoint - xObs);
  zPerspPointCase = zObs - paramLambda * zObs;
  drawPersp2DView();
  show3D_View();
}

function drawPersp2DView() {
  let cWidth = canvas01.width;
  let cHeight = canvas01.height;

  context01.save();
  context01.beginPath();
  context01.fillStyle = "lightyellow";
  context01.fillRect(0, 0, cWidth, cHeight);

  drawCoordAxesCanvas();
  drawVanishingLine();
  drawPointLegend();
  let xp = canvasMapX(xPerspPointCase);
  let zp = canvasMapZ(zPerspPointCase);
  context01.beginPath();
  context01.fillStyle = "blue";
  context01.arc(xp, zp, 3, 0, 2 * Math.PI, true);
  context01.fill();
  context01.stroke();
  context01.restore();
}

function canvasMapX(xVal) {
  let v1 = canvasLeftMargin;
  let v2 = canvas01.width - canvasRightMargin;
  let xDiff = canvasXmax - canvasXmin;
  let xv = v1 + ((v2 - v1) * (xVal - canvasXmin)) / xDiff;
  return xv;
}

function canvasMapZ(zVal) {
  let w1 = canvasTopMargin;
  let w2 = canvas01.height - canvasBottomMargin;
  let zDiff = canvasZmax - canvasZmin;
  let zv = w1 + ((w1 - w2) * (zVal - canvasZmax)) / zDiff;
  return zv;
}

function drawPointLegend() {
  context01.save();
  context01.beginPath();

  context01.font = "10pt sans-serif";
  context01.fillStyle = "#a52a2a";
  context01.textAlign = "left";
  let xPos = canvas01.width - 75;
  let yPos = 25;
  var text =
    "(" + xPerspPointCase.toFixed(2) + ", " + zPerspPointCase.toFixed(2) + ")";
  context01.fillText(text, xPos, yPos);

  context01.stroke();
  context01.restore();
}

function drawVanishingLine() {
  context01.save();

  context01.lineWidth = 1;
  context01.strokeStyle = "#aa0000";
  let p1x = canvasMapX(canvasXmin);
  let p2x = canvasMapX(canvasXmax);
  let pz = canvasMapZ(zObs);
  context01.beginPath();
  context01.moveTo(p1x, pz);
  context01.lineTo(p2x, pz);
  context01.stroke();
  context01.restore();
}

function drawCoordAxesCanvas() {
  context01.save();

  context01.lineWidth = 1;
  context01.strokeStyle = "#003300";

  let p1x = canvasMapX(canvasXmin);
  let p2x = canvasMapX(canvasXmax);
  let p1z = canvasMapZ(canvasZmin);
  let p2z = canvasMapZ(canvasZmax);

  context01.beginPath();
  context01.moveTo(p1x, p1z);
  context01.lineTo(p2x, p1z);
  context01.stroke();

  let pmx = (p1x + p2x) / 2;
  context01.beginPath();
  context01.moveTo(pmx, p1z);
  context01.lineTo(pmx, p2z);
  context01.stroke();
  context01.restore();
}

function show3D_View() {
  setupXZ_XY_Planes();
}

function setupXZ_XY_Planes() {
  scene.remove(sphereObserver);
  scene.remove(spherePointOnImagePlane);
  scene.remove(spherePointOnObjectPlane);
  scene.remove(lineObjectToObserver);
  scene.remove(lineVanishing);

  let line1, line2;
  let material1 = new THREE.LineBasicMaterial({ color: 0x00ddff });
  let material2 = new THREE.LineBasicMaterial({ color: 0xffdd00 });
  let material3 = new THREE.LineBasicMaterial({ color: 0x555555 });
  let material4 = new THREE.LineBasicMaterial({ color: 0x880000 });

  let geomVertices1 = [];
  geomVertices1.push(new THREE.Vector3(canvasXmax, 0, 0));
  geomVertices1.push(new THREE.Vector3(canvasXmax, canvasZmax, 0));
  geomVertices1.push(new THREE.Vector3(canvasXmin, canvasZmax, 0));
  geomVertices1.push(new THREE.Vector3(canvasXmin, 0, 0));
  geomVertices1.push(new THREE.Vector3(canvasXmax, 0, 0));
  let geometry1 = new THREE.BufferGeometry().setFromPoints(geomVertices1);
  line1 = new THREE.Line(geometry1, material1);
  scene.add(line1);

  let geomVertices2 = [];
  geomVertices2.push(new THREE.Vector3(canvasXmax, 0, 0));
  geomVertices2.push(new THREE.Vector3(canvasXmax, 0, -20));
  geomVertices2.push(new THREE.Vector3(canvasXmin, 0, -20));
  geomVertices2.push(new THREE.Vector3(canvasXmin, 0, 0));
  geomVertices2.push(new THREE.Vector3(canvasXmax, 0, 0));
  let geometry2 = new THREE.BufferGeometry().setFromPoints(geomVertices2);
  line2 = new THREE.Line(geometry2, material2);
  scene.add(line2);

  let geometry = new THREE.SphereGeometry(0.3, 32, 16);
  let material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  let sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  let geometryS2 = new THREE.SphereGeometry(0.3, 32, 16);
  let materialS2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  sphereObserver = new THREE.Mesh(geometryS2, materialS2);
  geometryS2.translate(xObs, zObs, -yObs);
  scene.add(sphereObserver);

  let geometryS3 = new THREE.SphereGeometry(0.3, 32, 16);
  let materialS3 = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  spherePointOnObjectPlane = new THREE.Mesh(geometryS3, materialS3);
  geometryS3.translate(xPoint, 0, -yPoint);
  scene.add(spherePointOnObjectPlane);

  let geometryS4 = new THREE.SphereGeometry(0.3, 32, 16);
  let materialS4 = new THREE.MeshBasicMaterial({ color: 0x00aaff });
  spherePointOnImagePlane = new THREE.Mesh(geometryS4, materialS4);
  geometryS4.translate(xPerspPointCase, zPerspPointCase, 0);
  scene.add(spherePointOnImagePlane);

  let geomVertices3 = [];
  geomVertices3.push(new THREE.Vector3(xPoint, 0, -yPoint));
  geomVertices3.push(new THREE.Vector3(xObs, zObs, -yObs));
  let geometry3 = new THREE.BufferGeometry().setFromPoints(geomVertices3);
  lineObjectToObserver = new THREE.Line(geometry3, material3);
  scene.add(lineObjectToObserver);

  let geomVertices4 = [];
  geomVertices4.push(new THREE.Vector3(canvasXmin, zObs, 0));
  geomVertices4.push(new THREE.Vector3(canvasXmax, zObs, 0));
  let geometry4 = new THREE.BufferGeometry().setFromPoints(geomVertices4);
  lineVanishing = new THREE.Line(geometry4, material4);
  scene.add(lineVanishing);
  render();
}

function setupCameraPosition() {
  camera.position.set(45, 28, -20);
  camera.lookAt(new THREE.Vector3(0, 0, -5));
  render();
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}
