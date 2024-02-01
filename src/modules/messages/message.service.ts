import { omit } from 'ramda';
import { mergeDeepRight } from 'ramda';
import Joi, { Schema } from 'joi';
import { IMessage, Message, MessageToSave } from './message.interface';
import MessageModel from './message.model';
import { ApiError, validate } from '../../shared/errors';
import { mongooseDbCollectionOperation, mongooseDbOperation } from '../../shared/mongoose.helpers';

export const getMessages = (): Promise<Object[]> => mongooseDbCollectionOperation(() => MessageModel.find());

export const getMessageById = (id: string): Promise<Object> =>
  mongooseDbOperation(() => MessageModel.findOne({ _id: id }));

const createMessageValidationSchema: Schema = Joi.object({
  sender: Joi.string().required(),
  receiver: Joi.string().required(),
  content: Joi.string().required(),
  type: Joi.string().required(),
}).unknown(true);

export const createMessage = async (message: any): Promise<Message> => {
  await validate(createMessageValidationSchema, message);

  const messageToSave: MessageToSave = {
    sender: message.sender,
    receiver: message.receiver,
    content: message.content,
    type: message.type,
    dateCreated: new Date().getTime(),
    dateReceived: message.dateReceived ?? null,
    dateRead: message.dateRead ?? null,
    archived: message.archived ?? false,
  };

  const result = await new MessageModel(messageToSave).save();
  return result.toObject();
};

export const deleteMessageById = (id: string) => mongooseDbOperation(() => MessageModel.findOneAndDelete({ _id: id }));

const updateMessageValidationSchema: Schema = Joi.object({
  sender: Joi.string(),
  receiver: Joi.string(),
  content: Joi.string(),
  type: Joi.string(),
  dateCreated: Joi.number(),
  dateReceived: Joi.number(),
  dateRead: Joi.number(),
  archived: Joi.string(),
});

export const updateMessageById = async (id: string, message: any) => {
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

    return dbMessage.save();
  };
  return mongooseDbOperation(operation);
};
