// Imports
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { track2, track2Pit } from '../trackPaths.js';

// Global variables
const TRACK = track2;
const MODEL = 'track2.glb';
const CAR = 'car.glb';

// Setup scene
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
renderer.setClearColor(0x000000);
// Set the background color of the scene
scene.background = new THREE.Color('darkGreen');

// Setup camera
const camera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Set the camera position
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
loader.load(`./assets/${MODEL}`, function (gltf) {
  const model = gltf.scene;
  scene.add(model);
});
// Vehicle setup
const entityManager = new YUKA.EntityManager();

const vehicle1 = createYukaCar({ maxSpeed: 29.1, minSpeed: 10, team: 'red', startPos: 1, model: CAR, track: TRACK });
entityManager.add(vehicle1);

const vehicle2 = createYukaCar({ maxSpeed: 29.1, minSpeed: 10, team: 'blue', startPos: 2, model: CAR, track: TRACK });
entityManager.add(vehicle2);

const vehicle3 = createYukaCar({ maxSpeed: 30.1, minSpeed: 10, team: 'red', startPos: 3, model: CAR, track: TRACK });
entityManager.add(vehicle3);

const vehicle4 = createYukaCar({ maxSpeed: 30.5, minSpeed: 10, team: 'white', startPos: 4, model: CAR, track: TRACK });
entityManager.add(vehicle4);

const vehicle5 = createYukaCar({ maxSpeed: 30.6, minSpeed: 10, team: 'black', startPos: 5, model: CAR, track: TRACK });
entityManager.add(vehicle5);

const vehicle6 = createYukaCar({ maxSpeed: 30.7, minSpeed: 10, team: 'blue', startPos: 6, model: CAR, track: TRACK });
entityManager.add(vehicle6);

const vehicle7 = createYukaCar({ maxSpeed: 30.5, minSpeed: 10, team: 'white', startPos: 7, model: CAR, track: TRACK });
entityManager.add(vehicle7);

const vehicle8 = createYukaCar({ maxSpeed: 31, minSpeed: 10, team: 'black', startPos: 8, model: CAR, track: TRACK });
entityManager.add(vehicle8);

const vehicle9 = createYukaCar({ maxSpeed: 31, minSpeed: 5, team: 'green', startPos: 9, model: CAR, track: TRACK });
entityManager.add(vehicle9);

const vehicle10 = createYukaCar({ maxSpeed: 31.1, minSpeed: 5, team: 'green', startPos: 10, model: CAR, track: TRACK });
entityManager.add(vehicle10);

const vehicles = [vehicle1, vehicle2, vehicle3, vehicle4, vehicle5, vehicle6, vehicle7, vehicle8, vehicle9, vehicle10]; // Add more vehicles if needed

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
const obsticles = entityManager.entities;

