const { DataTypes } = require('sequelize');
const sequelize = require('../database/database.config').sequelize; // Import your sequelize instance

const Group = sequelize.define('Group', {
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
  groupId: {
    type: DataTypes.INTEGER,
    unique: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'groups', // Table name in the database
  timestamps: false,  // Disable Sequelize's automatic timestamps
});

module.exports = Group;
