const fs = require('fs');

const data = JSON.parse(fs.readFileSync('branchOptions.json', 'utf8'));

// Split the string into individual options
const branchLabels = data[0].label.split('\n');
const branchValues = data[0].value.split('\n');

// Create an array of structured objects
const corrected = branchLabels.map((label, index) => ({
  label: label.trim(),
  value: branchValues[index].trim(),
}));

// Output to a new JSON file
fs.writeFileSync('correctedBranchOptions.json', JSON.stringify(corrected, null, 2));
