const express = require('express');
const multer = require('multer');
const ChatController = require('../controler/chatController');
const { authMiddleware } = require('../middleware/authmiddleware');
const cors =require('cors');

module.exports.routes = function(app) {
    const chatController = ChatController;
    const authRouter = express.Router();
    const nonAuthRouter = express.Router();

    // Uncomment to use authentication middleware
    authRouter.use('/', authMiddleware);

    // Authenticated routes
    authRouter.get('/loginToChatApp', chatController.loginToChatApp);
    authRouter.get('/getIntoChatApp', chatController.getIntoChatApp);
    nonAuthRouter.post('/refreshToken', chatController.generateToken);
    nonAuthRouter.post('/refreshTokenWebrtc', chatController.generateTokenwebrtc);
    

    // Apply middleware
    app.use(cors({
        origin: '*',  // Allow all origins
        methods: 'GET, POST, PUT, DELETE, OPTIONS', // Ensure OPTIONS is included
        allowedHeaders: 'Content-Type, Authorization,token', // Allow specific headers
        credentials: true, // Allow credentials (cookies, authorization headers)
    }));

    // Preflight request handler for OPTIONS
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization,token');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            return res.status(204).end(); // Respond to preflight request
        }
        next();
    });

    // Example route
    app.get('/', (req, res) => {
        res.send(`chat server is running (${new Date()})`)

    });
    app.use('/api', authRouter).use('/server', nonAuthRouter);
};
