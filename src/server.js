const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const { spawn } = require('child_process');
const { SpeechClient } = require('@google-cloud/speech');
const config = require('../config');

// Initialize Google Speech-to-Text client
const speechClient = new SpeechClient(config.googleSpeech);

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/'
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(__dirname));
app.use('/styles', express.static(path.join(__dirname, '../src/styles')));
app.use('/admin', express.static(path.join(__dirname, '../src/admin')));
app.use('/client', express.static(path.join(__dirname, '../src/client')));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/client.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});



// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('clientMessage', (message) => {
        if (!message) return; // Don't process empty messages
        console.log('Client message:', message);
        socket.broadcast.emit('clientMessage', message.trim()); // Send to all except sender
    });

    socket.on('adminMessage', (message) => {
        if (!message) return; // Don't process empty messages
        console.log('Admin message:', message);
        socket.broadcast.emit('adminMessage', message.trim()); // Send to all except sender
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
