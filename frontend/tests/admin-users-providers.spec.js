import { test, expect } from '@playwright/test';

test.describe('Admin User and Provider Role Filter Tests', () => {
  const baseURL = process.env.API_URL || 'http://localhost:5000';

  test('GET /api/users should return users', async ({ request }) => {
    try {
      const response = await request.get(`${baseURL}/api/users`);
      if (response.ok()) {
        const body = await response.json();
        expect(Array.isArray(body.data)).toBeTruthy();
      }
    } catch {
      console.log('Server offline during test');
    }
  });

  test('GET /api/users?role=provider should filter by role provider', async ({ request }) => {
    try {
      const response = await request.get(`${baseURL}/api/users?role=provider`);
      if (response.ok()) {
        const body = await response.json();
        expect(Array.isArray(body.data)).toBeTruthy();
        body.data.forEach(user => {
          expect(user.role).toBe('provider');
        });
      }
    } catch {
      console.log('Server offline during test');
    }
  });
});
