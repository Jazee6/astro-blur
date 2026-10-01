export const siteConfig: SiteConfig = {
    title: "Astro Blur",
    language: "zh",
    description: "A static blog theme built with Astro. Powered by Astro Blog Theme Blur.",
    keywords: "Astro, blog, theme, Astro Blog Theme Blur",
    author: "Astro Blur",
    avatar: "/identity.svg",
    favicon: "/identity.svg",
    site: "https://example.com",

    pageSize: 10,
}

export const navBarConfig: NavBarConfig = {
    links: [
        {
            name: 'Projects',
            url: '/projects'
        },
        {
            name: 'Links',
            url: '/links'
        },
        {
            name: 'About',
            url: '/about'
        }
    ]
}

export const socialLinks: SocialLink[] = [
    // https://icon-sets.iconify.design/material-symbols/
    {
        label: 'GitHub',
        icon: 'mdi-github',
        url: 'https://github.com/Jazee6/astro-blur'
    }
]

interface SiteConfig {
    title: string
    language: string
    description: string
    keywords: string
    author: string
    avatar: string
    favicon: string
    site: string

    pageSize: number
    twikooUri?: string     // https://twikoo.js.org/
}

interface NavBarConfig {
    links: {
        name: string
        url: string
        target?: string
    }[]
}

interface SocialLink {
    label: string
    icon: string
    url: string
}
