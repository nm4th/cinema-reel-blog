import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum([
      '利用ガイド',
      '推し活',
      'デート',
      'パーティー',
      '撮影',
      '比較',
      'お知らせ',
    ]),
    tags: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroVideoId: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
