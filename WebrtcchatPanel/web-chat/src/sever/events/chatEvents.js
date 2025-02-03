const Message = require('../db/messageModel');

module.exports = (io, socket, connectedUsers) => {
    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, message } = data;

        // Save message to database
        const newMessage = await Message.create({ senderId, receiverId, message });

        // Find the receiver's socket ID
        const receiverSocketId = connectedUsers.get(receiverId);

        if (receiverSocketId) {
            // Emit message to the receiver
            io.to(receiverSocketId).emit('receiveMessage', newMessage);
        } else {
            console.log(`User ID ${receiverId} is not connected.`);
        }
    });
};
