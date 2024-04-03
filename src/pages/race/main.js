// Imports
import * as THREE from 'three';
import * as YUKA from 'yuka';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { track2, track2Pit } from './trackPaths.js';
import * as brain from 'brain.js';
import data from './trained_network.json';

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

// Set camera position and look at the scene
camera.position.set(100, 330, 120);
camera.lookAt(scene.position);

// Setup lights
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// Load the GLTF model of the track
const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/node_modules/three/examples/jsm/libs/draco/');
 
loader.setDRACOLoader( dracoLoader );
loader.load(`../assets/${MODEL}`, function (gltf) {
  const model = gltf.scene;
  scene.add(model);
});

// Vehicle setup and entity manager
const entityManager = new YUKA.EntityManager();

const vehicle1 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'red', startPos: 1, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle1);

const vehicle2 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'blue', startPos: 2, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle2);

const vehicle3 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'red', startPos: 3, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle3);

const vehicle4 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'yellow', startPos: 4, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle4);

const vehicle5 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'blue', startPos: 5, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle5);

const vehicle6 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'lightblue', startPos: 6, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle6);

const vehicle7 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'lightblue', startPos: 7, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle7);

const vehicle8 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'yellow', startPos: 8, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle8);

const vehicle9 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'green', startPos: 9, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle9);

const vehicle10 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'green', startPos: 10, model: CAR, track: TRACK, tyre: tyre(0) });
entityManager.add(vehicle10);

const vehicle11 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'purple', startPos: 11, model: CAR, track: TRACK, tyre: tyre(1) });
entityManager.add(vehicle11);

const vehicle12 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'purple', startPos: 12, model: CAR, track: TRACK, tyre: tyre(1) });
entityManager.add(vehicle12);

const vehicle13 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'cyan', startPos: 13, model: CAR, track: TRACK, tyre: tyre(1) });
entityManager.add(vehicle13);

const vehicle14 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'orange', startPos: 14, model: CAR, track: TRACK, tyre: tyre(1) });
entityManager.add(vehicle14);

const vehicle15 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'pink', startPos: 15, model: CAR, track: TRACK, tyre: tyre(1) });
entityManager.add(vehicle15);

const vehicle16 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'cyan', startPos: 16, model: CAR, track: TRACK, tyre: tyre(1) });
entityManager.add(vehicle16);

const vehicle17 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'orange', startPos: 17, model: CAR, track: TRACK, tyre: tyre(2) });
entityManager.add(vehicle17);

const vehicle18 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'pink', startPos: 18, model: CAR, track: TRACK, tyre: tyre(2) });
entityManager.add(vehicle18);

const vehicle19 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'brown', startPos: 19, model: CAR, track: TRACK, tyre: tyre(2) });
entityManager.add(vehicle19);

const vehicle20 = createYukaCar({ maxSpeed: 30, pitSpeed: 10, team: 'brown', startPos: 20, model: CAR, track: TRACK, tyre: tyre(2) });
entityManager.add(vehicle20);

// Add vehicles to the vehicles array
const vehicles = [vehicle1, vehicle2, vehicle3, vehicle4, vehicle5, vehicle6, vehicle7, vehicle8, vehicle9, vehicle10, vehicle11, vehicle12, vehicle13, vehicle14, vehicle15, vehicle16, vehicle17, vehicle18, vehicle19, vehicle20]; // Add more vehicles if needed

// Setup time
const time = new YUKA.Time();

// Sync the YUKA vehicle with the Three.js model
function sync(entity, renderComponent) {
  renderComponent.matrix.copy(entity.worldMatrix);
}

