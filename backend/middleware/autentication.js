
import jwt from 'jsonwebtoken';

export const verifyToken =  (req, res, next) => {
    const accessTokenSecret = 'youraccesstokensecret';

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, accessTokenSecret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};
