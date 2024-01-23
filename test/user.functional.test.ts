import { describe, test } from '@jest/globals';
import request from 'supertest';
import { functionalTestSetup } from './setup';

const { app } = functionalTestSetup();

describe('Authentication routes', () => {
  describe('users GET', () => {
    test('returns list of users', async () => {
    });
  });
});
