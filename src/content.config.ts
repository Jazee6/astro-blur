import {defineCollection,} from 'astro:content';
import {file, glob} from 'astro/loaders';
import {z} from 'astro/zod'

const tagSchema = z.string()
    .trim()
    .min(1, "标签不能为空")
    .refine(tag => !tag.includes('/'), "标签不能包含 /")
    .refine(tag => tag !== '.' && tag !== '..', "标签不能是 . 或 ..")

export const postSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    isDraft: z.boolean().optional(),
    pinned: z.boolean().optional().default(false),
    tags: z.array(tagSchema).optional().default([]),
})

const posts = defineCollection({
    loader: glob({pattern: "**/*.{md,mdx}", base: "./src/content/posts"}),
    schema: postSchema,
});

export const pageSchema = z.object({
    title: z.string(),
})

const pages = defineCollection({
    loader: glob({pattern: "**/*.{md,mdx}", base: "./src/content/pages"}),
    schema: pageSchema,
})

const linkSchema = z.object({
    title: z.string(),
    url: z.string(),
    description: z.string(),
    avatar: z.string(),
})

const links = defineCollection({
    loader: file("src/content/data/links.json"),
    schema: linkSchema,
})

const projectSchema = z.object({
    title: z.string(),
    repo: z.string(),
    description: z.string(),
})

const projects = defineCollection({
    loader: file("src/content/data/projects.json"),
    schema: projectSchema,
})

export const collections = {posts, pages, links, projects};