// Pitstop decision function using the trained neural network
function pitStopDecision(vehicle) {
  // Load the trained neural network
  const net = new brain.NeuralNetwork();
  net.fromJSON(data);

  // Prepare the data for the neural network
  const newData = {
    lapsLeft: (20 - vehicle.lapNumber) / 20,
    tyreUsed: vehicle.tyre.name === 'Soft' ? 0.1 : (vehicle.tyre.name === 'Medium' ? 0.2 : 0.3),
    tyreLifeLeft: vehicle.tyre.life / 100,
  };

  // Run the neural network to make a prediction
  const prediction = net.run(newData);
  // If the prediction is above 0.5, do the pitstop logic
  if (prediction.pitstop > 0.5) {
    // Make a decision based on the highest probability of the next tyre
    var nextTyre;
    if (prediction.nextTyreSoft > prediction.nextTyreMedium && prediction.nextTyreSoft > prediction.nextTyreHard) {
      nextTyre = tyre(0);
    } else if (prediction.nextTyreMedium > prediction.nextTyreSoft && prediction.nextTyreMedium > prediction.nextTyreHard) {
      nextTyre = tyre(1);
    } else if (prediction.nextTyreHard > prediction.nextTyreSoft && prediction.nextTyreHard > prediction.nextTyreMedium) {
      nextTyre = tyre(2);
    }
    if (!vehicle.pitstop) {
      // Add the pitstop path to the vehicle
      for (let point of track2Pit) {
        vehicle.path.add(new YUKA.Vector3(point.x, point.y, point.z));
      }
      vehicle.pitstop = true;
      vehicle.pitstopTyre = nextTyre;
    }
  }
}

// Getters
const leaderboardElement = document.getElementById('leaderboard');
const zoomOutButton = document.getElementById('zoom-out-btn');
const zoomInButton = document.getElementById('zoom-in-btn');

// Setters
let raceStartTime;
let zoom = true;
const obsticles = entityManager.entities;
let raceFinished = false;
let totalLaps = 21;
// Set the original path for each vehicle
for (const vehicle of vehicles) {
  vehicle.originalPath = structuredClone(vehicle.path);
}

