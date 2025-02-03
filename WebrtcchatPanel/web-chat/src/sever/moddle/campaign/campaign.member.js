const { DataTypes } = require('sequelize');
const sequelize = require('../../database/database.config').sequelize;// Import your sequelize instance

const CampaignMember = sequelize.define('CampaignMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  campaignId: {
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
  tableName: 'webrtc_campaign_members', // Table name in the database
  timestamps: false, // Disable Sequelize's automatic timestamps
});

module.exports = CampaignMember;
