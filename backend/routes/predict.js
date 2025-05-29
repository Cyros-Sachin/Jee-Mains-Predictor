const express = require('express');
const csv = require('csv-parser');
const fetch = require('node-fetch');

const router = express.Router();

let josaaData = [], csabData = [];

/**
 * Load CSV data from a public URL and push into dataset array
 */
function loadCSVFromURL(url, dataset) {
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Failed to fetch CSV: ${url}`);
      return res.body;
    })
    .then(stream =>
      new Promise((resolve, reject) => {
        stream
          .pipe(csv({
            mapHeaders: ({ header }) =>
              header.replace(/^\uFEFF/, '').replace(/^"+|"+$/g, '')
          }))
          .on('data', row => {
            dataset.push({
              ...row,
              source: url.includes('josaa') ? 'JOSAA' : 'CSAB',
            });
          })
          .on('end', resolve)
          .on('error', reject);
      })
    );
}

/**
 * Middleware to ensure CSV data is loaded dynamically on first request
 */
let csvLoaded = false;
async function ensureCSVDataLoaded(req, res, next) {
  if (csvLoaded) return next();

  const baseUrl = `https://${req.headers.host}`;
  try {
    await Promise.all([
      loadCSVFromURL(`${baseUrl}/csab_cutoffs_2024.csv`, csabData),
      loadCSVFromURL(`${baseUrl}/josaa_cutoffs_2024.csv`, josaaData)
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
 * Filter colleges based on input
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
