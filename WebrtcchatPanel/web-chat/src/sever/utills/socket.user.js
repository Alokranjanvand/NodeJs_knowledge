const userOnlineMap = new Map();

function isUserOnline(userId) {
    return userOnlineMap.get(userId);
}

module.exports = { isUserOnline, userOnlineMap };