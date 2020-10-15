import * as THREE from 'three';
import { OrbitControls } from './controls/OrbitControls';
import './index.css';

const DEBUG = false;

let camera, scene, renderer, cube, spotLight, controls, lightHelper, shadowCameraHelper;

function init() {
	scene = new THREE.Scene();

  // camera

	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.z = 5;

  // renderer

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;

	document.body.appendChild(renderer.domElement);

	// Add texture
	// const texture = new THREE.TextureLoader().load('textures/crate.gif');
	// Create material with texture
	// const material = new THREE.MeshBasicMaterial({ map: texture });

  // cube

	const geometry = new THREE.BoxGeometry(3, 3, 3);
	const material = new THREE.MeshPhongMaterial({ color: 0x0055ff, dithering: true });
	cube = new THREE.Mesh(geometry, material);
  cube.receiveShadow = true;
  cube.castShadow = true;
	scene.add(cube);
  cube.rotation.x += Math.PI * 0.25;

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

  // ambient light

  const ambient = new THREE.AmbientLight( 0xffffff, 0.1 );
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

  // Controls

  controls = new OrbitControls( camera, renderer.domElement );
  controls.minDistance = 5;
  controls.maxDistance = 50;
  controls.enablePan = false;

}

// Draw the scene every time the screen is refreshed
function render() {
	requestAnimationFrame(render);

	// Rotate cube (Change values to change speed)
	cube.rotation.y += 0.01;

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
