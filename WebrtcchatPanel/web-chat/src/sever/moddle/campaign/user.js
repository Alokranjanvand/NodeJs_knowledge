const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database.config').sequelize;

const Webrtc_user = sequelize.define('webrtc_user', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id:{
    type: DataTypes.NUMBER,
    allowNull:false,
    unique: true
  },
  user_mode_id:{
    type: DataTypes.INTEGER,
    allowNull:false,
  },
  login_id:{
    type: DataTypes.INTEGER,
    allowNull:false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastOnlineAt: {
    type: DataTypes.STRING,
    allowNull: true, // This field is required
  },
  logOutAt:{
    type: DataTypes.STRING,
    allowNull: true, 
  },
  currentloginCampaignId:{
    type: DataTypes.INTEGER,
    allowNull:true,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM,
    values: ['active', 'inactive'],
    defaultValue: 'active'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
});

module.exports = Webrtc_user;
