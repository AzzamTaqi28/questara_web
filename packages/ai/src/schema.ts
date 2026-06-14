import { z } from 'zod';

export const ItineraryStopSchema = z.object({
  order: z.number(),
  time: z.string().nullable(),
  place_id: z.string().uuid(),
  place_name: z.string(),
  activity: z.string(),
  duration_minutes: z.number().nullable(),
  estimated_budget_idr: z.number().nullable(),
  transport_note: z.string().nullable(),
  check_in_available: z.boolean(),
});

export const itineraryPlanSchema = z.object({
  title: z.string(),
  summary: z.string(),
  total_estimated_budget_idr: z.number().nullable(),
  total_estimated_duration_minutes: z.number().nullable(),
  stops: z.array(ItineraryStopSchema),
  warnings: z.array(z.string()),
});

export type ItineraryPlan = z.infer<typeof itineraryPlanSchema>;