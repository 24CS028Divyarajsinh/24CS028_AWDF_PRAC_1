const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const EventEmitter = require('events');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Task = require('./models/Task');
const { requireAuth } = require('./middleware/auth');

const app = express();
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
const taskEvents = new EventEmitter();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));

// Practical 4: request logging middleware.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Reject non-JSON POST/PUT/PATCH requests when a body is expected.
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) &&
      req.path !== '/api/auth/login' && req.path !== '/api/auth/register' &&
      req.path !== '/api/ai/generate-description' &&
      !req.is('application/json')) {
    return res.status(415).json({ message: 'Content-Type must be application/json.' });
  }
  next();
});

// Practical 10: event listeners. Delay simulates background notification work.
taskEvents.on('task-created', (taskData) => {
  setTimeout(() => {
    console.log(`[NOTIFICATION] Task created: "${taskData.title}" | user=${taskData.user} | at=${new Date().toISOString()}`);
  }, 200);
});
taskEvents.on('task-deleted', (taskData) => {
  setTimeout(() => console.log(`[NOTIFICATION] Task deleted: "${taskData.title}" | at=${new Date().toISOString()}`), 100);
});
taskEvents.on('error', (error) => console.error('[EVENT ERROR]', error.message));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'awdf-backend' }));

// Authentication routes (Practical 7).
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await User.create({ name: String(name).trim(), email: normalizedEmail, passwordHash });
    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET || 'dev-only-secret-change-me', { expiresIn: '1h' });
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET || 'dev-only-secret-change-me', { expiresIn: '1h' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { next(error); }
});

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email } }));

// Practical 5/6/9: MongoDB CRUD, per-user isolation, caching and invalidation.
app.get('/api/tasks', requireAuth, async (req, res, next) => {
  try {
    const key = `tasks:${req.user._id}`;
    const cached = cache.get(key);
    if (cached) return res.json({ tasks: cached, cache: 'HIT' });
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    cache.set(key, tasks);
    return res.json({ tasks, cache: 'MISS' });
  } catch (error) { next(error); }
});

app.get('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid task ID format.' });
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    return res.json({ task });
  } catch (error) { next(error); }
});

app.post('/api/tasks', requireAuth, async (req, res, next) => {
  try {
    const { title, description = '', priority = 'medium', deadline = null } = req.body || {};
    if (typeof title !== 'string' || !title.trim()) return res.status(400).json({ message: 'A non-empty title is required.' });
    const task = await Task.create({ title, description, priority, deadline: deadline || null, user: req.user._id });
    cache.del(`tasks:${req.user._id}`);
    taskEvents.emit('task-created', { title: task.title, user: req.user.email, taskId: task._id.toString() });
    console.log(`[API RESPONSE] POST /api/tasks returned at ${new Date().toISOString()}`);
    return res.status(201).json({ task });
  } catch (error) { next(error); }
});

app.put('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid task ID format.' });
    const allowed = ['title', 'description', 'completed', 'priority', 'deadline'];
    const updates = {};
    for (const field of allowed) if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) updates[field] = req.body[field];
    if (updates.title !== undefined && (typeof updates.title !== 'string' || !updates.title.trim())) {
      return res.status(400).json({ message: 'Title cannot be empty.' });
    }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    cache.del(`tasks:${req.user._id}`);
    return res.json({ task });
  } catch (error) { next(error); }
});

app.delete('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) return res.status(400).json({ message: 'Invalid task ID format.' });
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    cache.del(`tasks:${req.user._id}`);
    taskEvents.emit('task-deleted', { title: task.title, user: req.user.email });
    return res.json({ message: 'Task deleted successfully.' });
  } catch (error) { next(error); }
});

app.get('/api/cache/stats', requireAuth, (req, res) => {
  res.json({ keys: cache.keys().length, hits: cache.getStats().hits, misses: cache.getStats().misses, ttlSeconds: 60 });
});

// Practical 13: optional Gemini integration. API key remains on the server.
app.post('/api/ai/generate-description', requireAuth, async (req, res) => {
  const { title } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Enter a task title first.' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      message: 'AI suggestions are not configured. Add GEMINI_API_KEY to backend/.env or the root .env. Your task manager still works normally.'
    });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Write a concise, practical task description (2-3 sentences) for this task title. Do not include sensitive personal information. Title: ${title.trim()}` }] }] }),
      signal: controller.signal
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({ message: 'The AI service could not generate a suggestion right now. You can enter the description manually.' });
    }
    const description = data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
    if (!description) return res.status(502).json({ message: 'The AI service returned an empty suggestion. Please write the description manually.' });
    return res.json({ description, disclaimer: 'AI-generated suggestion. Review it before saving.' });
  } catch (error) {
    const timedOut = error.name === 'AbortError';
    return res.status(502).json({ message: timedOut ? 'The AI request timed out. Please try again or write the description manually.' : 'AI is temporarily unavailable. Your task manager still works normally.' });
  } finally {
    clearTimeout(timeout);
  }
});

// Structured 404 handler.
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

// Practical 4/5: global error handler must be last.
app.use((error, req, res, next) => {
  console.error('[ERROR]', error.message);
  if (res.headersSent) return next(error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Validation failed.', errors: Object.values(error.errors).map(item => item.message) });
  }
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid identifier.' });
  if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

module.exports = { app, cache, taskEvents };
