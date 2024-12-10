import cloudinary from "../lib/cloudinary.js"
import { io } from "../lib/socket.js"
import { generateToken } from "../lib/utils.js"
import user from "../models/user.model.js"
import bcrypt from 'bcryptjs'

export const signup = async (req, res) => {

    const { email, password, fullName } = req.body
    try {
        if (!email || !fullName) {
            return res.status(400).json({ error: 'Please provide email and full name' })
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' })
        }
        const Exuser = await user.findOne({ email })
        if (Exuser) {
            return res.status(400).json({ error: 'Email already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new user({ email, password: hashedPassword, fullName })
        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()
            io.emit('new-user', newUser);
            res.json({
                message: 'User registered successfully', _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            })
        }
        else {
            return res.status(400).json({ message: 'Error' })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' })

    }


}
export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            return res.json({
                error: 'Please provide email and password'
            })
        }
        const exUser = await user.findOne({ email })
        if (!exUser) {
            return res.status(401).json({
                error: 'User not found'
            })
        }
        const isMatch = await bcrypt.compare(password, exUser.password)
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials'
            })
        }
        generateToken(exUser._id, res)
        res.json({
            message: 'User logged in successfully', _id: exUser._id,
            fullName: exUser.fullName,
            email: exUser.email,
            profilePic: exUser.profilePic,
        })

    } catch (error) {
        console.log(error);

    }

}
export const logout = async (req, res) => {

    try {
        res.cookie('token', '', { maxAge: 0 })
        res.json({ message: 'User logged out successfully' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' })

    }
}


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body
        const userId = req.user._id
        if (!profilePic) {
            return res.status(400).json({ error: 'Please provide a profile picture' })
        }
        const response = await cloudinary.uploader.upload(profilePic)
        const updatedUser = await user.findByIdAndUpdate(userId, { profilePic: response.secure_url }, { new: true })

        res.json({
            message: 'Profile updated successfully',
            updatedUser
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' })

    }
}

export const checkAuth = async (req, res) => {
    try {
        res.json(req.user)
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server error' })

    }
}