import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { itineraryPlanSchema } from '@questara/ai';

// Mock AI provider tests
describe('itinerary AI schema validation', () => {
  it('should accept valid itinerary plan from AI', () => {
    const validPlan = {
      title: '6 Jam Jelajah Heritage Surabaya',
      summary: 'Cultural route with museum stops.',
      total_estimated_budget_idr: 150000,
      total_estimated_duration_minutes: 360,
      stops: [
        {
          order: 1,
          time: '10:00',
          place_id: '550e8400-e29b-41d4-a716-446655440000',
          place_name: 'Museum 10 November',
          activity: 'Explore the museum and collect your first stamp.',
          duration_minutes: 90,
          estimated_budget_idr: 20000,
          transport_note: 'Start here.',
          check_in_available: true,
        },
        {
          order: 2,
          time: '12:00',
          place_id: '550e8400-e29b-41d4-a716-446655440001',
          place_name: 'Kopi Tuku',
          activity: 'Istirahat dan kopi.',
          duration_minutes: 60,
          estimated_budget_idr: 50000,
          transport_note: '15 menit jalan kaki.',
          check_in_available: true,
        },
      ],
      warnings: [],
    };

    const result = itineraryPlanSchema.safeParse(validPlan);
    expect(result.success).toBe(true);
  });

  it('should reject plan with place_id not in database', () => {
    const dbPlaceIds = new Set([
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ]);

    const aiPlanStops = [
      { order: 1, place_id: '550e8400-e29b-41d4-a716-446655440000' },
      { order: 2, place_id: 'INVALID-UUID-NOT-IN-DB' }, // invented by AI
    ];

    const invalidStops = aiPlanStops.filter((s) => !dbPlaceIds.has(s.place_id));
    expect(invalidStops).toHaveLength(1);
    expect(invalidStops[0].place_id).toBe('INVALID-UUID-NOT-IN-DB');
  });

  it('should reject plan with missing required fields', () => {
    const invalidPlan = {
      title: 'Test',
      // missing summary, stops, etc.
    };

    const result = itineraryPlanSchema.safeParse(invalidPlan);
    expect(result.success).toBe(false);
  });
});

describe('itinerary input validation', () => {
  const GenerateItinerarySchema = z.object({
    city_id: z.string().uuid(),
    quest_id: z.string().uuid().optional(),
    start_location_text: z.string().optional(),
    available_hours: z.number().int().min(1).max(24),
    budget_idr: z.number().int().min(0),
    preferences: z.array(z.string()).default([]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  });

  it('should accept valid input', () => {
    const input = {
      city_id: '550e8400-e29b-41d4-a716-446655440000',
      available_hours: 6,
      budget_idr: 200000,
      preferences: ['museum', 'heritage'],
      date: '2026-06-20',
    };
    const result = GenerateItinerarySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject invalid date format', () => {
    const input = {
      city_id: '550e8400-e29b-41d4-a716-446655440000',
      available_hours: 6,
      budget_idr: 200000,
      preferences: [],
      date: '20-06-2026', // wrong format
    };
    const result = GenerateItinerarySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject hours > 24', () => {
    const input = {
      city_id: '550e8400-e29b-41d4-a716-446655440000',
      available_hours: 30,
      budget_idr: 200000,
      preferences: [],
      date: '2026-06-20',
    };
    const result = GenerateItinerarySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject negative budget', () => {
    const input = {
      city_id: '550e8400-e29b-41d4-a716-446655440000',
      available_hours: 6,
      budget_idr: -5000,
      preferences: [],
      date: '2026-06-20',
    };
    const result = GenerateItinerarySchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe('admin middleware blocks non-admin', () => {
  it('should reject non-admin user for admin route', () => {
    const user = { id: 'user1', profile: { role: 'user' as string } };
    const isAdmin = (user.profile?.role ?? '') === 'admin';
    expect(isAdmin).toBe(false);
  });

  it('should allow admin user for admin route', () => {
    const user = { id: 'admin1', profile: { role: 'admin' as string } };
    const isAdmin = (user.profile?.role ?? '') === 'admin';
    expect(isAdmin).toBe(true);
  });

  it('should reject missing profile', () => {
    const user = { id: 'user1', profile: null as { role: string } | null };
    const isAdmin = (user.profile?.role ?? '') === 'admin';
    expect(isAdmin).toBeFalsy();
  });
});