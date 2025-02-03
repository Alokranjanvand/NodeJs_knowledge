module.exports = (io, socket, connectedUsers) => {
    console.log('New connection:', socket.id);

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
};
