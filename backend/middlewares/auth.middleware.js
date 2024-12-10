import jwt from 'jsonwebtoken'
import user from '../models/user.model.js'

export const protecRoute = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: 'Token is required' })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ message: 'Token is invalid' })
        }
        const Exuser = await user.findById(decoded.userId).select("-password")
        if (!Exuser) {
            return res.status(401).json({ message: 'User not found' })
        }
        req.user = Exuser
        next()
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' })

    }
}