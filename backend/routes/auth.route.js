import express from 'express';
import { login, logout, signup, checkAuth, updateProfile } from '../controllers/auth.controller.js';
import { protecRoute } from '../middlewares/auth.middleware.js';

const authRoutes = express.Router()

authRoutes.post('/signup', signup)
authRoutes.post('/login', login)
authRoutes.post('/logout', logout)
authRoutes.put('/update-profile', protecRoute, updateProfile)
authRoutes.get('/check', protecRoute, checkAuth)
export default authRoutes