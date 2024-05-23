import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { formSchema } from '../model/add.js';
import nodemailer from 'nodemailer'; // Import Node Mailer
import crypto from 'crypto';

const accessTokenSecret = 'youraccesstokensecret';
const refreshTokenSecret = 'yourrefreshtokensecret';
const saltRounds = 10; // Number of salt rounds for bcrypt hashing

// Function to generate a secure random OTP
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function to send OTP by email
const sendOTPByEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'c82900354@gmail.com', // Replace with your Gmail address
                pass: 'nlou qmta zsmt vnyv' // Replace with your Gmail app-specific password
            }
        });

        const mailOptions = {
            from: '"Your Name" <yourgmailaddress@gmail.com>',
            to: email,
            subject: 'OTP for Verification',
            text: `Your OTP for verification is: ${otp}`
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully");
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw error;
    }
};

// Function to handle user registration
export const Fdata = async (req, res) => {
    const { name, email, password } = req.body;

    try {
          // Check if the username already exists in the database
          const existingUsername = await formSchema.findOne({ name });

          if (existingUsername) {
              return res.status(400).json({ message: "Username already exists" });
          }
  
          // Check if the email already exists in the database
          const existingEmail = await formSchema.findOne({ email });
  
          if (existingEmail) {
              return res.status(400).json({ message: "Email already exists" });
          }
        // Generate OTP
        const otp = generateOTP();

        // Send OTP by email
        await sendOTPByEmail(email, otp);

        // Save OTP in the user's document
        const user = new formSchema({
            name,
            email,
            password, // Store hashed password temporarily
            otp,
            admin:false,
            verified: false // User is not automatically verified
        });
        await user.save();
        res.status(201).json({ message: "OTP sent successfully", data: { name, email } });
    } catch (error) {
        console.error("Error sending OTP: ", error);
        res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
};

// Function to verify OTP
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Retrieve user document by email
        const user = await formSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.otp === otp) {
            // Reset invalid OTP attempts
            user.invalidOTPAttempts = 0;
            await user.save();

            // Update user document to mark as verified
            user.verified = true;
            await user.save();

            // Now save the user data
            const hashedPassword = await bcrypt.hash(user.password, saltRounds);
            user.password = hashedPassword; // Update password with hashed one
            await user.save();

            res.status(200).json({ message: "OTP verified successfully", data: { name: user.name, email: user.email } });
        } else {
            // Increment invalid OTP attempt count
            user.invalidOTPAttempts += 1;
            await user.save();

            // Check if the user has reached the maximum number of invalid attempts
            if (user.invalidOTPAttempts >= 3) {
                // Delete user data
                await formSchema.findOneAndDelete({ email });
                return res.status(401).json({ message: "Too many unsuccessful attempts. User data deleted." });
            }

            res.status(401).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error("Error verifying OTP: ", error);
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
};

// Function to retrieve user data
export const Fget = async (req, res) => {
    try {
      const clas = await formSchema.find();
      res.json(clas);
    } catch (clas) {
      console.log(console.log(error));
    }
  };

// Function to handle user login
export const login = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Find the user by username or email
        const user = await formSchema.findOne({ $or: [{ name }, { email }] });

        if (user) {
            // Compare the provided password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Generate an access token
                // const accessToken = jwt.sign({ name: user.name, role: user.role }, accessTokenSecret, { expiresIn: '15m' });

                // Generate a refresh token
                // const refreshToken = jwt.sign({ name: user.name, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });
                const accessToken = jwt.sign({ name: user.name, role: user.admin ? 'admin' : 'user' }, accessTokenSecret, { expiresIn: '15m' });
                const refreshToken = jwt.sign({ name: user.name, role: user.admin ? 'admin' : 'user' }, refreshTokenSecret, { expiresIn: '7d' });

                // Return the access token and refresh token
                res.json({ accessToken, refreshToken });
            } else {
                // Password is incorrect
                res.status(401).json({ message: 'Unauthorized' });
            }
        } else {
            // User not found
            res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.error("Error authenticating user: ", error);
        res.status(500).json({ message: "Error authenticating user", error: error.message });
    }
};

