const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const connectDB = require('./src/db');
const Message = require('./src/models/Message');

// Instanciar express
const app = express();

// Crear el servidor web
const server = http.createServer(app);

// Configuración del servidor con las CORS
const io = socketIo(server, {
    cors: {
        origin: "http://127.0.0.1:5500",
        credentials: true
    }
});

// Conectar a la base de datos
connectDB();

let users = {};
let codigoChats = []; // Array para almacenar múltiples códigos de chat

app.get("/", (req, res) => {
    res.send("Server chat is running and ready to accept connections");
});

io.on("connection", (socket) => {
    console.log("An user connected");
  
    // Evento para recibir el código de chat
    socket.on("codigoChat", (randomCode) => {
        console.log("Código de chat recibido:", randomCode);
        codigoChats.push(randomCode); // Almacenar el nuevo código de chat en el array
        socket.emit("response", { message: "Código de chat recibido correctamente" });
    });
  
    socket.on("join", async (data) => {
        const { username, code } = data;
        if (codigoChats.includes(code)) {
            console.log(`El usuario ${username} se ha unido al chat con el código de sala ${code}.`);
            socket.join(code);
            users[socket.id] = username;

            try {
                // Consultar mensajes previos para la sala específica
                const messages = await Message.find({ room: code }).sort({ createdAt: 1 }).exec();
                socket.emit("previousMessages", messages); // Enviar mensajes previos al cliente

                io.to(code).emit("messageFromServer", { user: "Server", message: `${username} se ha unido al chat.` });
            } catch (error) {
                console.error("Error fetching previous messages:", error.message);
            }
        } else {
            console.log(`Código de sala inválido: ${code}`);
            socket.emit("joinError", { error: "Código de sala inválido" });
        }
    });
  
    socket.on("messageFromClient", async (data) => {
        const { message, room } = data;
        const user = users[socket.id];
        if (!user || !message || !room) {
            console.log("Username, message, or room is missing");
            return;
        }
        const newMessage = new Message({ username: user, message, room });
        await newMessage.save();
        io.to(room).emit("messageFromServer", { user, message });
    });
  
    socket.on("privateMessageFromClient", (data) => {
        const user = users[socket.id] || "User";
        const recipientSocket = Object.keys(users).find(socketId => users[socketId] === data.recipient);
        if (recipientSocket) {
            io.to(recipientSocket).emit("privateMessageFromServer", { user, recipient: data.recipient, message: data.message });
        }
    });
  
    socket.on("finalizarChat", (codigoChat) => {
    if (!codigoChat) {
        console.log("No se proporcionó ningún código de chat para finalizar.");
        return;
    }

    console.log(`Finalizando chat para la sala ${codigoChat}`);

    io.to(codigoChat).emit("messageFromServer", { user: "Server", message: "El chat ha sido finalizado por el administrador." });
    io.in(codigoChat).socketsLeave(codigoChat);

    // Remover el código de chat finalizado del array (si estás utilizando un array para almacenar códigos de chat)
    const index = codigoChats.indexOf(codigoChat);
    if (index !== -1) {
        codigoChats.splice(index, 1);
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
