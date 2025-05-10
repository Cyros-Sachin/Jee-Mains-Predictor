const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const router = express.Router();

let josaaData = [], csabData = [];

function loadCSVData(filePath, dataset) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) =>
          header.replace(/^\uFEFF/, '').replace(/^"+|"+$/g, '') // 💥 remove BOM and " from headers
      }))
      .on('data', row => {
        dataset.push({ ...row, source: filePath.includes('josaa') ? 'JOSAA' : 'CSAB' });
      })
      .on('end', resolve)
      .on('error', reject);
  });
}



// Load JoSAA and CSAB data asynchronously
Promise.all([
  loadCSVData('./data/csab_cutoffs_2024.csv', csabData),
  loadCSVData('./data/josaa_cutoffs_2024.csv', josaaData)
])
  .then(() => console.log('CSV data loaded successfully'))
  .catch(err => console.error('Error loading CSV data:', err));

function getEligibleColleges(rank, category, quota, gender, branchPreference, dataset) {
  return dataset.filter(entry => {
    const closingRank = parseInt(entry['Closing Rank']);
    return (
      entry['Category'] === category &&
      entry['Quota'] === quota &&
      entry['Gender'] === gender &&
      (!branchPreference || entry['Academic Program Name'].toLowerCase().includes(branchPreference.toLowerCase())) &&
      rank <= closingRank
    );
  });
}

router.post('/', (req, res) => {
  const { rank, category, homeState, gender, branchPreference } = req.body;
  const quota = homeState ? 'HS' : 'OS';

  // Ensure CSV data is loaded before proceeding
  if (josaaData.length === 0 || csabData.length === 0) {
    return res.status(500).json({ error: 'Data not loaded yet, please try again shortly.' });
  }

  const josaaMatches = getEligibleColleges(rank, category, quota, gender, branchPreference, josaaData);
  const csabMatches = getEligibleColleges(rank, category, quota, gender, branchPreference, csabData);

  const merged = [...josaaMatches, ...csabMatches];

  // Rank them by closing rank
  const ranked = merged.sort((a, b) => parseInt(a['Closing Rank']) - parseInt(b['Closing Rank']));
  console.log(ranked);
  res.json({
    best: ranked[0] || null,
    all: ranked.slice(0, 30),
  });
});

module.exports = router;