// Animate the scene 
function animate() {
  // If race has not started, display the vehicles in the starting grid
  if (raceStart === false) {
    entityManager.update(0)
    camera.position.copy(vehicles[0].position).add(new THREE.Vector3(5, 25, 10));
    renderer.render(scene, camera)
    vehicles.forEach(vehicle => {
      vehicle.maxSpeed = 0
    })
  } else {
    // Update for start of each frame
    raceStartTime = raceStartTime || Date.now();
    const delta = time.update().getDelta();
    entityManager.update(delta);

    // Sort the vehicles by position on the track
    const sortedVehicles = vehicles.slice().sort((a, b) => {
      const lapDifference = b.lapNumber - a.lapNumber;

      // If the vehicles are on different laps, sort by lap
      if (lapDifference !== 0) {
        return lapDifference;
      }

      // If the vehicles are on the same lap, sort by path index
      const indexDifference = b.path._index - a.path._index;

      // If the vehicles are on different path indexes within the same lap, sort by path index
      if (indexDifference !== 0) {
        return indexDifference;
      }

      // Vehicles are on the same lap and path index, sort by distance to the next waypoint
      const distanceToWaypoint = a.position.distanceTo(a.path.current()) - b.position.distanceTo(b.path.current());

      return distanceToWaypoint;
    });

    if (!raceFinished && sortedVehicles[0].lapNumber >= totalLaps) {
      // Mark race as finished to avoid displaying the message multiple times
      raceFinished = true;

      // Stop the animation loop
      renderer.setAnimationLoop(null);

      // Get the winner (vehicle with the most laps completed)
      const winner = sortedVehicles[0];

      // Display race completion message
      const message =
        `
        <h2 style="font-size: 28px; color: white;">Race Finished!</h2>
        <p style="font-size: 20px; color: white;">Winner: ${winner.constructor} ${winner.startPos}</p>
        <p style="font-size: 20px; color: white;">Lap Time: ${winner.bestLapTime.toFixed(2)} seconds</p>
        <p style="font-size: 20px; color: white;">Total Time: ${raceTimer()} seconds</p>
      `;
      leaderboardElement.innerHTML = message;
      return;
    }

    // Zoom in and out
    zoomOutButton.addEventListener('click', () => {
      zoom = false;
    });

    zoomInButton.addEventListener('click', () => {
      zoom = true;
    });

    // Set the camera position based on the zoom level
    if (zoom) {
      camera.position.copy(sortedVehicles[0].position).add(new THREE.Vector3(5, 25, 10));
    } else {
      camera.position.copy(sortedVehicles[0].position).add(new THREE.Vector3(75, 100, 50));
    }

    // Loop through each vehicle to update their behavior
    for (const vehicle of vehicles) {
      // Add each vehicle as an obstacle for each other vehicle
      const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(obsticles);
      obstacleAvoidanceBehavior.dBoxMinLength = 2.5;
      obstacleAvoidanceBehavior.brakingWeight = 0.2;
      vehicle.steering.add(obstacleAvoidanceBehavior);

      // Update tyre wear
      tyreWear(vehicle, delta);

      // Pitstop logic
      const threshold = 5;

      // Check if the vehicle is in the pitstop
      const startPosition = new YUKA.Vector3(track2Pit[0].x, track2Pit[0].y, track2Pit[0].z);
      if (vehicle.position.distanceTo(startPosition) < threshold && !vehicle.inPit) {
        vehicle.maxSpeed = vehicle.pitSpeed;
        vehicle.inPit = true;
        vehicle.outPit = false;
      }

      // Check if the vehicle is close to the ending point of the pitstop
      const endPosition = new YUKA.Vector3(track2Pit[track2Pit.length - 1].x, track2Pit[track2Pit.length - 1].y, track2Pit[track2Pit.length - 1].z);
      if (vehicle.position.distanceTo(endPosition) < threshold && !vehicle.outPit) {
        vehicle.maxSpeed = vehicle.speedForPit;
        vehicle.path.clear(); // Clear the current path
        for (const point of vehicle.originalPath._waypoints) {
          vehicle.path.add(new YUKA.Vector3(point.x, point.y, point.z)); // Add points from the original path
        }
        vehicle.pitstop = false;
        vehicle.tyre = vehicle.pitstopTyre;
        vehicle.pitstopTyre = 0;
        vehicle.path.advance();
        vehicle.inPit = false;
        vehicle.outPit = true;
      }
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
        if (vehicle.inPit === false) { pitStopDecision(vehicle) }
      }

      // Reset the flag when the vehicle moves away from the finish line
      if (vehicle.path._index !== 0) {
        vehicle.crossedFinishLine = false;
        vehicle.crossPitLine = false;
      }
    }

    // Leaderboard to display race positions along with car information
    leaderboardElement.innerHTML =
      `
    <h2 style="font-size: 18px; color: white;">Race Time: ${raceTimer()} s</h2>
    <div class="leaderboard-container" style="font-size: 18px;">
      <div class="header">
        <span class="position" style="color: white;">Pos</span>
        <span class="lap">Lap</span>
        <span class="speed">Speed</span>
        <span class="tyre">Tyre Info</span>
        <span class="car-number">Car No</span>
        <span class="constructor">Constructor</span>
        <span class="best-lap">Best Lap</span>
      </div>
      <ul class="leaderboard" style="list-style-type: none; padding: 0;">
        ${sortedVehicles.map((vehicle, index) => `
          <li class="leaderboard-item" style="background-color: rgba(255, 255, 255, 0.1); margin: 5px 0; padding: 4px;">
            <span class="position-circle" style="font-size: 18px; background-color: white; border-radius: 50%; padding: 5px; margin-right: 10px; color: black;">${index + 1}</span>
            <span class="lap">${vehicle.lapNumber}</span>
            <span class="speed">${(vehicle.velocity.length()).toFixed(0)} km/h</span>
            <span class="tyre">${vehicle.tyre.name} </span>
            <span class="tyre-wear">${vehicle.tyre.life.toFixed(0)}% </span>
            <span class="car-number">${vehicle.startPos}</span>
            <span class="constructor">${vehicle.constructor}</span>
            <span class="best-lap">${vehicle.bestLapTime.toFixed(2)} s</span>
          </li>
        `).join('')}
      </ul>
    </div>
    `;
    // Render the scene with the updated camera based on the zoom level
    renderer.render(scene, camera);
  }
}

