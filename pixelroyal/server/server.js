import express from 'express';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import http from 'http';
import url from 'url';
import fetch from "node-fetch";
import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'
import * as Canvas from 'canvas';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
GlobalFonts.registerFromPath('./pixelroyal/src/public/fonts/Pinky Blues.otf', "Pinky Blues")
import * as crypto from 'crypto'
import tileserver from './tileserver.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ['GET', 'POST']
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

// Create a mysql connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  //user: process.env.DB_USER,
  user: 'root',
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Login api
const generateToken = (payload) => {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.KEY), Buffer.from(process.env.IV))
  var crypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
};
app.get("/login/:email/:password", function (req, res) {
  const { email, password } = req.params

  if (!email || !password) {
    res.status(400).send({ message: "Error" })
    return
  }

  connection.query(
    'SELECT * FROM `accounts` WHERE `email` = ?',
    [email],
    function (err, results, fields) {
      if (err) {
        res.status(400).send({ message: "Server error" })
        return
      }
      if (results.length == 0) {
        res.status(400).send({ message: "Email not found" })
        return
      }

      bcrypt.compare(password, results[0].password, function (err, result) {
        if (result == true) {
          if (results[0].isActive == 0) {
            res.status(400).send({ message: "Verify your email first" })
            return
          }
          var token = generateToken({ id: results[0].id, email: email, name: results[0].nickname })
          res.status(200).send({ token: token })
        }
        else
          res.status(400).send({ message: "Password is incorrect" })
      });

    }
  );
})

// Register api
const byteSize = str => new Blob([str]).size;
app.post("/register/:email/:password/:name/:captcha", function (req, res) {
  const { email, password, name, captcha } = req.params

  if (!email || !password || !name || !captcha) {
    res.status(400).send({ message: "Error" })
    return
  }

  if (password.length > 25) {
    res.status(400).send({ message: "Password is too long (max: 25)" })
    return
  }
  if (name.length > 20) {
    res.status(400).send({ message: "Password is too long (max: 20)" })
    return
  }

  for (var i = 0; i < antispamlist.length; i++) {
    if (antispamlist[i].ip == req.socket.remoteAddress) {
      res.status(400).send({ "message": "You can't make an account now (antispam)" })
      return
    }
  }

  if (codes.length == 0) {
    res.status(400).send({ message: "Captcha error" })
    return
  }
  var captchaverified = false
  for (var i = 0; i < codes.length; i++) {
    var newcodes = []
    if (codes[i].ip == req.socket.remoteAddress) {
      if (codes[i].code.replaceAll("O", "0").toLowerCase() == captcha.replaceAll("O", "0").toLowerCase()) {
        captchaverified = true
      }
    } else {
      newcodes.push({ "ip": codes[i].ip, "code": codes[i].code })
    }
    if (i == codes.length - 1) {
      codes = newcodes
      if (captchaverified == false) {
        res.status(400).send({ message: "Captcha error" })
        return
      }
    }
  }

  connection.query(
    'SELECT * FROM `accounts` WHERE `email` = ?',
    [email],
    function (err, results, fields) {
      if (results.length != 0) {
        res.status(400).send({ message: "This email is already registered" })
        return
      }
      connection.query(
        'SELECT * FROM `accounts` WHERE `nickname` = ?',
        [name],
        function (err, results, fields) {
          if (results.length != 0) {
            res.status(400).send({ message: "This name is taken" })
            return
          }
          bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {
              var b_name = String(byteSize(name))
              connection.query(
                'INSERT INTO `accounts` SET `email` = ? , `password` = ? ,  `nickname` = ? , `activate_code` = ?',
                [email, hash, name, `${RANDOMWORDS(20 - b_name.length)}${b_name}`],
                function (err, result) {
                  antispamlist.push({ "ip": req.socket.remoteAddress, "time": new Date().getTime() })
                  res.status(200).send({ message: "Successful! Check your email inbox" })
                }
              )
            })
          });
        });

    }
  );
})
// Anti register spam
var antispamlist = []

