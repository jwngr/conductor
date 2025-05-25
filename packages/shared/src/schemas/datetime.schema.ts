import {z} from 'zod';

export const TimeOfDaySchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
});
