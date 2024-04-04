// Imports (Use require becuase of Node.js)
const { NeuralNetwork } = require('brain.js');
const brain = require('brain.js');
const { log } = require('console');
const fs = require('fs');

// Read race data from file
fs.readFile('race_data.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading race data file:', err);
        return;
    }

    // Time counter
    const startTime = new Date();

    // Parse the JSON data 
    const raceDataArray = JSON.parse(data);

    // Data Preprocessing
    const trainingData = [];
    raceDataArray.forEach(raceData => {
        raceData.pitStopInfo.forEach(pitStop => {
            // Skip if no pit stops were made 
            if (pitStop.numOfPits === 0) {
                return;
            }
            // Data to be passed to the neural network and normalized between 0 and 1
            const inputData = {
                lapsLeft: (parseFloat(raceData.racingLaps) - pitStop.lap) / 20,
                tyreUsed: (pitStop.tyre.type === 'Soft' ? 0.1 : (pitStop.tyre.type === 'Medium' ? 0.2 : 0.3)),
                tyreLifeLeft: (parseFloat(pitStop.tyre.lifeLeft)) / 100
            };
            // Change the time to get a better result but can lack accuracy
            const timeToBeat = 1360;
            // Output data to be predicted by the neural network and normalized between 0 and 1
            const outputData = { pitstop: parseFloat(raceData.totalTime) > timeToBeat ? 0 : 1, nextTyreSoft: pitStop.newTyre === 'Soft' ? 1 : 0, nextTyreMedium: pitStop.newTyre === 'Medium' ? 1 : 0, nextTyreHard: pitStop.newTyre === 'Hard' ? 1 : 0 };
            // Push the data to the training data array 
            trainingData.push({ input: inputData, output: outputData });
        });
    });

    // Neural Network Configuration
    const config = {
        iterations: 10000,
        errorThresh: 0.005,
        learningRate: 0.1,
        hiddenLayers: [6, 6],
    };

    // Create a neural network
    const net = new brain.NeuralNetwork(config);

    // Train the network
    net.train(trainingData);

    // Example usage to predict whether to pit or not
    const newData = {
        lapsLeft: 8 / 20,
        tyreUsed: 0.2,
        tyreLifeLeft: 30 / 100
    };

    // Run the neural network with the test data
    const prediction = net.run(newData);

    // Time counter end
    const endTime = new Date();
    const duration = endTime - startTime;

    console.log("Data Passed to the Neural Network:", newData);

    // Get the highest predicted next tyre
    if (prediction.nextTyreSoft > prediction.nextTyreMedium && prediction.nextTyreSoft > prediction.nextTyreHard) {
        console.log('Pit for Soft');
    } else if (prediction.nextTyreMedium > prediction.nextTyreSoft && prediction.nextTyreMedium > prediction.nextTyreHard) {
        console.log('Pit for Medium');
    } else if (prediction.nextTyreHard > prediction.nextTyreSoft && prediction.nextTyreHard > prediction.nextTyreMedium) {
        console.log('Pit for Hard');
    }

    // Output prediction and prediction duration
    console.log("Lap Number:", 20 - newData.lapsLeft * 20, " Tyre Used:", newData.tyreUsed === 0.1 ? 'Soft' : (newData.tyreUsed === 0.2 ? 'Medium' : 'Hard'), " Tyre Life Left:", newData.tyreLifeLeft * 100);
    console.log("Should pit:", prediction.pitstop > 0.5 ? "Yes" : "No", ", with confidence:", prediction.pitstop);
    console.log("Soft:", prediction.nextTyreSoft, "Medium:", prediction.nextTyreMedium, "Hard:", prediction.nextTyreHard);
    console.log("Prediction duration:", duration, "milliseconds");

    // Save the trained network to a JSON file
    fs.writeFileSync('trained_network.json', JSON.stringify(net.toJSON(), null, 2));
    console.log('Trained network saved to file');
});