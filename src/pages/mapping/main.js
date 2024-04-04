// Imports
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const MODEL = 'track2.glb';
const CAR = 'car.glb';

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

// Load the GLTF model of the track
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader( dracoLoader );
// Remove some objects from the scene that are in the way of the track
const toRemove =[
  "prop_cone001","prop_cone002","prop_cone003","prop_cone004","prop_cone005","prop_cone006","prop_cone007","prop_cone008",
  "prop_cone009","prop_cone010","prop_cone011","prop_cone012","prop_cone013","prop_cone014","prop_cone015","prop_cone016",
  "prop_cone055","prop_cone056","prop_cone057","prop_cone058","prop_cone059","prop_cone060","prop_cone061","prop_cone062","prop_cone063","prop_cone064",
  "wall_a_195","wall_a_196","wall_a_197","wall_a_198","wall_a_199","wall_a_200","wall_a_201","wall_a_202","wall_a_203","wall_a_204","wall_a_205",
  "wall_a_210","wall_a_209","wall_a_208","wall_a_207","wall_a_206",
   "plastic_barrier_119","plastic_barrier_118","plastic_barrier_117","plastic_barrier_116","plastic_barrier_115","plastic_barrier_120","plastic_barrier_121","plastic_barrier_122",
   "prop_cone017","prop_cone018","prop_cone019","prop_cone020","prop_cone021","prop_cone022","prop_cone023","prop_cone024","prop_cone025",
    "prop_cone026","prop_cone027","prop_cone028","prop_cone029","prop_cone030",
   "prop_cone048","prop_cone049","prop_cone050","prop_cone051","prop_cone052","prop_cone053","prop_cone054",
   "plastic_barrier_110","plastic_barrier_111","plastic_barrier_112","plastic_barrier_113","plastic_barrier_114",

];

loader.load(`../assets/${MODEL}`, function (gltf) {
  const model = gltf.scene;
  let childRemove = []
  model.traverse(function (child) {
    if (toRemove.includes(child.name)){
      console.log(child.name)
      childRemove.push(child);
    }
  });
  childRemove.forEach((child) => {
    child.removeFromParent();
  });
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


function createYukaCar({ maxSpeed, minSpeed, team, startPos, model = CAR}) {
  // Setup track path
  const path = new YUKA.Path();
  path.add(new YUKA.Vector3(10, 0, -27));
  path.add(new YUKA.Vector3(100, 0, -27));
  path.add(new YUKA.Vector3(125, 1, -50));
  path.add(new YUKA.Vector3(147, 1, -100));
  path.add(new YUKA.Vector3(185, 1, -190));
  path.add(new YUKA.Vector3(185, 0, -220));
  path.add(new YUKA.Vector3(170, 1, -240));
  path.add(new YUKA.Vector3(130, 0, -240));
  path.add(new YUKA.Vector3(107, 0, -222));
  path.add(new YUKA.Vector3(90, 0, -220));
  path.add(new YUKA.Vector3(80, 0, -230));
  path.add(new YUKA.Vector3(85, 0, -250));
  path.add(new YUKA.Vector3(90, 0, -255));
  path.add(new YUKA.Vector3(100, 0, -262));
  path.add(new YUKA.Vector3(110, 0, -290));
  path.add(new YUKA.Vector3(90, 0, -293));
  path.add(new YUKA.Vector3(-170, 1, -293));
  // path.add(new YUKA.Vector3(-140, 0, -185));
  // path.add(new YUKA.Vector3(-140, 0, -235));
  path.loop = true;

  // Setup vehicle
  const vehicle = new YUKA.Vehicle();
  vehicle.position.copy(path.current());
  vehicle.maxSpeed = maxSpeed+10;
  vehicle.minSpeed = minSpeed;
  vehicle.boundingRadius = 0.8;
  vehicle.constructor = team;


  // Store the path in the vehicle
  vehicle.smoother = new YUKA.Smoother(1);
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
  loader1.load(`../assets/${model}`, function (glb) {
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
    vehicle.scale.set(0.8, 0.8, 0.8);
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
