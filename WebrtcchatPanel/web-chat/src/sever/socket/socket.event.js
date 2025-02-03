const ChatController = require('../controler/chatController'); // Update the path
const EVENT_NAME = {
    RECEIVE_MSG: 'receiveMsg',
    // RECEIVE_GROUP_MSG: 'receiveGroupMsg',
    // SEND_PERSONAL_MSG: 'sendPersonalMsg',
    PING: 'ping',
    LOAD_CHAT_HISTORY: 'loadChatHistory',
    SEND_MSG: 'sendMessage',
    SEND_NOTIFICATION: 'sendNotification',
    NEW_USER_CONNECTED: 'newUserConnected',
    FETCH_ONLINE_USER: 'fetchOnlineUser',
    MSG_RECEIVED: 'msgReceived',
    // CREATE_GROUP: 'createGroup',
    // SEND_GROUP_MSG: 'sendGroupMsg',
    // GET_MSG: 'getMsg',
    // GET_PERSONAL_MSG: 'getPersonalMsgs',
    // CHECK_MSG_IS_RECEIVED: 'checkMsgIsReceived',
};

function registerEvents(socket) {
    const chatController = ChatController;
    
    socket.on(EVENT_NAME.PING, (...args) => chatController.ping(socket, ...args));
    socket.on(EVENT_NAME.LOAD_CHAT_HISTORY, (...args) => chatController.loadChatHistory(socket, ...args));
    socket.on(EVENT_NAME.SEND_MSG, (...args) => chatController.sendMessage(socket, ...args));
    socket.on(EVENT_NAME.SEND_NOTIFICATION, (...args) => chatController.sendNotification(socket, ...args));
    socket.on(EVENT_NAME.NEW_USER_CONNECTED, (...args) => chatController.newUserConnected(socket, ...args));
    socket.on(EVENT_NAME.FETCH_ONLINE_USER, (...args) => chatController.fetchOnlineUser(socket, ...args));
    // TODO: MSG_RECEIVED
    socket.on(EVENT_NAME.MSG_RECEIVED, (...args) => chatController.msgReceived(socket, ...args));
    // socket.on(EVENT_NAME.SEND_PERSONAL_MSG, (...args) => chatController.sendPersonalMsg(socket, ...args));
    // socket.on(EVENT_NAME.CREATE_GROUP, (...args) => chatController.createGroup(socket, ...args));
//     socket.on(EVENT_NAME.SEND_GROUP_MSG, (...args) => chatController.sendGroupMessage(socket, ...args));
//     socket.on(EVENT_NAME.GET_MSG, (...args) => chatController.getMsgs(socket, ...args));
    // socket.on(EVENT_NAME.GET_PERSONAL_MSG, (...args) => chatController.getPersonalMsgs(socket, ...args));
//     socket.on(EVENT_NAME.CHECK_MSG_IS_RECEIVED, (...args) => chatController.checkMsgIsReceived(socket, ...args));
}

module.exports = { EVENT_NAME, registerEvents };
