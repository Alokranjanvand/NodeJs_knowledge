require('dotenv/config');
require('reflect-metadata');
const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const { connectToDatabase, sequelize } = require('./src/sever/database/database.config'); 
const { registerEvents } = require('./src/sever/socket/socket.event');
const { routes } = require('./src/sever/routes/server.routes');
const bodyParser = require('body-parser');
const path = require('path');
const { validateToken, validateTokenforWebRtc } = require('./src/sever/middleware/authmiddleware');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const User = require('./src/sever/moddle/User');
const cors = require('cors');
const Webrtc_user = require('./src/sever/moddle/campaign/user');
const { userOnlineMap, isUserOnline } = require('./src/sever/utills/socket.user');
// Application-wide state
const app = express();
let socketServer;
// const userOnlineMap = new Map();
// Middleware and static files
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.static(path.join(__dirname, 'public')));
// Route to serve the EJS page

// Routes
routes(app);

// Initialize database
(async () => {
    try {
        await connectToDatabase();
        console.log('Database initialization complete.');
    } catch (err) {
        console.error('Error initializing the database:', err.message);
        process.exit(1);
    }
})();

// Socket Server
// Socket Server
function initializeSocketServer(httpServer) {
    const io = new socketIO.Server(httpServer, {
        path: '/v1/chat/socket.io',
        pingTimeout: 4000,
        pingInterval: 4000,
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.query.token;
        const profile =  validateTokenforWebRtc(token); // Make sure this is async

        if (!profile) {
            return next(new Error('Invalid token'));
        }
        socket.data = await Webrtc_user.findOne({
            where: {
                user_id: profile?.user_id,
                // firstName: profile?.firstNamed
            }
        });
        if (socket.data) {
            socket.data.lastOnlineAt= Date.now();
            socket.data.save()
        }
            // console.log('Profile:', profile);
            // console.log('User Data:', socket.data);j

        if (!socket.data) {
            return next(new Error('User not found'));
        }

        next();
    });
    // io.on('disconnect',(socket)=>{
    //     socket.data.logOutAt= Date.now();
    //         socket.data.save()
    //         userOnlineMap.delete(socket.data.id);
    //         console.log(`User ${socket.data.id} disconnected.`);
    //         console.log("total online user",userOnlineMap);
    // })
    io.on('connection', (socket) => {
        if (!socket.data || !socket.data.id) {
            console.error('Socket data is not properly initialized');
            return;
        }

        const offset = socket.handshake.query.offset;


        socket.join(socket.data.id);  // Join the user to a room based on their ID
        registerEvents(socket);
        userOnlineMap.set(socket.data.id, true);  // Keep track of online users
        console.log(`User ${socket.data.name} & id:${socket.data.id} connected`);
        console.log("total online user",userOnlineMap);
        socket.on('disconnect', () => {
            socket.data.logOutAt= Date.now();
            socket.data.save()
            userOnlineMap.delete(socket.data.id);
            console.log(`User ${socket.data.id} disconnected.`);
            console.log("total online user",userOnlineMap);
        });

        if (offset) {
            console.log('OFFSET FOUND:', offset);
            // Handle offset-related events here if needed
        }
    });

    return io; // Return io instance (socket server)
}


// Start the server
const options = {
    key: fs.readFileSync('parahittech.key'),
    cert: fs.readFileSync('main.crt')
};

const httpServer = https.createServer(options,app);
httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
    // console.log(`Server is running on port ${options.key}`);
    socketServer = initializeSocketServer(httpServer); // Initialize socket server
});

// Utility functions
// function isUserOnline(userId) {
//     console.log("total online user",userOnlineMap);
//     return userOnlineMap.get(userId);
// }

module.exports = {  socketServer, sequelize ,   userOnlineMap };
