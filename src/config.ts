export const siteConfig: SiteConfig = {
    title: "Hi! Jazee",
    language: "zh",
    description: "Jazee's personal blog. Powered by Astro Blog Theme Blur.",
    keywords: "Jazee, blog, personal blog, Astro, Astro Blog Theme Blur",
    author: "Jazee",
    avatar: "/avatar.png",
    favicon: "/favicon.png",
    site: "https://jaze.top",

    page_size: 10,
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
        url: 'https://github.com/Jazee6'
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

    page_size: number
    twikoo_uri?: string     // https://twikoo.js.org/
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
