import mongoose from 'mongoose';
import { MessageType } from './message.interface';

const MessageSchema = new mongoose.Schema({
  sender: { type: String, ruquired: false },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, required: true, enum: [MessageType.text, MessageType.audio, MessageType.video, MessageType.mixed] },
  dateCreated: { type: Number, required: true },
  dateReceived: { type: Number, required: false },
  dateRead: { type: Number, required: false },
  archived: { type: Boolean, required: true },
});

const MessageModel = mongoose.model('Message', MessageSchema);

export default MessageModel;
