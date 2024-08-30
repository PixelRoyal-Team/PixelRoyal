import express from 'express';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';

import tileserver from './tileserver.js'; 

const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '../../build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

// Route to handle maintenance requests
app.get('/maintenance', (req, res) => {
  res.sendFile(path.join(__dirname, 'maintenance', 'index.html'));
});

// Route to handle user data requests
app.get('/users', (req, res) => {
  // Assuming users.json is in the same directory as server.js
  const usersFilePath = path.join(__dirname, 'users.json'); 
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users file:', err);
      res.status(500).send('Error reading users file'); // More specific error message
      return; // Exit the callback
    }
    res.json(JSON.parse(data));
  })
});

// Mount the tileserver module
app.use('/tiles', tileserver);

app.all('*', (req, res) => {
  res.status(404).send("<p style='font-family: Arial, Helvetica, sans-serif'>This page wasn't found</p>");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://location.host:${port}`);
});