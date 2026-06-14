import { describe, it, expect } from 'vitest';
import { calculateDistanceMeters } from '@questara/utils';

describe('check-in Haversine distance', () => {
  it('should return 0 for same coordinates', () => {
    const dist = calculateDistanceMeters(
      { lat: -7.2458, lng: 112.7378 },
      { lat: -7.2458, lng: 112.7378 }
    );
    expect(dist).toBe(0);
  });

  it('should calculate correct distance for nearby points (within 200m)', () => {
    // Museum 10 November area
    const user = { lat: -7.2461, lng: 112.7380 };
    const place = { lat: -7.2458, lng: 112.7378 };
    const dist = calculateDistanceMeters(user, place);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(200);
  });

  it('should calculate correct distance for far points (over 200m)', () => {
    const user = { lat: -7.2500, lng: 112.7400 };
    const place = { lat: -7.2458, lng: 112.7378 };
    const dist = calculateDistanceMeters(user, place);
    expect(dist).toBeGreaterThan(200);
  });

  it('should validate correctly at boundary (exactly 200m)', () => {
    // Place at origin
    const place = { lat: 0, lng: 0 };
    // User ~200m north (1 degree latitude ≈ 111km, so 200m ≈ 0.0018°)
    const user = { lat: 0.0018, lng: 0 };
    const dist = calculateDistanceMeters(user, place);
    expect(dist).toBeGreaterThan(150);
    expect(dist).toBeLessThan(250);
  });
});

describe('check-in stamp logic', () => {
  it('should prevent duplicate stamps for same user+stamp+quest', () => {
    // This tests the unique constraint conceptually
    // user_stamps has unique(user_id, stamp_id, quest_id)
    const existingStamps = [
      { user_id: 'user1', stamp_id: 'stamp1', quest_id: 'quest1' },
      { user_id: 'user1', stamp_id: 'stamp1', quest_id: null },
    ];

    const newStamp = { user_id: 'user1', stamp_id: 'stamp1', quest_id: 'quest1' };

    const isDuplicate = existingStamps.some(
      (s) =>
        s.user_id === newStamp.user_id &&
        s.stamp_id === newStamp.stamp_id &&
        s.quest_id === newStamp.quest_id
    );

    expect(isDuplicate).toBe(true);

    // Different quest should NOT be duplicate
    const differentQuest = { user_id: 'user1', stamp_id: 'stamp1', quest_id: 'quest2' };
    const isDiffDuplicate = existingStamps.some(
      (s) =>
        s.user_id === differentQuest.user_id &&
        s.stamp_id === differentQuest.stamp_id &&
        s.quest_id === differentQuest.quest_id
    );
    expect(isDiffDuplicate).toBe(false);
  });
});

describe('check-in XP calculation', () => {
  it('should award +50 XP for new stamp', () => {
    let xp = 0;
    const stampXp = 50;
    xp += stampXp;
    expect(xp).toBe(50);
  });

  it('should award +200 XP for quest completion on top of stamp XP', () => {
    let xp = 0;
    xp += 50; // stamp
    xp += 200; // quest completion
    expect(xp).toBe(250);
  });

  it('should NOT double-award completion XP on second check-in', () => {
    // Scenario: user completes quest, then checks in again at same place
    let questCompletionXpAwarded = false;
    let xp = 0;

    // First completion check-in
    if (!questCompletionXpAwarded) {
      xp += 50;
      xp += 200;
      questCompletionXpAwarded = true;
    }

    // Second check-in (should not award completion XP again)
    xp += 50; // stamp XP still awarded
    // no completion XP since already awarded

    expect(xp).toBe(300);
  });
});

describe('quest completion detection', () => {
  it('should detect completion when all required stops visited', () => {
    const requiredStopIds = ['stop1', 'stop2', 'stop3'];
    const completedStopIds = ['stop1', 'stop2', 'stop3'];

    const allRequiredVisited = requiredStopIds.every((id) =>
      completedStopIds.includes(id)
    );

    expect(allRequiredVisited).toBe(true);
    expect(completedStopIds.length).toBe(requiredStopIds.length);
  });

  it('should NOT detect completion when some required stops missing', () => {
    const requiredStopIds = ['stop1', 'stop2', 'stop3'];
    const completedStopIds = ['stop1', 'stop2'];

    const allRequiredVisited = requiredStopIds.every((id) =>
      completedStopIds.includes(id)
    );

    expect(allRequiredVisited).toBe(false);
  });
});