// Animate the scene 
function animate() {
  const delta = time.update().getDelta();
  entityManager.update(delta);

  // Sort the vehicles by position on the track
  const sortedVehicles = vehicles.slice().sort((a, b) => {
    const lapDifference = a.bestLapTime - b.bestLapTime;

    // If the vehicles are on different laps, sort by lap
    if (lapDifference !== 0) {
      return lapDifference;
    }

    const indexDifference = b.path._index - a.path._index;

    // If the vehicles are on different path indexes within the same lap, sort by path index
    if (indexDifference !== 0) {
      return indexDifference;
    }

    // Vehicles are on the same lap and path index, sort by distance to the next waypoint
    const distanceToWaypoint = a.position.distanceTo(a.path.current()) - b.position.distanceTo(b.path.current());

    return distanceToWaypoint;
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
    // Add each vehicle as an obstacle for each other vehicle
    const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(obsticles);
    obstacleAvoidanceBehavior.dBoxMinLength = 2.5;
    obstacleAvoidanceBehavior.brakingWeight = 0.2;
    vehicle.steering.add(obstacleAvoidanceBehavior);

    // FORWARD FACING TO USE LATER FOR SLIPSTREAM
    // const forward = vehicle1.forward.clone().multiplyScalar(1)

    // Check if the vehicle crossed the finish line
    if (vehicle.path._index === 0 && !vehicle.crossedFinishLine) {
      // Calculate the lap time
      const lapTime = (Date.now() - vehicle.currentLapStartTime) / 1000;

      // Update bestLapTime if the current lap time is better
      if (lapTime < vehicle.bestLapTime || vehicle.bestLapTime === 0 && vehicle.lapNumber > 0) {
        vehicle.bestLapTime = lapTime;
      }

      // Update lap information
      vehicle.lapNumber++;
      vehicle.currentLapStartTime = Date.now();

      // Mark the vehicle as crossed the finish line in the current lap
      vehicle.crossedFinishLine = true;
    }

    // Reset the flag when the vehicle moves away from the finish line
    if (vehicle.path._index !== 0) {
      vehicle.crossedFinishLine = false;
    }
  }

  // Display race positions along with car information
  leaderboardElement.innerHTML = `
  <h2>Race Time: ${raceTimer()} s</h2>
  <ul>
    ${sortedVehicles.map((vehicle, index) => `
      <li>
        Position ${index + 1} | 
        Lap ${vehicle.lapNumber} <br>
        ${(vehicle.velocity.length()).toFixed(0)} km/h | Constructer: ${(vehicle.constructor)} <br>
        Best Lap: ${vehicle.bestLapTime.toFixed(2)} s
      </li>
      <hr>
    `).join('')}
  </ul>
`;

  renderer.render(scene, camera);
}


function createYukaCar({ maxSpeed, minSpeed, team, startPos, model, track }) {
  // Setup track path
  const path = new YUKA.Path();
  for (let point of track) {
    path.add(new YUKA.Vector3(point.x, point.y, point.z));
  }
  path.loop = true;

  // Setup vehicle
  const vehicle = new YUKA.Vehicle();
  vehicle.position.copy(path.current());
  vehicle.maxSpeed = maxSpeed;
  vehicle.minSpeed = minSpeed;
  vehicle.boundingRadius = 0.8;
  vehicle.constructor = team;

  // Add a smoother to the vehicle to smooth out the steering
  vehicle.smoother = new YUKA.Smoother(1);

  // Store the path in the vehicle
  vehicle.path = path;

  // THINGS TO CHANGE
  // vehicle.mass = 3; 
  // vehicle.maxTurnRate = 1; ???
  // vehicle.maxForce = 20;// How much car can turn and accelerate 

  // Add a property to keep track of the start time of the current lap
  vehicle.currentLapStartTime = Date.now();
  vehicle.lapNumber = 0;
  vehicle.bestLapTime = 0;


  // Set vehicle start position (if odd start on left, if even start on right)
  // TRACK 1
  //  if (startPos % 2 === 0) {
  //     vehicle.position.add(new YUKA.Vector3(-6, 0, startPos*6 + 10));
  // } else {  
  //   vehicle.position.add(new YUKA.Vector3(-10, 0, startPos*6 + 10));
  // }

  if (startPos % 2 === 0) {
    vehicle.position.add(new YUKA.Vector3(-startPos * 6, 0, 3));
  } else {
    vehicle.position.add(new YUKA.Vector3(-startPos * 6, 0, -3));
  }

  // Setup vehicle steering
  const followPathBehavior = new YUKA.FollowPathBehavior(path, 4);
  vehicle.steering.add(followPathBehavior);

  const onPathBehavior = new YUKA.OnPathBehavior(path); // can change radius and predictor factor dont know how they work yet 0.1 and 1 are default
  vehicle.steering.add(onPathBehavior);

  // Setup vehicle render component
  const loader1 = new GLTFLoader();

  loader1.load(`./assets/${model}`, function (glb) {
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

function lapTimer() {
  return (Date.now() - lapStartTime) / 1000;
}

function raceTimer() {
  return ((Date.now() - raceStartTime) / 1000);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});