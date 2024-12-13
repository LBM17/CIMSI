const mongoose = require('mongoose');
const msg = require('./messageModel');
const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, required: true },
  groupName: { type: String, required: false },
  groupAvatar: { type: String, required: false },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  lastMessage: [{ type: String, required: false}],
  lastMessageSender: [{ type: String, required: false}]
});


const Chat = mongoose.model('Chat', chatSchema, 'Chats');

module.exports = Chat;