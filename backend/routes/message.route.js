import express from 'express';
import { protecRoute } from '../middlewares/auth.middleware.js';
import { getUserSideBar, sendMessage, getMessages } from '../controllers/message.controller.js';

const messageRoute = express.Router()

messageRoute.get('/users',protecRoute, getUserSideBar)
messageRoute.get('/:id', protecRoute, getMessages)
messageRoute.post('/send/:id', protecRoute, sendMessage)

export default messageRoute
