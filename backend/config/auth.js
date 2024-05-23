import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
    return jwt.sign(user, 'access-secret', { expiresIn: '15m' }); // Token expires in 15 minutes
};

// Function to generate refresh token
export const generateRefreshToken = (user) => {
    return jwt.sign(user, 'refresh-secret', { expiresIn: '7d' }); // Token expires in 7 days
};