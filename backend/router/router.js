import express from 'express';
import { Fdata, Fget, login,verifyOTP } from '../controller/controller.js';
import { verifyToken } from '../middleware/autentication.js';

const router = express.Router();

router.post("/insert", Fdata);
router.post("/verifyOTP", verifyOTP); 
router.get("/get", Fget);
router.post("/login", login);

router.get("/protected", verifyToken, (req, res) => {
    const userName = req.user.name;
    res.json({ message: `This is a protected route for ${userName}` });
});

export default router;
