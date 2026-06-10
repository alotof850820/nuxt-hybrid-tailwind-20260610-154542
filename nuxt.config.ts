import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Nuxt SSR / SPA Hybrid',
      meta: [
        {
          name: 'description',
          content: 'A Nuxt starter with SSR defaults, SPA route rules, and Tailwind CSS.',
        },
      ],
    },
  },
  routeRules: {
    '/': { ssr: true },
    '/spa/**': { ssr: false },
    '/api/**': { cors: true },
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
