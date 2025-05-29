const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const router = express.Router();

let josaaData = [], csabData = [];
let csvLoaded = false;

/**
 * Load CSV data from local file path into dataset array
 */
function loadCSVFromFile(filePath, dataset) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.replace(/^\uFEFF/, '').replace(/^"+|"+$/g, '')
      }))
      .on('data', row => {
        dataset.push({
          ...row,
          source: filePath.includes('josaa') ? 'JOSAA' : 'CSAB',
        });
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

/**
 * Middleware to ensure CSV data is loaded once before first request
 */
async function ensureCSVDataLoaded(req, res, next) {
  if (csvLoaded) return next();

  try {
    await Promise.all([
      loadCSVFromFile(path.join(__dirname, '../public/csab_cutoffs_2024.csv'), csabData),
      loadCSVFromFile(path.join(__dirname, '../public/josaa_cutoffs_2024.csv'), josaaData),
    ]);
    csvLoaded = true;
    console.log('CSV data loaded successfully');
    next();
  } catch (err) {
    console.error('Error loading CSV data:', err);
    return res.status(500).json({ error: 'Failed to load cutoff data.' });
  }
}

/**
 * Filter colleges based on criteria
 */
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

/**
 * POST /api/predictor
 */
router.post('/', ensureCSVDataLoaded, (req, res) => {
  const { rank, category, homeState, gender, branchPreference } = req.body;
  const quota = homeState ? 'HS' : 'OS';

  const josaaMatches = getEligibleColleges(rank, category, quota, gender, branchPreference, josaaData);
  const csabMatches = getEligibleColleges(rank, category, quota, gender, branchPreference, csabData);

  const merged = [...josaaMatches, ...csabMatches];
  const ranked = merged.sort((a, b) => parseInt(a['Closing Rank']) - parseInt(b['Closing Rank']));

  res.json({
    best: ranked[0] || null,
    all: ranked.slice(0, 30),
  });
});

module.exports = router;
