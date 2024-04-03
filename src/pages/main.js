import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

// Setup
const scene = new THREE.Scene();

// Catch the canvas element 
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

// Set the pixel ratio
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Setup camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

// Setup Camera position
camera.position.set(0, 3, 10);
camera.lookAt(scene.position);

// Setup lights
const ambientLight = new THREE.AmbientLight('white', 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 10);
directionalLight.position.set(0, 1, 10);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 10);
directionalLight2.position.set(0, 1, -10);
scene.add(directionalLight2);

renderer.render(scene, camera);

// Load the car model
const loader = new GLTFLoader();
let carModel;

// Model car 1 
loader.load('./assets/carMerc.glb', (gltf) => {
  carModel = gltf.scene;
  scene.add(carModel);

  carModel.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.material.roughness = 0.5;
    }
  });
  carModel.castShadow = true;

  // Adjust the car position, scale and rotation 
  carModel.position.set(-4, 0, -3.5);
  carModel.scale.set(1, 1, 1);
  carModel.rotation.set(0, 1, 0);
});

// Load the car model
const loader2 = new GLTFLoader();
let carModel2;

// Model car 2
loader2.load('./assets/carRB.glb', (gltf) => {
  carModel2 = gltf.scene;
  scene.add(carModel2);

  carModel2.traverse(function (child) {
    if (child.isMesh) {
      child.castShadow = true;
      child.material.roughness = 0.5;
    }
  });
  carModel2.castShadow = true;

  // Adjust the car position, scale, and rotation 
  carModel2.position.set(3, 0, -3);
  carModel2.scale.set(0.02, 0.02, 0.02);
  carModel2.rotation.set(0, 18, 0);
});

// Camera settings
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.z = t * -1 + 5; // Adjust the distance from the car
  camera.position.x = t * -2;
  camera.rotation.y = t * -0.002; // Adjust the rotation speed
}

// Event listener for scrolling
document.body.onscroll = moveCamera;
moveCamera();

// Load Track model

// const dracoDecoderPath = new URL('./public/gltf', import.meta.url).href
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath(dracoDecoderPath + '/')

// const loader1 = new GLTFLoader();
// loader1.setDRACOLoader(dracoLoader);

const loader1 = new GLTFLoader();
const dracoLoader = new DRACOLoader();
 
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
 
loader1.setDRACOLoader( dracoLoader );


loader1.load(`./assets/track2.glb`, function (gltf) {
  const model = gltf.scene;
  model.position.set(0, -4, 202);
  model.receiveShadow = true;
  scene.add(model);
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
// Call the animate function
animate();
