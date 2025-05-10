import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
const PredictorForm = () => {
  const [inputs, setInputs] = useState({
    rank: '',
    category: 'OPEN',
    gender: 'Gender-Neutral',
    homeState: false,
    branchPreference: '',
  });

  const [results, setResults] = useState([]);
  const [bestCollege, setBestCollege] = useState(null);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: name === 'rank' ? Number(value) : (type === 'checkbox' ? checked : value),
    }));
  };

  const handleSubmit = async e => {
    console.log('Submitted inputs:', inputs);
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/predict', inputs);
      console.log('Backend response:', res.data);

      setResults(res.data.all || []);
      setBestCollege(res.data.best || null);
    } catch (err) {
      console.error('Prediction error:', err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Institute', 'Program', 'Closing Rank', 'Source']],
      body: results.map(row => [
        row['Institute'],
        row['Academic Program Name'],
        row['Closing Rank'],
        row.source,
      ]),
    });
    doc.save('college-predictions.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">🎓 College Predictor (JEE Mains)</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="number"
          name="rank"
          placeholder="Your JEE Mains Rank"
          value={inputs.rank}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <select name="category" value={inputs.category} onChange={handleChange} className="p-2 border rounded">
          <option value="OPEN">General (OPEN)</option>
          <option value="OBC-NCL">OBC-NCL</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="EWS">EWS</option>
        </select>

        <select name="gender" value={inputs.gender} onChange={handleChange} className="p-2 border rounded">
          <option value="Gender-Neutral">Gender-Neutral</option>
          <option value="Female-only (including Supernumerary)">Female-only</option>
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="homeState"
            checked={inputs.homeState}
            onChange={handleChange}
          />
          <span>Home State Quota</span>
        </label>
        <input
          type="text"
          name="branchPreference"
          placeholder="Branch Preference (optional)"
          value={inputs.branchPreference}
          onChange={handleChange}
          className="p-2 border rounded md:col-span-2"
        />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 md:col-span-2">
          Predict Colleges
        </button>
      </form>

      {bestCollege && (
        <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded shadow">
          <h2 className="font-bold text-green-800 text-lg mb-1">🎯 Best College Recommendation</h2>
          <p className="text-sm">
            {bestCollege['Institute']} – {bestCollege['Academic Program Name']} <br />
            <strong>Closing Rank:</strong> {bestCollege['Closing Rank']} <br />
            <strong>Source:</strong> {bestCollege.source}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Top Matching Colleges</h2>
          <ul className="divide-y">
            {results.map((college, i) => (
              <li key={i} className="py-2">
                <span className="font-medium">{college['Institute']}</span> – {college['Academic Program Name']}<br />
                <span className="text-sm text-gray-600">
                  Rank: {college['Closing Rank']} | Source: <strong>{college.source}</strong>
                </span>
              </li>
            ))}
          </ul>

          <button
            onClick={exportPDF}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Export to PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictorForm;
