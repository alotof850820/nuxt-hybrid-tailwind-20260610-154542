export const useAppMeta = () => ({
  name: 'PlanLab',
  description: 'Financial planning workspace for investments, home planning, and long-term projections.',
  stack: ['Nuxt', 'Vue', 'Nitro', 'Vite', 'Tailwind CSS'],
  routes: [
    {
      path: '/',
      mode: 'SSR',
      description: 'ProjectionLab-inspired landing page with a Start planning path into the app.',
    },
    {
      path: '/dashboard',
      mode: 'SSR',
      description: 'Server-rendered financial planning dashboard.',
    },
    {
      path: '/spa',
      mode: 'SPA',
      description: 'Client-rendered route using routeRules ssr: false.',
    },
  ],
})
