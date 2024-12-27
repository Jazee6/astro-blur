import {defineCollection, z} from 'astro:content';
import {file, glob} from 'astro/loaders';

export const postSchema = z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    // heroImage: z.string().optional(),
    isDraft: z.boolean().optional(),
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
