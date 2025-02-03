const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');

let server;
let path;
const eventBuffer = {};

function initSocketServer(httpServer, options = {}, onAuthCallback, onConnectCallback) {
    server = new socketIO.Server(httpServer, options);
    path = options.path;

    // Set max listeners for sockets
    server.sockets.setMaxListeners(0);

    // Use custom authorization middleware
    server.use((socket, next) => socketAuthorization(socket, next, onAuthCallback));

    // Handle connection events
    server.on('connection', (socket) => onSocketConnect(socket, onConnectCallback));

    // Optional: Handle server errors
    server.on('error', (err) => {
        console.error('Socket Server Error:', err);
    });

    return server;
}

function socketAuthorization(socket, next, authCallback) {
    try {
        return authCallback(socket, next);
    } catch (err) {
        console.error('Socket Authorization Error:', err);
        next(new Error('Authorization failed'));
    }
}

function onSocketConnect(socket, connectCallback) {
    try {
        connectCallback(socket);
    } catch (err) {
        console.error('Socket Connection Error:', err);
    }
}

function emitInSocketRoom(tableId, event, data) {
    server.in(tableId).emit(event, data);
}

function emitToUser(io, userId, event, data) {
    const eventId = uuidv4();
    data['eventId'] = eventId;
    saveMsgInBuffer(userId, event, data);
    io.to(userId).emit(event, {data});  // Use io here instead of server
}

function saveMsgInBuffer(userId, evName, data) {
    if (process.env.SAVE_USER_EVENT === 'true') {
        const eventId = data.eventId;
        if (eventBuffer[userId]) {
            eventBuffer[userId].push({ eventId, evName, data });
        } else {
            eventBuffer[userId] = [{ eventId, evName, data }];
        }
    }
}

function getUserEvents(offsetId, userId) {
    const resp = [];
    let offsetIndex = -1;

    if (eventBuffer[userId]) {
        for (let i = 0; i < eventBuffer[userId].length; i++) {
            if (eventBuffer[userId][i]?.eventId === offsetId) {
                offsetIndex = i + 1;
                break;
            }
        }
        if (offsetIndex >= 0) {
            resp.push(...eventBuffer[userId].slice(offsetIndex));
        }
    }

    deleteUserEvents(userId, offsetIndex);
    return resp;
}

function deleteUserEvents(userId, offsetIndex) {
    if (eventBuffer[userId]) {
        eventBuffer[userId].splice(0, offsetIndex);
    }
    return true;
}

function getIO() {
    return server;
}

function getPath() {
    return path;
}

module.exports = {
    initSocketServer,
    emitInSocketRoom,
    emitToUser,
    getUserEvents,
    deleteUserEvents,
    getIO,
    getPath,
};
