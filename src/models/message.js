const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  message: { type: String, required: true },
  room: { type: String, required: true }, // Sala específica
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
