export interface Message {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  type: MessageType;
  dateCreated: number;
  dateReceived: number;
  dateRead: number;
  archived: boolean;
}

export type MessageToSave = Omit<Message, "_id" >;

export interface IMessage {
    _id?: string;
    sender: string;
    receiver: string;
    content: string;
    type: MessageType;
    dateCreated?: number;
    dateReceived?: number;
    dateRead?: number;
    archived?: boolean;
  }

export enum MessageType {
  text = 'text',
  audio = 'audio',
  video = 'video',
  mixed = 'mixed',
}
