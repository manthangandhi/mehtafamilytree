import { z } from 'zod';
import { optionalEmail, optionalPhone, visibilityLevelSchema, householdStatusSchema } from './shared';
import { personSchema } from './person';
import { relationshipToHeadSchema } from './shared';

export const householdSchema = z.object({
  household_code: z.string().trim().max(30).optional().or(z.literal('')),
  primary_member_name: z.string().trim().min(2, 'Primary member name is required').max(120),
  native_place: z.string().trim().max(120).optional().or(z.literal('')),
  residence_address: z.string().trim().max(500).optional().or(z.literal('')),
  business_address: z.string().trim().max(500).optional().or(z.literal('')),
  phone_number: optionalPhone,
  mobile_number: optionalPhone,
  whatsapp_number: optionalPhone,
  email: optionalEmail,
  city: z.string().trim().max(80).optional().or(z.literal('')),
  state: z.string().trim().max(80).optional().or(z.literal('')),
  country: z.string().trim().max(60).default('India'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  verified: z.boolean().default(false),
  visibility_level: visibilityLevelSchema,
  status: householdStatusSchema,
});

export type HouseholdFormData = z.infer<typeof householdSchema>;

export const familyMemberRowSchema = personSchema
  .safeExtend({
    id: z.string().optional(),
    relationship_to_head: relationshipToHeadSchema,
    is_deceased: z.boolean().default(false),
    linked_spouse_name: z.string().optional(),
    // display_order handled in action
  });

export type FamilyMemberRow = z.infer<typeof familyMemberRowSchema>;

// Complete payload for add_household (admin or via change request)
export const createHouseholdWithMembersSchema = z.object({
  household: householdSchema,
  members: z.array(familyMemberRowSchema).min(1, 'At least the primary member is required'),
});

export type CreateHouseholdWithMembers = z.infer<typeof createHouseholdWithMembersSchema>;
