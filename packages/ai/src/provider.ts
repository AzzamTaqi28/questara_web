import { z } from 'zod';

export interface GenerateItineraryInput {
  city_id: string;
  quest_id?: string;
  start_location_text?: string;
  available_hours: number;
  budget_idr: number;
  preferences: string[];
  date: string;
}

export interface ParseSubmissionInput {
  submission_id: string;
}

const GenerateItineraryOutputSchema = z.object({
  ok: z.boolean(),
  itinerary_id: z.string().uuid().optional(),
  plan: z.object({
    title: z.string(),
    summary: z.string(),
    total_estimated_budget_idr: z.number().nullable(),
    total_estimated_duration_minutes: z.number().nullable(),
    stops: z.array(
      z.object({
        order: z.number(),
        time: z.string().nullable(),
        place_id: z.string().uuid(),
        place_name: z.string(),
        activity: z.string(),
        duration_minutes: z.number().nullable(),
        estimated_budget_idr: z.number().nullable(),
        transport_note: z.string().nullable(),
        check_in_available: z.boolean(),
      })
    ),
    warnings: z.array(z.string()),
  }),
});

const ParseSubmissionOutputSchema = z.object({
  ok: z.boolean(),
  extracted_data: z.object({
    title: z.string().optional(),
    date_text: z.string().optional(),
    location_text: z.string().optional(),
    price_text: z.string().optional(),
    tags: z.array(z.string()).optional(),
    confidence: z.number().optional(),
    missing_fields: z.array(z.string()).optional(),
  }),
});

export type GenerateItineraryOutput = z.infer<typeof GenerateItineraryOutputSchema>;
export type ParseSubmissionOutput = z.infer<typeof ParseSubmissionOutputSchema>;

export interface AIProvider {
  generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput>;
  parseSubmission(input: ParseSubmissionInput): Promise<ParseSubmissionOutput>;
}

export class MockAIProvider implements AIProvider {
  private static instance: MockAIProvider;

  static getInstance(): MockAIProvider {
    if (!MockAIProvider.instance) {
      MockAIProvider.instance = new MockAIProvider();
    }
    return MockAIProvider.instance;
  }

  async generateItinerary(input: GenerateItineraryInput): Promise<GenerateItineraryOutput> {
    // Deterministic mock: build a basic route matching user's hours and preferences
    const parts = input.preferences.length > 0 
      ? input.preferences.join(', ') 
      : 'heritage dan museum';

    return {
      ok: true,
      itinerary_id: crypto.randomUUID(),
      plan: {
        title: `Itinerary Surabaya - ${parts}`,
        summary: 'Rute pilihan untuk menjelajahi Surabaya. AI provider belum aktif; ini adalah demo mock.',
        total_estimated_budget_idr: Math.round(input.budget_idr * 0.7),
        total_estimated_duration_minutes: input.available_hours * 60,
        stops: [
          {
            order: 1,
            time: '09:00',
            place_id: crypto.randomUUID(),
            place_name: 'Museum 10 November',
            activity: 'Belajar sejarah perjuangan arek-arek Surabaya.',
            duration_minutes: 90,
            estimated_budget_idr: 20000,
            transport_note: 'Jalan kaki dari titik start jika dekat.',
            check_in_available: true,
          },
          {
            order: 2,
            time: '11:00',
            place_id: crypto.randomUUID(),
            place_name: 'Kopi Tuku — Jalan Gula',
            activity: 'Istirahat sejenak sambil menikmati kopi khas Surabaya.',
            duration_minutes: 60,
            estimated_budget_idr: 50000,
            transport_note: 'Berjalan sekitar 15 menit dari museum.',
            check_in_available: true,
          },
        ],
        warnings: [
          'AI provider tidak aktif (mock mode). Stops adalah placeholder, bukan data dari database.',
          'Production: DEMAND AI must only use places from the database.',
        ],
      },
    };
  }

  async parseSubmission(input: ParseSubmissionInput): Promise<ParseSubmissionOutput> {
    return {
      ok: true,
      extracted_data: {
        title: undefined,
        confidence: 0,
        missing_fields: ['title', 'date_text', 'location_text'],
      },
    };
  }
}