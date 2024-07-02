import {defineCollection, z} from 'astro:content';

export const postSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    // heroImage: z.string().optional(),
    isDraft: z.boolean().optional(),
})

const posts = defineCollection({
    type: 'content',
    schema: postSchema,
});

export const pageSchema = z.object({
    title: z.string(),
})

const pages = defineCollection({
    type: 'content',
    schema: pageSchema,
})

export const collections = {posts, pages};
