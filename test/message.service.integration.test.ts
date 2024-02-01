import { describe, expect, test } from '@jest/globals';
import { integrationTestSetup } from './setup';
import * as messageService from '../src/modules/messages/message.service';
import { Message, MessageType } from '../src/modules/messages/message.interface';
import { getMessageById } from '../src/modules/messages/message.service';

integrationTestSetup();

describe('getMessages', () => {
  test('can return messages', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
      dateCreated: 0,
      archived: false,
    });

    const [result] = await messageService.getMessages();
    expect(result).toMatchObject({
      _id,
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: 'text',
      dateCreated: expect.any(Number),
      dateReceived: null,
      dateRead: null,
      archived: false,
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
      dateCreated: 0,
      archived: false,
    });

    const results: any = await messageService.getMessages();
    const result: any = await messageService.getMessageById(_id);
    const resultToAssert = Object.create(result);
    expect(resultToAssert).toMatchObject({
      _id,
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: 'text',
      dateCreated: expect.any(Number),
      dateReceived: null,
      dateRead: null,
      archived: false,
    });
  });

  test('throws an error when no sender', async () => {
    await expect(
      messageService.createMessage({
        receiver: 'b',
        content: 'test',
        type: MessageType.text,
        dateCreated: 0,
        archived: false,
      })
    ).rejects.toThrow('"sender" is required');
  });

  test('throws an error when no receiver', async () => {
    await expect(
      messageService.createMessage({
        sender: 'a',
        content: 'test',
        type: MessageType.text,
        dateCreated: 0,
        archived: false,
      })
    ).rejects.toThrow('"receiver" is required');
  });

  test('throws an error when no content', async () => {
    await expect(
      messageService.createMessage({
        sender: 'a',
        receiver: 'b',
        type: MessageType.text,
        dateCreated: 0,
        archived: false,
      })
    ).rejects.toThrow('"content" is required');
  });

  test('throws an error when no type', async () => {
    await expect(
      messageService.createMessage({
        sender: 'a',
        receiver: 'b',
        content: 'test',
        dateCreated: 0,
        archived: false,
      })
    ).rejects.toThrow('"type" is required');
  });
});

describe('deleteMessageById', () => {
  test('can delete message', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
      dateCreated: 0,
      archived: false,
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
      dateCreated: 0,
      archived: false,
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
      dateCreated: 0,
      archived: false,
    });

    await messageService.updateMessageById(_id, { dateRead: 123 });

    const result = await messageService.getMessageById(_id);
    expect(result).toMatchObject({
      _id,
      dateRead: 123,
    });
  });

  test('can update dateRead', async () => {
    const { _id }: Message = await messageService.createMessage({
      sender: 'a',
      receiver: 'b',
      content: 'test',
      type: MessageType.text,
      dateCreated: 0,
      archived: false,
    });

    await messageService.updateMessageById(_id, { dateRead: 123 });

    const result = await messageService.getMessageById(_id);
    expect(result).toMatchObject({
      _id,
      dateRead: 123,
    });
  });
});