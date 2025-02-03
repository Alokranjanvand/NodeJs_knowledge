const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { ERROR_CODE, BaseHttpResponse } = require('../utills/error');
// Import response utilities (uncomment if needed)
// const { sendResponse, sendError, statusCodes } = require('../utills/baseResponce'); 
// const { renderLoginError, redirectLoginError } = require('../utills/render.error'); 

// Authorization Middleware (Token-based)
const  authMiddleware = (req, res, next) => {
    try {
        const secret = process.env.JWT_SECRET;  
        let token = req.headers['authorization']
        token=req.query.token
        if (token && token.startsWith('Bearer ')) {
            console.log('Authorization Header:', token);
            token = token.slice(7, token.length); 
        }
        if (!token) {
            token = req.body.token;
        }
        if (!token) {
            token = req.session.token;
        }
        if (!token) {
            return res.status(ERROR_CODE.UNAUTHORISE).json(BaseHttpResponse(null,'No token provided',ERROR_CODE.UNAUTHORISE));
        }

        // const tokenData = validateToken(token, secret);
        const tokenData= validateTokenforWebRtc(token,secret);
        
        if (!tokenData) {
            return res.status(ERROR_CODE.FORBIDDEN_403).json(BaseHttpResponse(null,'Invalid token',ERROR_CODE.FORBIDDEN_403));
        }

        req.user = tokenData;
        console.log('Auth middleware invoked');
        next();
    } catch (err) {
        console.error('Error in authMiddleware:', err);
        return res.status(ERROR_CODE.INTERNAL_SERVER_ERROR_500).json(BaseHttpResponse(null,'Internal server error',ERROR_CODE.INTERNAL_SERVER_ERROR_500));
    }
};

// Session-based Authorization Middleware
const authMiddlewareWebRtc = (req, res, next) => {
    try {
        const secret = process.env.JWT_SECRET;
        const token = req.session.token;
        console.log(token)
        if (!token) {
            return redirectLoginError(req, res, 'login again'); 
        }

        const tokenData = validateTokenforWebRtc(token, secret);
        if (!tokenData) {
            return redirectLoginError(req, res, 'Invalid or expired token. Please log in again.');
        }

        req.user = tokenData;
        console.log('Session Auth middleware invoked');
        next();
    } catch (err) {
        console.error('Error in authSessionMiddleware:', err);
        return sendError(res, statusCodes.INTERNAL_SERVER_ERROR_500.code, 'Internal server error');
    }
};

// Validate the JWT Token
function validateTokenforWebRtc(token, secret) {
    secret = process.env.JWT_SECRET;
    try {
        if (typeof token !== 'string' || !token.trim()) {
            console.error('Invalid token format:', token);
            return null;
        }
        token = token.replace('Bearer ', '');
        const tokenData = jwt.verify(token, secret, { algorithms: [process.env.JWT_ALGO || 'HS256'] });
        // const tokenData={}
        return {
            user_id:tokenData.user_id,
            name: tokenData.name,
            mobile: tokenData.mobile,
            login_id:tokenData.login_id,
            user_mode_id:tokenData.user_mode_id
        };
    } catch (err) {
        console.error('Error in validateToken:', err);
        return null;
    }
}
function validateToken(token, secret) {
    secret = process.env.JWT_SECRET;
    try {
        if (typeof token !== 'string' || !token.trim()) {
            console.error('Invalid token format:', token);
            return null;
        }
        token = token.replace('Bearer ', '');
        const tokenData = jwt.verify(token, secret, { algorithms: [process.env.JWT_ALGO || 'HS256'] });
        // const tokenData={}
        return {
            user_id:tokenData.user_id||1,
            firstName: tokenData.firstName||"nitish",
            email: tokenData.email|| null,
            mobile: tokenData.mobile|| '9876543210',
        };
    } catch (err) {
        console.error('Error in validateToken:', err);
        return null;
    }
}

// Generate a new JWT Token
async function generateToken(user) {
    try {
        const jti = uuidv4();
        const subject = user.id ? user.id.toString() : 'default_subject';
        const options = {
            algorithm: process.env.JWT_ALGO || 'HS256',
            expiresIn: process.env.JWT_EXPIRE_IN || '1h',
            jwtid: jti,
            subject: subject,
            issuer: process.env.JWT_ISS || 'your_issuer',
            header: {
                kid: process.env.JWT_KID || 'default_kid',
                typ: 'JWT',
                alg: process.env.JWT_ALGO || 'HS256'
            }
        };
        const payload = {
            user_id:user.user_id||1,
            firstName: user.firstName||"nitish",
            email: user.email|| null,
            mobile: user.mobile|| '9876543210',
            scope: ["authentication.full_access", "offline_access"],
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, options);

        return {
            access_token: token,
            token_type: 'Bearer'
        };
    } catch (error) {
        console.error('Error in generateToken:', error);
        return null;
    }
}
async function generateTokenWebRtc(user) {
    try {
        const jti = uuidv4();
        const subject = user.id ? user.id.toString() : 'default_subject';
        const options = {
            algorithm: process.env.JWT_ALGO || 'HS256',
            expiresIn: process.env.JWT_EXPIRE_IN || '1h',
            jwtid: jti,
            subject: subject,
            issuer: process.env.JWT_ISS || 'your_issuer',
            header: {
                kid: process.env.JWT_KID || 'default_kid',
                typ: 'JWT',
                alg: process.env.JWT_ALGO || 'HS256'
            }
        };

        const payload = {
            user_id:user.user_id,
            name: user.name,
            mobile: user.mobile,
            login_id:user.login_id,
            user_mode_id:user.user_mode_id,
            scope: ["authentication.full_access", "offline_access"],
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, options);

        return {
            access_token: token,
            token_type: 'Bearer'
        };
    } catch (error) {
        console.error('Error in generateToken:', error);
        return null;
    }
}

module.exports = {
    authMiddleware,
    validateToken,
    validateTokenforWebRtc,
    generateToken,
    generateTokenWebRtc,
    authMiddlewareWebRtc
};
