const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'PMR Voting System Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Vote count endpoint (optional - for statistics)
app.get('/api/votes/count', (req, res) => {
    res.json({
        message: 'Vote counts are handled by Firebase Firestore',
        candidates: [
            { id: 'rangga', name: 'Muhammad Rangga Pratama' },
            { id: 'ghazi', name: 'Ahmad Ghazi Maulana' }
        ]
    });
});

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/firebase', (req, res) => {
    res.sendFile(path.join(__dirname, '../index-firebase.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`PMR Voting Backend running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

module.exports = app;