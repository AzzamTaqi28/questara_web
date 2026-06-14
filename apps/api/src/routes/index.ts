import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';

import healthz from './healthz.js';
import auth from './auth.js';

// Public routes
import publicCities from './public/cities.js';
import publicPlaces from './public/places.js';
import publicQuests from './public/quests.js';
import publicEvents from './public/events.js';

// User routes
import checkin from './checkin.js';
import itineraries from './itineraries.js';
import passport from './passport.js';
import submissions from './submissions.js';

// Admin routes
import adminCities from './admin/cities.js';
import adminPlaces from './admin/places.js';
import adminEvents from './admin/events.js';
import adminQuests from './admin/quests.js';
import adminStamps from './admin/stamps.js';
import adminSubmissions from './admin/submissions-admin.js';
import adminUsers from './admin/users.js';
import adminCheckIns from './admin/check-ins.js';

export function registerRoutes(app: Hono) {
  // Health check
  app.route('/healthz', healthz);

  // Auth
  app.route('/auth', auth);

  // ── Public routes ─────────────────────────────────────────────
  app.route('/cities', publicCities);
  app.route('/places', publicPlaces);
  app.route('/quests', publicQuests);
  app.route('/events', publicEvents);

  // ── User routes (require auth) ────────────────────────────────
  app.route('/check-in', checkin);
  app.route('/itineraries', itineraries);
  app.route('/passport', passport);
  app.route('/submissions', submissions);

  // ── Admin routes (require auth + admin role) ──────────────────
  // Cities
  app.route('/admin/cities', adminCities);

  // Places
  app.route('/admin/places', adminPlaces);

  // Events
  app.route('/admin/events', adminEvents);

  // Quests (includes nested stops and reorder)
  app.route('/admin/quests', adminQuests);

  // Stamps
  app.route('/admin/stamps', adminStamps);

  // Submissions (admin review)
  app.route('/admin/submissions', adminSubmissions);

  // Users
  app.route('/admin/users', adminUsers);

  // Check-ins
  app.route('/admin/check-ins', adminCheckIns);
}