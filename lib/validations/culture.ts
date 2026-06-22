import { z } from 'zod';

export const culturalPageSchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(150),
  content: z.string().trim().min(10, 'Content is required').max(20000),
  language: z.string().trim().max(40).default('English'),
  visibility_level: z.enum(['public', 'members', 'admin']).default('public'),
});

export type CulturalPageFormData = z.infer<typeof culturalPageSchema>;
