import { z } from 'zod';

export const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;

export const optionalPhone = z
  .string()
  .trim()
  .regex(phoneRegex, 'Invalid phone number format')
  .optional()
  .or(z.literal(''));

export const optionalEmail = z
  .string()
  .trim()
  .email('Invalid email address')
  .optional()
  .or(z.literal(''));

export const dateSchema = z
  .string()
  .date()
  .optional()
  .or(z.literal(''));

export const genderSchema = z.enum(['male', 'female', 'other']).optional();

export const maritalStatusSchema = z.string().trim().max(50).optional();

export const relationshipToHeadSchema = z.enum([
  'SELF',
  'FATHER',
  'MOTHER',
  'WIFE',
  'HUSBAND',
  'SON',
  'DAUGHTER',
  'DAUGHTER IN LAW',
  'SON IN LAW',
  'GRAND SON',
  'GRAND DAUGHTER',
  'BROTHER',
  'SISTER',
  'OTHER',
]);

export const requestTypeSchema = z.enum([
  'add_household',
  'update_household',
  'delete_household',
  'add_person',
  'update_person',
  'mark_deceased',
  'add_household_member',
  'update_household_member',
  'remove_household_member',
  'add_relationship',
  'update_relationship',
  'delete_relationship',
]);

export const visibilityLevelSchema = z.enum(['public', 'members', 'admin']).default('members');
export const householdStatusSchema = z.enum(['active', 'inactive']).default('active');
