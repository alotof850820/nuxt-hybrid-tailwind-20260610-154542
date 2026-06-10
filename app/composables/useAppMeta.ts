export const useAppMeta = () => ({
  name: 'Nuxt SSR / SPA Hybrid',
  description: 'SSR by default, SPA where route rules ask for it, styled with Tailwind CSS.',
  stack: ['Nuxt', 'Vue', 'Nitro', 'Vite', 'Tailwind CSS'],
  routes: [
    {
      path: '/',
      mode: 'SSR',
      description: 'Server-rendered landing page with Nitro API data.',
    },
    {
      path: '/spa',
      mode: 'SPA',
      description: 'Client-rendered route using routeRules ssr: false.',
    },
  ],
})
