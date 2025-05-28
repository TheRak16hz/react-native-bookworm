import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const generateToken = (userId) => {
    jwt.sign({ userId }, process.env.JWT_SECRET, {expiresIn: "15d"})
}

router.post("/register", async (req, res) => {
    try {
        const { cedula, email, password } = req.body;
        if (!cedula || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        if (cedula .length < 8) {
            return res.status(400).json({ message: "Cedula must be at least 8 characters" });
        }



        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const existingCedula = await User.findOne({ cedula });
        if (existingCedula) {
            return res.status(400).json({ message: "Cedula already exists" });
        }

        //get random avatar
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${cedula}`;

        const user = new User({
            cedula,
            email,
            password,
        });

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json({
            token,
            user: {
                _id: user._id,
                id: user.id,
                cedula: user.cedula,
                email: user.email,
                profileImage: user.profileImage,
            }
        })
    } catch (error) {
        console.log("Error in register route", error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { cedula, password } = req.body;
        
        if (!cedula || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //check if user exists
        const user = await User.findOne({ cedula });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        //check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //generate token
        const token = generateToken(user._id);

        res.status(200).json({
            token,
            user: {
                _id: user._id,
                id: user.id,
                cedula: user.cedula,
                email: user.email,
                profileImage: user.profileImage,
            }
        })


    } catch (error) {
        console.log("Error in login route", error);
        res.status(500).json({ message: "Internal Server error" });
    }
});

export default router;