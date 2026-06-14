import { z } from 'zod';

export const uuidSchema = z.string().uuid();

export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const optionalCoordinateSchema = coordinateSchema.optional();

export { z };