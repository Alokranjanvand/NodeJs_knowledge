const { DataTypes } = require('sequelize');
const sequelize = require('../database/database.config').sequelize;// Import your sequelize instance

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  isGroupMsg: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  msgText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  localMessageId: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
  },
}, {
  tableName: 'messages', // Explicit table name
  timestamps: false,     // Disable Sequelize's automatic timestamps
});

module.exports = Message;
