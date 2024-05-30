const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');

// instanciar express
const app = express();

// crear el servidor web
const server = http.createServer(app);

// configuración del servidor con las cors
const io = socketIo(server, {
    cors: {
      origin: "http://127.0.0.1:5500",
      credentials: true
    }
});

let conexiones = {
    salas: [
        {
            "ABC":[
                {
                    "identificador":"12345",
                    "habilitado":true,
                    "socketId": "abc12345"
                },
                {
                    "identificador":"3333",
                    "habilitado":true,
                    "socketId": "abc33345"
                }
            ],
            
            "XYZ":[
                {
                    "identificador":"5555",
                    "habilitado":true,
                    "socketId": "abasd2345"
                },
                {
                    "identificador":"66666",
                    "habilitado":true,
                    "socketId": "asd98987"
                }
            ]
        }
    ]
};

let users = {};

let codigoChat; // Variable para almacenar el código de chat recibido






app.get("/", (req, res) => {
    res.send("Server chat is running and ready to accept connections");
});

io.on("connection", (socket) => {
    console.log("An user connected");
    socket.on("messageFromClient", (message) => {
        console.log(`Message from ${users[socket.id]}: ${message}`);
        const user = users[socket.id] || "User";
        io.emit("messageFromServer", { user, message });
    });

    // Manejar evento para recibir el código de chat desde el servicio de funeraria
socket.on('codigoChat', (randomCode) => {
    console.log('Código de chat recibido:', randomCode);

    // Almacenar el código de chat recibido
    codigoChat = randomCode;

    // Puedes realizar acciones adicionales aquí, como emitir una respuesta al servicio de funeraria
    socket.emit('response', { message: 'Código de chat recibido correctamente' });
});
    // Manejar evento para unirse al chat desde la página de login
    socket.on('join', (data) => {
    const { username, code } = data;

    // Verificar si el código proporcionado coincide con el código recibido del servicio de funeraria
    if (code === codigoChat) {
        console.log(`El usuario ${username} se ha unido al chat con el código de sala ${code}.`);
        // Aquí puedes permitir al usuario unirse al chat
        socket.join(code);
        io.to(code).emit("messageFromServer", { user: "Server", message: `${username} se ha unido al chat.` });
    } else {
        console.log(`Código de sala inválido: ${code}`);
        // Emitir un mensaje de error al cliente si el código no coincide
        socket.emit("joinError", { error: "Código de sala inválido" });
    }
});

    socket.on("privateMessageFromClient", (data) => {
        console.log(`Private message from ${users[socket.id]} to ${data.recipient}`);
        const user = users[socket.id] || "User";
        const recipientSocket = Object.keys(users).find(
            (socketId) => users[socketId] === data.recipient
        );
        if (recipientSocket) {
            io.to(recipientSocket).emit("privateMessageFromServer", {
                user,
                recipient: data.recipient,
                message: data.message,
            });
        }
    });

    socket.on("disconnect", () => {
        console.log(`The user ${users[socket.id]} has left the chat.`);
        delete users[socket.id];
    });
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.get("/index", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 3010;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
