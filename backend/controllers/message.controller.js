import cloudinary from "../lib/cloudinary.js"
import { getReceiverSocketId, io } from "../lib/socket.js"
import Message from "../models/message.model.js"
import user from "../models/user.model.js"

export const getUserSideBar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id
        const filteredUsers = await user.find({ _id: { $ne: loggedInUserId } }).select("-password")

        res.status(200).json({
            filteredUsers
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" })

    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params
        const myId = req.user._id

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })
        res.status(200).json({
            messages
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" })

    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body
        const { id: receiverId } = req.params;

        const senderId = req.user._id
        let imageUrl;
        if (image) {
            const uploaderResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploaderResponse.secure_url

        }
        const newMessage = new Message({
            senderId, receiverId, text, image: imageUrl
        })
        await newMessage.save()

        const senderDetails = await user.findById(senderId).select("-password")



        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json({ message: "Message sent successfully", newMessage })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'error' })

    }
}
