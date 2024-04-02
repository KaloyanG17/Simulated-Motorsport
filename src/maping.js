// Imports
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Setup scene
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
renderer.setClearColor(0x000000);
scene.background = new THREE.Color('darkGreen');

// Setup camera
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(100, 330, 120);
camera.lookAt(scene.position);

// Setup lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// Load the GLTF model
const loader = new GLTFLoader();
loader.load('./assets/track2.glb', function (gltf) {
  const model = gltf.scene;
  scene.add(model);
});

// Vehicle setup
const entityManager = new YUKA.EntityManager();

const vehicle1 = createYukaCar({ maxSpeed: 20, minSpeed: 10, team: 'red', startPos: 1 });
entityManager.add(vehicle1);

const vehicles = [vehicle1]; // Add more vehicles if needed
const time = new YUKA.Time();

// Sync the YUKA vehicle with the Three.js model
function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

// Getters
const leaderboardElement = document.getElementById('leaderboard');
const zoomOutButton = document.getElementById('zoom-out-btn');
const zoomInButton = document.getElementById('zoom-in-btn');

// Setters
let raceStartTime = Date.now();
let zoom = true;

// Animate the scene 
function animate() {
  const delta = time.update().getDelta();
  entityManager.update(delta);

  // Sort the vehicles by lap time 
  const sortedVehicles = vehicles.slice().sort((a, b) => {
    return a.bestLapTime - b.bestLapTime;
  });

  // Zoom in and out
  zoomOutButton.addEventListener('click', () => {
    zoom = false;
  });

  zoomInButton.addEventListener('click', () => {
    zoom = true;
  });

  if (zoom) {
    camera.position.copy(sortedVehicles[0].position).add(new THREE.Vector3(5, 25, 10));
  } else {
    camera.position.copy(sortedVehicles[0].position).add(new THREE.Vector3(75, 100, 50));
  }

  for (const vehicle of vehicles) {

    // FORWARD FACING TO USE LATER FOR SLIPSTREAM
    // const forward = vehicle1.forward.clone().multiplyScalar(1)

  }


  renderer.render(scene, camera);
}


function createYukaCar({ maxSpeed, minSpeed, team, startPos }) {
  // Setup track path
  const path = new YUKA.Path();
  // path.add(new YUKA.Vector3(10, 0, -27));
  // path.add(new YUKA.Vector3(125, 0, -27));
  // path.add(new YUKA.Vector3(175, 1, -32));
  // path.add(new YUKA.Vector3(230, 2, -55));
  // path.add(new YUKA.Vector3(267, 2, -100));
  // path.add(new YUKA.Vector3(282, 3, -160));
  // path.add(new YUKA.Vector3(275, 3, -197));
  // path.add(new YUKA.Vector3(250, 3, -247));
  // path.add(new YUKA.Vector3(198, 2, -282));
  // path.add(new YUKA.Vector3(150, 1, -292));
  // path.add(new YUKA.Vector3(118, 0, -282));
  // path.add(new YUKA.Vector3(90, 0, -263));
  // path.add(new YUKA.Vector3(60, 0, -252));
  // path.add(new YUKA.Vector3(-120, 0, -252));
  // path.add(new YUKA.Vector3(-140, 0, -235));
  // path.add(new YUKA.Vector3(-140, 0, -185));
  // path.add(new YUKA.Vector3(-132, -2, -165));
  // path.add(new YUKA.Vector3(-103, -5, -140));
  path.add(new YUKA.Vector3(-80, -4, -135));
  path.add(new YUKA.Vector3(-65, -2, -145));
  path.add(new YUKA.Vector3(-55, 1, -170));
  path.add(new YUKA.Vector3(-45, 4, -197));
  // path.add(new YUKA.Vector3(-20, 4, -207));
  // path.add(new YUKA.Vector3(80, 3, -207));
  // path.loop = true;

  // Setup vehicle
  const vehicle = new YUKA.Vehicle();
  vehicle.position.copy(path.current());
  vehicle.maxSpeed = maxSpeed;
  vehicle.minSpeed = minSpeed;
  vehicle.boundingRadius = 0.8;
  vehicle.constructor = team;


  // Store the path in the vehicle

  // Setup vehicle steering
  const followPathBehavior = new YUKA.FollowPathBehavior(path, 4);
  vehicle.steering.add(followPathBehavior);

  const onPathBehavior = new YUKA.OnPathBehavior(path); // can change radius and predictor factor dont know how they work yet 0.1 and 1 are default
  vehicle.steering.add(onPathBehavior);

  // Create visual markers for each path point
  const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  for (const point of path._waypoints) {
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(point);
    scene.add(marker);
  }


  // Setup vehicle render component
  const loader1 = new GLTFLoader();
  loader1.load('./assets/car.glb', function (glb) {
    const model = glb.scene;
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshStandardMaterial({ color: team });
      }
    });

    scene.add(model);
    model.matrixAutoUpdate = false;
    vehicle.rotateTo(path.current(), true);
    vehicle.scale = new YUKA.Vector3(1, 1, 1);
    vehicle.setRenderComponent(model, sync);
  });

  return vehicle;
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
