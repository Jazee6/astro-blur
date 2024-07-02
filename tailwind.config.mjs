/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                base: 'var(--color-base)',
                back: 'var(--color-back)',
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                hover: 'var(--color-hover)',
                active: 'var(--color-active)',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        require('tailwindcss-animate')
    ],
}
