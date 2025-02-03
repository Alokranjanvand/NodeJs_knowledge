const { DataTypes } = require('sequelize');
const sequelize = require('../database/database.config').sequelize;// Import your sequelize instance

const GroupMembers = sequelize.define('GroupMembers', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  memberId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdOn: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Default to current date and time
  },
}, {
  tableName: 'group_members', // Table name in the database
  timestamps: false, // Disable Sequelize's automatic timestamps
});

module.exports = GroupMembers;
