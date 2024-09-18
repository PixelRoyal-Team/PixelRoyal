import express from 'express';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import {fileURLToPath} from 'url';
import { Server } from 'socket.io';
import http from 'http';
import url from 'url';

import fetch from "node-fetch";
import { createCanvas, loadImage } from 'canvas';

import tileserver from './tileserver.js'; 

const app = express();
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
	methods:['GET','POST']
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '../../build')));
app.use(express.static(path.join(__dirname, 'tiles')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

app.get('/maintenance', (req, res) => {
  res.sendFile(path.join(__dirname, 'maintenance', 'index.html'));
});

app.get('/users', (req, res) => {
  const usersFilePath = path.join(__dirname, 'users.json'); 
  fs.readFile(usersFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading users file:', err);
      res.status(500).send('Error reading users file'); // More specific error message
      return;
    }
    res.json(JSON.parse(data));
  })
});

app.use('/tiles', tileserver);

app.all('*', (req, res) => {
  res.status(404).send("<p style='font-family: Arial, Helvetica, sans-serif'>This content wasn't found</p>");
});

async function SetImgPixel(img, x, y, color) {
	try {
	const canvas = createCanvas(256, 256);
    const ctx = canvas.getContext('2d');
	
	const image = await loadImage(img);
	
    ctx.drawImage(image, 0, 0, 256, 256);
	ctx.fillStyle = color;
	ctx.fillRect(x, y, 1, 1);
	
	let imageBuffer = canvas.toBuffer();
	fs.writeFileSync(img, imageBuffer);
	} catch (error) {
        console.error('Error processing image:', error);
    }
}

function PlacePixel(x, y, color) {
  const TILEX = Math.floor(x/256);
  const TILEY = Math.floor(y/256);
  
  const TILEPXLX = x-TILEX*256;
  const TILEPXLY = y-TILEY*256;
  
  const TILEPATH = path.join(__dirname, 'tiles', '8', TILEX.toString(), `${TILEY}.png`);
  
  SetImgPixel(TILEPATH, TILEPXLX, TILEPXLY, color);
}

// Socket
io.on('connection', (socket) => {
  console.log('a user connected');
  
    socket.on('chat', (data) => {
		console.log("chat:" + data);
		io.emit("chat", data);
	});
	
	socket.on('place', (data) => {
		const { x, y, color } = data;
		console.log("pixel:" + x  + ", " + color);
		
		PlacePixel(x, y, color);
		
		  const TILEX = Math.floor(x/256);
          const TILEY = Math.floor(y/256);
        
		let chunkid = TILEX * 256 + TILEY;
		io.emit("chunkplace"+chunkid, {x, y, color});
	});
	
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
});

io.listen(4000);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});