function antispamcheck() {
  if (antispamlist != []) {
    var now = new Date().getTime()
    var newlist = []
    for (var i = 0; i < antispamlist.length; i++) {
      if (antispamlist[i].time > now - 1800000)
        newlist.push(antispamlist[i])
    }
    antispamlist = newlist
  }
  setTimeout(() => { antispamcheck() }, 1000)
}
antispamcheck()

// Captcha
var codes = []
function RANDOMWORDS(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}
app.get("/captcha.png", async function (req, res, next) {
  if (codes != []) {
    var newcodes = []
    for (var i = 0; i < codes.length; i++) {
      if (codes[i].ip != req.socket.remoteAddress)
        newcodes.push({ "ip": codes[i].ip, "code": codes[i].code })
    }
  }
  var captcha = RANDOMWORDS(6)
  codes.push({ "ip": req.socket.remoteAddress, "code": captcha })

  const canvas = createCanvas(320, 60);
  const context = canvas.getContext("2d");
  const background = await loadImage('./pixelroyal/src/public/images/captcha_bg.png');
  context.drawImage(background, 0, 0, 320, 60);
  context.font = '60px "Pinky Blues"'
  context.fillStyle = "#b8c9ff";
  context.textAlign = "center";
  context.fillText(captcha, 320 / 2, 52);

  const img = canvas.toBuffer("image/png");

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": img.length,
  });
  res.end(img);
});
// Activate the email
app.get("/activate/:activate_code", function (req, res) {
  var { activate_code } = req.params

  if (!activate_code) {
    res.sendFile(path.join(__dirname, './html/verify_error.html'))
    return
  }

  if (activate_code.length != 20) {
    res.sendFile(path.join(__dirname, './html/verify_error.html'))
  } else {
    connection.query(
      'SELECT * FROM `accounts` WHERE `activate_code`=?',
      [activate_code],
      function (err, results, fields) {
        if (results.length == 0) {
          res.sendFile(path.join(__dirname, './html/verify_error.html'))
          return
        }
        if (results[0].isActive == 1) {
          res.sendFile(path.join(__dirname, './html/verify_error.html'))
          return
        }
        connection.query(
          'UPDATE `accounts` SET `isActive` = 1 WHERE `id`=?',
          [results[0].id],
          function (err, result) {
            res.sendFile(path.join(__dirname, './html/verify_success.html'))
          }
        )

      }
    )
  }
})
// get admin level
app.get("/getadminlevel/:id", function (req, res) {
  var { id } = req.params
  if (id == null || id == "" || !Number(id)) {
    res.status(400).send({ message: "Error" })
    return
  }
  connection.query(
    'SELECT * FROM `accounts` WHERE `id`=?',
    [id],
    function (err, results, fields) {
      if (results.length == 0) {
        res.status(400).send({ message: "Error" })
        return
      }
      res.status(200).send({ admin_level: results[0].admin_level })
    }
  )
})

app.all('*', (req, res) => {
  res.status(404).send("<p style='font-family: Arial, Helvetica, sans-serif'>This content wasn't found</p>");
});

async function SetImgPixel(img, x, y, color) {
  try {
    const canvas = Canvas.createCanvas(256, 256);
    const ctx = canvas.getContext('2d');

    const image = await Canvas.loadImage(img);

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
  const TILEX = Math.floor(x / 256);
  const TILEY = Math.floor(y / 256);

  const TILEPXLX = x - TILEX * 256;
  const TILEPXLY = y - TILEY * 256;

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
    console.log("pixel:" + x + ", " + color);

    PlacePixel(x, y, color);

    const TILEX = Math.floor(x / 256);
    const TILEY = Math.floor(y / 256);

    let chunkid = TILEX + 256 * TILEY;
	console.log(chunkid);
    io.emit("chunkplace" + chunkid, { x, y, color });
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