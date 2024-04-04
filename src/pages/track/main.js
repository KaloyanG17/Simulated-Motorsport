import * as track from '../trackPaths.js'

const map1 = document.querySelector('.map');
let prevPoint;
track.path1.forEach(point => {
   const pointElem = document.createElement('div');
   pointElem.classList.add('point');
   pointElem.style.left = `${point.x}px`;
   pointElem.style.top = `${point.z}px`;
   map1.appendChild(pointElem);

   if (prevPoint) {
      const line = document.createElement('div');
      line.classList.add('line');
      const distance = Math.sqrt(Math.pow(prevPoint.x - point.x, 2) + Math.pow(prevPoint.z - point.z, 2));
      const angle = Math.atan2(point.z - prevPoint.z, point.x - prevPoint.x) * 180 / Math.PI;
      line.style.width = `${distance}px`;
      line.style.transform = `rotate(${angle}deg)`;
      line.style.left = `${prevPoint.x}px`;
      line.style.top = `${prevPoint.z}px`;
      map1.appendChild(line);
   }

   prevPoint = point;
});