// ---------------------------------- Helper Functions ---------------------------------- 

// Tyre object with properties for tyre life, wear, grip, and name
//
// Parameters:
// num - The tyre number (0 for Soft, 1 for Medium, 2 for Hard)
//
// Returns:
// tyre - The tyre object with properties for tyre life, wear, grip, and name

function tyre(num) {
  const tyre = new Object();
  tyre.life = 100;
  if (num === 0) {
    tyre.name = "Soft";
    tyre.wear = 0.0010;
    tyre.grip = 80;
  }
  if (num === 1) {
    tyre.name = "Medium";
    tyre.wear = 0.0007;
    tyre.grip = 65;
  }
  if (num === 2) {
    tyre.name = "Hard";
    tyre.wear = 0.0005;
    tyre.grip = 50;
  }
  return tyre;
}

// Tyre wear function to simulate tyre wear
//
// Parameters:
// vehicle - The vehicle object
// deltaTime - The time difference between the current and previous frame
function tyreWear(vehicle, deltaTime) {
  if (deltaTime > 0.1) deltaTime = 0.1; // Cap the maximum deltaTime to avoid large spikes in wear (e.g. when the game is paused for the start)
  const wearRate = vehicle.tyre.wear + Math.random() * 0.00002; // Randomize the wear rate slightly 
  const maxLife = 100; // Maximum tyre life
  const minLife = 0; // Minimum tyre life (end of life)

  // Calculate the amount of wear based on the wear rate and time
  const wearAmount = wearRate * deltaTime * 200;

  // Reduce the tyre's life by the wear amount
  vehicle.tyre.life -= wearAmount;

  // Degradation of tyre grip
  tyreDegradation(vehicle, Date.now());

  // Ensure the tyre's life stays within bounds
  vehicle.tyre.life = Math.max(minLife, vehicle.tyre.life);
  vehicle.tyre.life = Math.min(maxLife, vehicle.tyre.life);
}

