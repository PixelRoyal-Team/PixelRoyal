import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { Server as socketIO } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new socketIO(server);
const PORT = 3000;

const usersFile = path.join(new URL(import.meta.url).pathname, 'users.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

const getUsers = () => {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify({}));
    }
    const data = fs.readFileSync(usersFile, 'utf-8');
    return JSON.parse(data);
};

const saveUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

app.post('/account/register', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    if (users[username]) {
        return res.send('User already exists!');
    }

    users[username] = { password };
    saveUsers(users);

    req.session.user = { username };
    res.redirect('/account');
});

app.post('/account/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users[username];

    if (user && user.password === password) {
        req.session.user = { username };
        res.redirect('/account');
    } else {
        res.send('Invalid credentials!');
    }
});

app.get('/account', (req, res) => {
    if (req.session.user) {
        const username = req.session.user.username;
        const now = new Date();
        const formattedDate = now.toLocaleDateString();
        const formattedTime = now.toLocaleTimeString();

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Account</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="account-container">
                    <h1>Welcome ${username}</h1>
                    <p>Date: ${formattedDate}</p>
                    <p>Time: ${formattedTime}</p>
                    <form action="/account/logout" method="POST">
                        <button type="submit">Logout</button>
                    </form>
                </div>
            </body>
            </html>
        `);
    } else {
        //res.sendFile(path.join(new URL(import.meta.url).pathname, 'public', 'index.html'));
        res.sendFile('../../build/index.html');
    }
});

app.post('/account/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out.');
        }
        res.redirect('/account');
    });
});

app.get('/chat', (req, res) => {
    if (req.session.user) {
        const username = req.session.user.username;
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chat</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="chat-container">
                    <h1>Chat Room</h1>
                    <ul id="messages"></ul>
                    <form id="form" action="">
                        <input id="input" autocomplete="off" placeholder="Type your message..." /><button>Send</button>
                    </form>
                </div>
                <script src="/socket.io/socket.io.js"></script>
                <script>
                    const username = '${username}';
                    const socket = io({ query: { username: username } });

                    const form = document.getElementById('form');
                    const input = document.getElementById('input');

                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        if (input.value) {
                            socket.emit('chat message', input.value);
                            input.value = '';
                        }
                    });

                    socket.on('chat message', function(data) {
                        const item = document.createElement('li');
                        item.innerHTML = '<strong>' + data.username + '</strong>: ' + data.msg;
                        document.getElementById('messages').appendChild(item);
                        window.scrollTo(0, document.body.scrollHeight);
                    });
                </script>
            </body>
            </html>
        `);
    } else {
        res.redirect('/account');
    }
});

io.on('connection', (socket) => {
    const username = socket.handshake.query.username;

    if (!username) {
        socket.disconnect(true);
        return;
    }

    socket.on('chat message', (msg) => {
        io.emit('chat message', { username, msg });
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});