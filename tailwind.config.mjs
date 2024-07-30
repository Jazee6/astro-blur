/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                base: 'rgb(var(--color-base))',
                back: 'rgb(var(--color-back))',
                primary: 'rgb(var(--color-primary))',
                secondary: 'rgb(var(--color-secondary))',
                hover: 'rgb(var(--color-hover))',
                active: 'rgb(var(--color-active))',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('tailwindcss-animate')
    ],
}