// Degradation of tyre grip based on tyre wear
//
// Parameters:
// vehicle - The vehicle object
function tyreDegradation(vehicle) {
  // Tyre wear and grip settings
  const tyreWear = vehicle.tyre.life;
  const tyreGrip = vehicle.tyre.grip;

  // Adjust the maximum speed based on the tyre's life except when the vehicle is in the pit
  if (vehicle.inPit) {
    vehicle.maxSpeed = 10;
  } else if (tyreWear >= 80) {
    vehicle.maxSpeed = 30 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 75) {
    vehicle.maxSpeed = 29.75 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 70) {
    vehicle.maxSpeed = 29.5 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 65) {
    vehicle.maxSpeed = 29.25 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 60) {
    vehicle.maxSpeed = 29 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 55) {
    vehicle.maxSpeed = 28.75 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 50) {
    vehicle.maxSpeed = 28.5 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 45) {
    vehicle.maxSpeed = 28.25 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 40) {
    vehicle.maxSpeed = 28 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else if (tyreWear >= 35) {
    vehicle.maxSpeed = 27 - ((100 - tyreGrip * 3) / 100) + Math.random() * 0.5;
  } else {
    // Below 35% tyre life, apply further reductions gradually
    const reductionFactor = (35 - tyreWear) / 100; // Linearly reduce the max speed
    vehicle.maxSpeed = 27 - 8 - ((100 - tyreGrip) / 100) * reductionFactor; // Linearly reduce from 25 to 12 as tyre life decreases from 35 to 0
  }
}

// Car object creation function which creates a new YUKA vehicle object and loads the 3D model of the object
//
// Parameters:
// maxSpeed - The maximum speed of the car
// pitSpeed - The speed of the car in the pit
// team - The constructor of the car
// startPos - The starting position of the car
// model - The 3D model of the car
// track - The track path for the car to follow
// tyre - The start tyre object for the car
//
// Returns:
// vehicle - The car object with the specified properties
function createYukaCar({ maxSpeed, pitSpeed, team, startPos, model, track, tyre }) {
  // Setup track path
  const path2 = new YUKA.Path();
  for (let point of track) {
    path2.add(new YUKA.Vector3(point.x, point.y, point.z));
  }
  path2.loop = true;

  // Setup vehicle
  const vehicle = new YUKA.Vehicle();
  vehicle.position.copy(path2.current());
  vehicle.maxSpeed = maxSpeed;
  vehicle.speedForPit = maxSpeed;
  vehicle.pitSpeed = pitSpeed;
  vehicle.tyre = tyre;
  vehicle.tyreTemp = Math.random();
  vehicle.boundingRadius = 0.8;
  vehicle.constructor = team;
  vehicle.pitstop = false;
  vehicle.inPit = false;
  vehicle.outPit = true;
  vehicle.pitstopTyre = 0;
  vehicle.crossPitLine = false;
  vehicle.startPos = startPos;

  // Add a smoother to the vehicle to smooth out the steering
  vehicle.smoother = new YUKA.Smoother(1);

  // Store the path in the vehicle
  vehicle.path = path2;
  vehicle.originalPath;

  // Add a property to keep track of the start time of the current lap
  vehicle.currentLapStartTime = Date.now();
  vehicle.lapNumber = 0;
  vehicle.bestLapTime = 0;

  // Set the grid position on the starting grid alternating between the left and right side of the track
  if (startPos % 2 === 0) {
    vehicle.position.add(new YUKA.Vector3(-startPos * 4 - 4, 0, 3));
  } else {
    vehicle.position.add(new YUKA.Vector3(-startPos * 4 - 4, 0, -3));
  }

  // Setup vehicle steering behaviors to follow the path
  const followPathBehavior = new YUKA.FollowPathBehavior(vehicle.path, 4);
  vehicle.steering.add(followPathBehavior);

  // Setup vehicle on path behavior to keep the vehicle on the track
  const onPathBehavior = new YUKA.OnPathBehavior(vehicle.path);
  vehicle.steering.add(onPathBehavior);

  // Setup vehicle render component
  const loader1 = new GLTFLoader();

  // Load the 3D model of the car
  loader1.load(`../assets/${model}`, function (glb) {
    const model = glb.scene;
    // Set the car color based on the team color (constructor) 
    model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshStandardMaterial({ color: team });
      }
    });

    // Add the car model to the scene and set scale and rotation
    scene.add(model);
    model.matrixAutoUpdate = false;
    vehicle.rotateTo(vehicle.path.current(), true);
    vehicle.scale.set(0.8, 0.8, 0.8);
    // Sync the vehicle with the model for rendering
    vehicle.setRenderComponent(model, sync);
  });

  // Return the vehicle object
  return vehicle;
}

// Race timer function to calculate the time
//
// Returns:
// The elapsed race time in seconds 
function raceTimer() {
  return ((Date.now() - raceStartTime) / 1000);
}

// Race start flag 
let raceStart = false;
// Start the animation loop
renderer.setAnimationLoop(animate);

// On start button click start race and remove the button
document.getElementById('start-btn').addEventListener('click', function () {
  // Start the race animation by setting the raceStart flag to true
  raceStart = true;

  // Remove the start button
  const startButton = document.getElementById('start-button-container');
  startButton.parentNode.removeChild(startButton);
});

// Resize the renderer when the window is resized
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});