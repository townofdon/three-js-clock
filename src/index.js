import * as THREE from 'three';
import { OrbitControls } from './controls/OrbitControls';
import './index.css';

const DEBUG = false;

let camera, scene, renderer, cube, spotLight, controls, lightHelper, shadowCameraHelper;

const clock = {};
const clockYOffset = 1;

function setClockBackface() {
  const radiusTop = 4;
  const radiusBottom = 4;
  const height = 0.1;
  const radialSegments = 50;
  const geometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments);
  const material = new THREE.MeshPhongMaterial({ color: 0xb0a780, dithering: true });
  const mesh = new THREE.Mesh(geometry, material);
  // rotate towards the camera
  mesh.rotation.x += Math.PI * 0.5;
  mesh.position.y += clockYOffset;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  clock.backface = mesh;
}

function setClockFrame() {
  const arcShape = new THREE.Shape()
    .moveTo( 5, 0 )
    .absarc( 0, 0, 4, 0, Math.PI * 2, false );
  const holePath = new THREE.Path()
    .moveTo( 4.65, 0 )
    .absarc( 0, 0, 3.65, 0, Math.PI * 2, true );
  arcShape.holes.push( holePath );
  const arcShapePrecise = new THREE.Shape(arcShape.extractPoints(50).shape);
  arcShapePrecise.holes.push(new THREE.Path(arcShape.getPointsHoles(50)[0]));
  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: false,
    steps: 5,
  };
  const geometry =  new THREE.ExtrudeGeometry(arcShapePrecise, extrudeSettings);
  const material = new THREE.MeshPhongMaterial({ color: 0x050505, dithering: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y += clockYOffset;
  mesh.castShadow = true;
  clock.frame = mesh;
}

function setClockPeg() {
  const radiusTop = 0.09;
  const radiusBottom = 0.09;
  const height = 0.18;
  const radialSegments = 25;
  const geometry = new THREE.CylinderBufferGeometry(radiusTop, radiusBottom, height, radialSegments);
  const material = new THREE.MeshPhongMaterial({ color: 0x353025, dithering: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x += Math.PI * 0.5;
  mesh.position.z += 0.1;
  mesh.position.y += clockYOffset;
  clock.peg = mesh;
}

function setClockHourHand() {
  const width = 0.1;
  const shape = new THREE.Shape([
    new THREE.Vector2( 0, width ),
    new THREE.Vector2( 0.25, width ),
    new THREE.Vector2( 0.25, -width ),
    new THREE.Vector2( 0, -width ),
    new THREE.Vector2( -2, -width ),
    new THREE.Vector2( -2, width ),
  ]);
  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: false,
    steps: 5,
  };
  const geometry =  new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshPhongMaterial({ color: 0x353025, dithering: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z += 0.2;
  mesh.position.y += clockYOffset;
  mesh.rotation.z -= Math.PI * 0.5;
  mesh.castShadow = true;
  clock.hourHand = mesh;
}

function setClockMinuteHand() {
  const width = 0.075;
  const shape = new THREE.Shape([
    new THREE.Vector2( 0, width ),
    new THREE.Vector2( 0.25, width ),
    new THREE.Vector2( 0.25, -width ),
    new THREE.Vector2( 0, -width ),
    new THREE.Vector2( -3, -width ),
    new THREE.Vector2( -3, width ),
  ]);
  const extrudeSettings = {
    depth: 0.1,
    bevelEnabled: false,
    steps: 5,
  };
  const geometry =  new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshPhongMaterial({ color: 0x000000, dithering: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z += 0.25;
  mesh.position.y += clockYOffset;
  mesh.rotation.z -= Math.PI * 0.75;
  mesh.castShadow = true;
  clock.minuteHand = mesh;
}

function setClockSecondHand() {
  const width = 0.03;
  const shape = new THREE.Shape([
    new THREE.Vector2( 0, width ),
    new THREE.Vector2( 0.75, width ),
    new THREE.Vector2( 0.75, -width ),
    new THREE.Vector2( 0, -width ),
    new THREE.Vector2( -3, -width ),
    new THREE.Vector2( -3, width ),
  ]);
  const extrudeSettings = {
    depth: 0.02,
    bevelEnabled: false,
    steps: 5,
  };
  const geometry =  new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshPhongMaterial({ color: 0xee0100, dithering: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z += 0.35;
  mesh.position.y += clockYOffset;
  mesh.rotation.z -= Math.PI * 1;
  mesh.castShadow = true;
  clock.secondHand = mesh;
}

function addClockMarking(radians = 0) {
  const offsetX = 3 * Math.sin(radians);
  const offsetY = 3 * Math.cos(radians);
  const length = 0.15;
  const shape = new THREE.Shape([
    new THREE.Vector2( -0.05, length ),
    new THREE.Vector2( 0.05, length ),
    new THREE.Vector2( 0.05, -length ),
    new THREE.Vector2( -0.05, -length ),
  ]);
  const extrudeSettings = {
    depth: 0.02,
    bevelEnabled: false,
    steps: 2,
  };
  const geometry =  new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshPhongMaterial({ color: 0x202020, dithering: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x += offsetX;
  mesh.position.y += offsetY + clockYOffset;
  mesh.position.z += 0.04;
  mesh.rotation.z -= radians;
  if (!clock.markings) clock.markings = [];
  clock.markings.push(mesh);
}

function setClockMarkings() {
  for (let i = 12; i > 0; i--) {
    addClockMarking(Math.PI * i / 6);
  }
}

function updateClockTime() {
  const date = new Date();
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const MIDNIGHT = Math.PI * -0.5;
  clock.hourHand.rotation.z = MIDNIGHT - Math.PI * hours / 6;
  clock.minuteHand.rotation.z = MIDNIGHT - Math.PI * minutes / 30;
  clock.secondHand.rotation.z = MIDNIGHT - Math.PI * seconds / 30;
}

function init() {
	scene = new THREE.Scene();

  // camera

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.z = 2;
	camera.position.y = -3;

  // renderer

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

	document.body.appendChild(renderer.domElement);

  // Controls

  controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 3;
  controls.maxDistance = 50;
  controls.enablePan = false;

	// Add texture
	// const texture = new THREE.TextureLoader().load('textures/crate.gif');
	// Create material with texture
	// const material = new THREE.MeshBasicMaterial({ map: texture });

  // ground

  const groundData = {
    material: new THREE.MeshPhongMaterial({ color: 0x0a0a0a, dithering: true }),
    geometry: new THREE.PlaneBufferGeometry( 2000, 2000 ),
  };
  const ground = new THREE.Mesh( groundData.geometry, groundData.material );
  ground.position.set( 0, -10, 0 );
  ground.rotation.x = - Math.PI * 0.5;
  ground.receiveShadow = true;
  scene.add( ground );

  // clock

  setClockBackface();
  setClockFrame();
  setClockPeg();
  setClockHourHand();
  setClockMinuteHand();
  setClockSecondHand();
  setClockMarkings();
  scene.add( clock.backface );
  scene.add( clock.frame );
  scene.add( clock.peg );
  scene.add( clock.hourHand );
  scene.add( clock.minuteHand );
  scene.add( clock.secondHand );
  clock.markings.forEach(marking => {
    scene.add( marking );
  });
  updateClockTime();
  setInterval(updateClockTime, 1000);

  // ambient light

  const ambient = new THREE.AmbientLight( 0xffffff, 0.3 );
	scene.add( ambient );

  // spotlight

  spotLight = new THREE.SpotLight(0xffffff, 1);
  // spotLight.position.set( 0, 10, 0 );
  // spotLight.rotation.x -= Math.PI * 0.5;
  // spotLight.castShadow = false;
  // spotLight.shadow.mapSize.width = 1024;
  // spotLight.shadow.mapSize.height = 1024;
  // spotLight.shadow.camera.near = 500;
  // spotLight.shadow.camera.far = 4000;
  // spotLight.shadow.camera.fov = 30;
  spotLight.position.set( 15, 40, 35 );
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.1;
  spotLight.decay = 2;
  spotLight.distance = 200;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 512;
  spotLight.shadow.mapSize.height = 512;
  spotLight.shadow.camera.near = 10;
  spotLight.shadow.camera.far = 200;
  spotLight.shadow.focus = 1;
  scene.add( spotLight );

  // light helper

  if (DEBUG) {
    lightHelper = new THREE.SpotLightHelper( spotLight );
    scene.add( lightHelper );
  }

  // shadow helper

  if (DEBUG) {
    shadowCameraHelper = new THREE.CameraHelper( spotLight.shadow.camera );
    scene.add( shadowCameraHelper );
  }
}

// Draw the scene every time the screen is refreshed
function render() {
	requestAnimationFrame(render);

	// Rotate cube (Change values to change speed)
	// cube.rotation.y += 0.01;

  if (DEBUG) {
    lightHelper.update();
    shadowCameraHelper.update();
  }

	renderer.render(scene, camera);
}

function onWindowResize() {
	// Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
	// Reset size
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();
render();
