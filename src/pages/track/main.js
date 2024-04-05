import * as THREE from 'three';
import * as track from '../trackPaths.js'

function renderTrack(mapId, pathData) {
   const scene = new THREE.Scene();

   // Catch the canvas element 
   const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector(mapId),
   });

   // Set the pixel ratio
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(650, 250);

   // Setup camera
   const camera = new THREE.PerspectiveCamera(
      10,
      500 / 200, // Aspect ratio based on canvas size
      0.1,
      2000
   );

   // Setup Camera position
   camera.position.set(0, 1000, 1000);
   camera.lookAt(scene.position);

   // Setup lights
   const ambientLight = new THREE.AmbientLight(0x333333);
   scene.add(ambientLight);

   const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
   directionalLight.position.set(0, 1, 0);
   scene.add(directionalLight);
   renderer.setClearColor(0x000000);

   // Create the path lines
   const path = new THREE.Path();
   pathData.forEach(point => {
      path.lineTo(-point.x, point.z);
   });
   path.lineTo(-pathData[0].x, pathData[0].z);
   // path.closePath();
   const points = path.getPoints();
   points.splice(0, 1);


   const geometry = new THREE.BufferGeometry().setFromPoints(points);
   const material = new THREE.LineBasicMaterial({ color: 0xffffff });

   const line = new THREE.Line(geometry, material);
   line.position.y = 125;
   scene.add(line);

   renderer.render(scene, camera);
}

// Call the function with canvas ID and path data
renderTrack('#map1', track.path1);
renderTrack('#map2', track.path2);
renderTrack('#map3', track.path3);
renderTrack('#map4', track.path4);
