const express = require('express');
const { sendMessage, getMessages, getChats } = require('../controllers/chatController');
const authenticate = require('../middleware/authenticate');
const { getUserChats } = require('../controllers/userController');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');
const router = express.Router();

// Obtener los chats de un usuario
router.get('/', authenticate, getChats, async (req, res) => {

  router.get('/Messages/:chatId', authenticate, getMessages);

  // Ruta para enviar un mensaje
  router.post('/Messages', authenticate, sendMessage);

  try {
    // Obtener los chats del usuario y sus mensajes
    const chats = await Chat.find({ members: req.user.id })
      .populate('messages')                                                           // Poblamos los mensajes del chat
      .sort({ createdAt: -1 });                                                       // Ordenamos los chats por fecha de creación (más reciente primero)

    res.status(200).json(chats);
    
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(500).json({ message: "Error al obtener los chats" });
  }
});


module.exports = router;

