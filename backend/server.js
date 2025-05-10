const express = require('express');
const cors = require('cors');
const app = express();

const predictRoute = require('./routes/predict');  // Ensure correct path to the predict.js file

app.use(cors());
app.use(express.json());

// This is where you register the route
app.use('/api/predict', predictRoute);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
