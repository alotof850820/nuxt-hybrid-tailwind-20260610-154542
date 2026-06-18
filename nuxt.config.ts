import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'PlanLab',
      meta: [
        {
          name: 'description',
          content: 'PlanLab helps you model investments, home planning, and long-term asset projections.',
        },
      ],
    },
  },
  routeRules: {
    '/': { ssr: true },
    '/dashboard': { ssr: true },
    '/spa/**': { ssr: false },
    '/api/**': { cors: true },
  },
  vite: {
    optimizeDeps: {
      exclude: ['chart.js', '@tabler/icons-vue'],
    },
    plugins: [tailwindcss()],
  },
})
