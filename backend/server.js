import express from 'express';
import dotenv from 'dotenv'
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import messageRoute from './routes/message.route.js';
import { app, server } from './lib/socket.js';
dotenv.config()


const PORT = process.env.PORT || 5000;



app.use(cookieParser())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
    cors({
        origin: "https://chatt-app-frontend-kdr9.onrender.com",
        credentials: true,
    })
);


app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoute)
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB()
})
