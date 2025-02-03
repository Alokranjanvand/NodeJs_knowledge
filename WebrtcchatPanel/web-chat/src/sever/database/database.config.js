    const { Sequelize } = require('sequelize');
    require('dotenv').config(); 

    const sequelize = new Sequelize(
        process.env.DB_NAME, 
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: true, 
    });


    const connectToDatabase = async (app) => {
        try {
            await sequelize.authenticate();
            console.log('Database connected...');
            await sequelize.sync();       
        } catch (err) {
            console.error('Database connection error:', err);
            process.exit(1);
        }
    };


    module.exports = { sequelize, connectToDatabase };
