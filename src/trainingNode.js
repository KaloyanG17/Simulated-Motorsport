// Imports (Use require becuase of Node.js)
const fs = require('fs');

// Format the file if it is empty
if (fs.readFileSync('race_data.json', 'utf8') === '') {
   fs.writeFileSync('race_data.json', '[]');
}

// Tyre class
class Tyre {
   constructor(name, wear, grip) {
      this.name = name;
      this.wear = wear;
      this.grip = grip;
   }
}

// Car class
//
// Properties:
// maxSpeed: Maximum speed of the car
// tyre: Tyre object
// lapNumber: Number of laps completed
// pitStopInfo: Array of pit stop information
// numOfPitStops: Number of pit stops
// tyreLife: Remaining tyre life
// raceTime: Total time taken to complete
//
// Methods:
// wearTyre: Simulate tyre wear
// runLap: Simulate a lap
// changeTyre: Change the tyre
//
class Car {
   // Constructor to initialize car properties
   constructor(maxSpeed, tyre) {
      this.maxSpeed = maxSpeed;
      this.tyre = tyre;
      this.lapNumber = 0;
      this.pitStopInfo = [];
      this.numOfPitStops = 0;
      this.tyreLife = 100;
      this.raceTime = 0;
   }

   // Method to simulate tyre wear
   wearTyre(deltaTime) {
      // Calculate tyre wear
      const wearRate = this.tyre.wear;
      // Calculate wear amount based on wear rate and time plus a random factor between 0 and 0.25
      const wearAmount = (wearRate * deltaTime) + (Math.random() * 0.25);
      // Reduce tyre life
      this.tyreLife -= wearAmount;
      // Ensure tyre life is not negative
      this.tyreLife = Math.max(0, this.tyreLife);
   }

   // Method to simulate a lap
   runLap() {
      var lapTime;
      // Calculate lap time based on tyre life and tyre grip
      const gripEffect = 1 - this.tyre.grip; // Inverse grip effect: closer to 1 means faster
      const gripAdjustedTime = gripEffect * 4; // Adjust lap time based on grip
      if (this.tyreLife > 60) {
         lapTime = 60 * (1 + (100 - this.tyreLife) / 1000) + gripAdjustedTime + (Math.random() + ((1 - 0.5 + 1) + 0.5));
      } else if (this.tyreLife > 40) {
         lapTime = 60 * (1 + (100 - this.tyreLife) / 1000) + gripAdjustedTime * 1.5 + (Math.random() + ((1 - 0.5 + 1) + 0.5) * 1.5);
      } else if (this.tyreLife > 20) {
         lapTime = 60 * (1 + (100 - this.tyreLife) / 1000) + gripAdjustedTime * 2 + (Math.random() + ((1 - 0.5 + 1) + 0.5) * 2);
      } else {
         lapTime = 60 * (1 + (100 - this.tyreLife) / 1000) + gripAdjustedTime * 4 + (Math.random() + ((1 - 0.5 + 1) + 0.5) * 4);
      }
      this.raceTime += lapTime;
      this.lapNumber++;
      this.wearTyre(lapTime * 5);
   }

   // Method to change the tyre
   changeTyre(newTyre) {
      this.tyre = newTyre;
      this.tyreLife = 100;
      this.numOfPitStops++;
   }
}

// Function to simulate the race
//
// Parameters:
// car: Car object
// totalLaps: Number of laps in the
// pitLaps: Array of lap numbers where the car should pit
// tyreOptions: Array of tyre options
function simulateRace(car, totalLaps, pitLaps, tyreOptions) {
   // Lap interval to simulate each lap
   const lapInterval = setInterval(() => {
      // Run a lap and increment lap counter
      car.runLap();
      // Check for race finish
      if (car.lapNumber >= totalLaps) {
         // Stop the race when laps are completed
         clearInterval(lapInterval);
         // Save the data to a file
         const data = {
            racingLaps: car.lapNumber,
            pitStopInfo: car.pitStopInfo,
            tyreLife: car.tyreLife.toFixed(2),
            tyreWear: car.tyre.wear,
            tyreUsed: car.tyre.name,
            numOfPitStops: car.numOfPitStops,
            totalTime: car.raceTime.toFixed(2)
         };
         // Read existing data from the file
         const existingData = JSON.parse(fs.readFileSync('race_data.json', 'utf8'));
         // Append the new data to the existing data array
         existingData.push(data);
         // Write the updated data back to the file
         fs.writeFileSync('race_data.json', JSON.stringify(existingData, null, 2));

      }

      // Pit stop logic
      if (pitLaps.includes(car.lapNumber)) {
         // Add Pit stop time to the race time with it being random between 25 and 30 seconds
         car.raceTime += Math.floor(Math.random() * (30 - 25 + 1) + 25);
         // Add pit stop lap to the pitLapInfo array
         const newTyre = tyreOptions[Math.floor(Math.random() * tyreOptions.length)];
         const pitStopInfo = {
            lap: car.lapNumber,
            tyre: { type: car.tyre.name, lifeLeft: car.tyreLife.toFixed(2) },
            newTyre: newTyre.name,
         };
         car.pitStopInfo.push(pitStopInfo);
         car.changeTyre(newTyre);
         // Reset tyre life after pit stop
         car.tyreLife = 100;
      }
   }, 0);
}

// Function to run multiple simulations with different pit stop strategies
//
// Parameters:
// iterations: Number of simulations to run
// minNumberofPits: Minimum number of pits
// maxNumberofPits: Maximum number of pits
// maxLaps: Maximum number of laps
// tyreOptions: Array of tyre options
function runMultipleSimulations(iterations, minNumberofPits, maxNumberofPits, maxLaps, tyreOptions) {
   for (let i = 0; i < iterations; i++) {
      const car = new Car(30, tyreOptions[Math.floor(Math.random() * tyreOptions.length)]);
      var pitTimes;
      var pitLaps = [];

      pitTimes = Math.floor(Math.random() * (maxNumberofPits - minNumberofPits + 1) + 1);

      for (let j = 0; j < pitTimes; j++) {
         pitLaps.push(Math.floor(Math.random() * (maxLaps - 1 + 1) + 1));
      }
      simulateRace(car, maxLaps, pitLaps, tyreOptions);
   }
}

// Tyre options
const tyreOptions = [
   new Tyre('Soft', 0.022, 0.9),
   new Tyre('Medium', 0.017, 0.72),
   new Tyre('Hard', 0.015, 0.57)
];


// Call the function with desired parameters
const iterations = 10000;
const maxNumberofPits = 3;
const minNumberofPits = 1;
const maxLaps = 20;

// Run the simulations with the given parameters and tyre options 
runMultipleSimulations(iterations, minNumberofPits, maxNumberofPits, maxLaps, tyreOptions)