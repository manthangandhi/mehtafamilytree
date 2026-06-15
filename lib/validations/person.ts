import { z } from 'zod';
import { optionalEmail, optionalPhone, dateSchema, genderSchema, maritalStatusSchema } from './shared';

export const personSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Full name is required').max(120),
    gender: genderSchema,
    date_of_birth: dateSchema,
    date_of_death: dateSchema,
    is_deceased: z.boolean().default(false),
    education: z.string().trim().max(120).optional().or(z.literal('')),
    occupation: z.string().trim().max(120).optional().or(z.literal('')),
    marital_status: maritalStatusSchema,
    mobile_number: optionalPhone,
    whatsapp_number: optionalPhone,
    email: optionalEmail,
    blood_group: z.string().trim().max(10).optional().or(z.literal('')),
    avatar_url: z.string().url().optional().or(z.literal('')),
    notes: z.string().trim().max(2000).optional().or(z.literal('')),
    visibility_level: z.enum(['public', 'members', 'admin']).default('members'),
  })
  .refine(
    (data) => {
      if (data.date_of_birth && data.date_of_death) {
        return new Date(data.date_of_death) >= new Date(data.date_of_birth);
      }
      return true;
    },
    {
      message: 'Date of death cannot be before date of birth',
      path: ['date_of_death'],
    }
  )
  .refine(
    (data) => {
      if (data.date_of_birth) {
        return new Date(data.date_of_birth) <= new Date();
      }
      return true;
    },
    {
      message: 'Date of birth cannot be in the future',
      path: ['date_of_birth'],
    }
  );

export type PersonFormData = z.infer<typeof personSchema>;
