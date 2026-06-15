import { z } from 'zod';
import { requestTypeSchema } from './shared';
import { householdSchema, familyMemberRowSchema } from './household';
import { personSchema } from './person';

export const changeRequestSchema = z.object({
  request_type: requestTypeSchema,
  target_table: z.string().min(1),
  target_record_id: z.string().uuid().optional().nullable(),
  proposed_data: z.record(z.string(), z.any()),
  current_data: z.record(z.string(), z.any()).optional().nullable(),
  admin_notes: z.string().max(2000).optional().nullable(),
});

export const newHouseholdRequestSchema = z.object({
  household: householdSchema,
  members: z.array(familyMemberRowSchema).min(1),
});

export const updateHouseholdRequestSchema = z.object({
  household_id: z.string().uuid(),
  changes: householdSchema.partial(),
});

export const updatePersonRequestSchema = z.object({
  person_id: z.string().uuid(),
  changes: personSchema.partial(),
});

export const markDeceasedRequestSchema = z.object({
  person_id: z.string().uuid(),
  date_of_death: z.string().date(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});

export type ChangeRequestInput = z.infer<typeof changeRequestSchema>;
