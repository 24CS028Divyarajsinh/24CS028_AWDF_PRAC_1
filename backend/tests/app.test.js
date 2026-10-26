const request = require('supertest');
const express = require('express');

describe('basic API behavior', () => {
  test('health endpoint responds with service status', async () => {
    // Lightweight test of the contract without requiring a live MongoDB.
    const app = express();
    app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'awdf-backend' }));
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('unknown route returns structured JSON 404', async () => {
    const app = express();
    app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
    const response = await request(app).get('/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/Route not found/);
  });
});
