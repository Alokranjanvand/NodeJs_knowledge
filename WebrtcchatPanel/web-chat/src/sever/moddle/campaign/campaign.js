const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database.config').sequelize; // Import your sequelize instance

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdOn: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Optional: default to the current date/time
  },
  clientId: {
    type: DataTypes.INTEGER,
    unique: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'webrtc_campaigns', // Table name in the database
  timestamps: false,  // Disable Sequelize's automatic timestamps
});

module.exports = Campaign;
