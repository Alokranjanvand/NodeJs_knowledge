const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database.config').sequelize;

const Webrtc_Message = sequelize.define('Message', {
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
    campaignId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    campaignName: {
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
    isMsgReceived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'webrtc_messages', // Explicit table name
    timestamps: false,     // Disable Sequelize's automatic timestamps
  });

  module.exports = Webrtc_Message;