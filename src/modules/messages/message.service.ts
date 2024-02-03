import Joi, { Schema } from 'joi';
import { Message, MessageToSave, MessageType } from './message.interface';
import MessageModel from './message.model';
import { validate } from '../../shared/errors';
import { mongooseDbOperation } from '../../shared/mongoose.helpers';

export const getMessages = (): Promise<Message[]> => {
  return mongooseDbOperation(() => MessageModel.find()) as Promise<Message[]>;
};

export const getMessageById = (id: string): Promise<Message> => {
  return mongooseDbOperation(() => MessageModel.findOne({ _id: id })) as Promise<Message>;
};

const createMessageValidationSchema: Schema = Joi.object({
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
  content: Joi.string().required(),
  type: Joi.string().valid(MessageType.audio, MessageType.video, MessageType.video, MessageType.mixed).required(),
});

export const createMessage = async (message: any): Promise<Message> => {
  await validate(createMessageValidationSchema, message);

  const messageToSave: MessageToSave = {
    sender: message.sender,
    receiver: message.receiver,
    content: message.content,
    type: message.type,
    dateCreated: new Date().getTime(),
    dateReceived: null,
    dateRead: null,
    archived: false,
  };

  return mongooseDbOperation(() => new MessageModel(messageToSave).save()) as Promise<Message>;
};

export const deleteMessageById = (id: string): Promise<Message> => {
  return mongooseDbOperation(() => MessageModel.findOneAndDelete({ _id: id })) as Promise<Message>;
};

const updateMessageValidationSchema: Schema = Joi.object({
  sender: Joi.string(),
  receiver: Joi.string(),
  content: Joi.string(),
  type: Joi.string().valid(MessageType.audio, MessageType.video, MessageType.video, MessageType.mixed),
  dateCreated: Joi.number(),
  dateReceived: Joi.number(),
  dateRead: Joi.number(),
  archived: Joi.bool(),
});

export const updateMessageById = async (id: string, message: any): Promise<Message> => {
  await validate(updateMessageValidationSchema, message);

  const operation = async () => {
    const dbMessage = await MessageModel.findOne({ _id: id });

    dbMessage.sender = message.sender || dbMessage.sender;
    dbMessage.receiver = message.receiver || dbMessage.receiver;
    dbMessage.content = message.content || dbMessage.content;
    dbMessage.type = message.type || dbMessage.type;
    dbMessage.dateCreated = message.dateCreated || dbMessage.dateCreated;
    dbMessage.dateReceived = message.dateReceived || dbMessage.dateReceived;
    dbMessage.dateRead = message.dateRead || dbMessage.dateRead;
    dbMessage.archived = message.archived || dbMessage.archived;

    return dbMessage.save();
  };

  return mongooseDbOperation(operation) as Promise<Message>;
};
