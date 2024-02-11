import { describe, expect, test } from '@jest/globals';
import { integrationTestSetup } from './setup';
import * as messageService from '../src/modules/messages/message.service';
import { Message, MessageType } from '../src/modules/messages/message.interface';

integrationTestSetup();

describe('getMessages', () => {
  test('can return messages', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
    });

    const [results] = await messageService.getMessages();
    expect(results).toMatchObject({
      _id,
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: 'text',
      dateCreated: expect.any(Number),
      dateReceived: null,
      dateRead: null,
    });
  });
});

describe('createMessage', () => {
  test('creates message', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
    });

    const result: any = await messageService.getMessageById(_id);
    expect(result).toMatchObject({
      _id,
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: 'text',
      dateCreated: expect.any(Number),
      dateReceived: null,
      dateRead: null,
    });
  });

  test('throws an error when no sender', async () => {
    await expect(
      messageService.createMessage({
        receiver: 'b',
        content: 'test',
        type: MessageType.text,
      })
    ).rejects.toThrow('"sender" is required');
  });

  test('throws an error when no receiver', async () => {
    await expect(
      messageService.createMessage({
        sender: 'a',
        content: 'test',
        type: MessageType.text,
      })
    ).rejects.toThrow('"receiver" is required');
  });

  test('throws an error when no content', async () => {
    await expect(
      messageService.createMessage({
        sender: 'a',
        receiver: 'b',
        type: MessageType.text,
      })
    ).rejects.toThrow('"content" is required');
  });

  test('throws an error when no type', async () => {
    await expect(
      messageService.createMessage({
        sender: 'a',
        receiver: 'b',
        content: 'test',
      })
    ).rejects.toThrow('"type" is required');
  });

  test('throws an error when no type is not valid', async () => {
    await expect(
      messageService.createMessage({
        sender: 'a',
        receiver: 'b',
        content: 'test',
        type: 'asd',
      })
    ).rejects.toThrow('"type" must be one of [text, audio, video, mixed]');
  });
});

describe('deleteMessageById', () => {
  test('can delete message', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
    });

    await messageService.deleteMessageById(_id);

    const results = await messageService.getMessages();
    expect(results).toEqual([]);
  });
});

describe('updateUserById', () => {
  test('can update dateReceived', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
    });

    await messageService.updateMessageById(_id, { dateReceived: 123 });

    const result = await messageService.getMessageById(_id);
    expect(result).toMatchObject({
      _id,
      dateReceived: 123,
    });
  });

  test('can update dateRead', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
    });

    await messageService.updateMessageById(_id, { dateRead: 123 });

    const result = await messageService.getMessageById(_id);
    expect(result).toMatchObject({
      _id,
      dateRead: 123,
    });
  });

  test('can update archived', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
    });

    await messageService.updateMessageById(_id, { archived: true });

    const result = await messageService.getMessageById(_id);
    expect(result).toMatchObject({
      _id,
      archived: true,
    });
  });
});
