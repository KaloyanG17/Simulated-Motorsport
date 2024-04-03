// Imports (Use require because of Node.js)
const { NeuralNetwork } = require('brain.js');
const brain = require('brain.js');
const data = require('./trained_network.json');

// Create a new neural network
const net = new brain.NeuralNetwork();
// Load the trained neural network from the JSON file
net.fromJSON(data);

// Test data to be passed to the neural network
const testData = [
    // Edge case with low tyre life left
    {
        lapsLeft: 5 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 1 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 2 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 30 / 100
    },
    {
        lapsLeft: 3 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 4 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 5 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 6 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    // Edge case with high tyre life left
    {
        lapsLeft: 18 / 20,
        tyreUsed: 0.2,
        tyreLifeLeft: 90 / 100
    },
    // Edge case with maximum lap count
    {
        lapsLeft: 20 / 20,
        tyreUsed: 0.2,
        tyreLifeLeft: 30 / 100
    },
    // Normal case with different tire usage
    {
        lapsLeft: 8 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 30 / 100
    },
    {
        lapsLeft: 12 / 20,
        tyreUsed: 0.2,
        tyreLifeLeft: 50 / 100
    },
    {
        lapsLeft: 15 / 20,
        tyreUsed: 0.3,
        tyreLifeLeft: 70 / 100
    },
    {
        lapsLeft: 10 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 16 / 20,
        tyreUsed: 0.2,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 18 / 20,
        tyreUsed: 0.3,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 13 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 17 / 20,
        tyreUsed: 0.2,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 19 / 20,
        tyreUsed: 0.3,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 14 / 20,
        tyreUsed: 0.1,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 18 / 20,
        tyreUsed: 0.2,
        tyreLifeLeft: 10 / 100
    },
    {
        lapsLeft: 19 / 20,
        tyreUsed: 0.3,
        tyreLifeLeft: 10 / 100
    }
];

// Function to run the neural network with test data
function runTests() {
    testData.forEach((newData, index) => {
        console.log(`Test Case ${index + 1}:`);
        // Run the neural network with the test data
        const prediction = net.run(newData);
        // Output prediction and prediction duration
        console.log("Lap Number:", 20 - newData.lapsLeft * 20, " Tyre Used:", newData.tyreUsed === 0.1 ? 'Soft' : (newData.tyreUsed === 0.2 ? 'Medium' : 'Hard'), " Tyre Life Left:", newData.tyreLifeLeft * 100);
        console.log("Should pit:", prediction.pitstop > 0.5 ? "Yes" : "No", ", with confidence:", prediction.pitstop);
        console.log("Soft:", prediction.nextTyreSoft, "Medium:", prediction.nextTyreMedium, "Hard:", prediction.nextTyreHard);
        console.log('----------------------');
    });
}

// Run the tests
runTests();
