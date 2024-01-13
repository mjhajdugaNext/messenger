import { describe, test } from '@jest/globals';
import request from 'supertest';
import { functionalTestSetup } from './setup';

const { app, server } = functionalTestSetup();

describe('Authentication routes', () => {
  describe('register POST', () => {
    test('Registers user', async () => {
      const userData = {
        email: 'mjhajduga1@gmail.com',
        username: 'mjhajduga',
        password: 'password',
      };

      const response = await request(app).post('/auth/register').send(userData);
      console.log('response', response)
    });
  });
});
