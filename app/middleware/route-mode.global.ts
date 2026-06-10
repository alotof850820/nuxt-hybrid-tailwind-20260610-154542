export default defineNuxtRouteMiddleware((to) => {
  to.meta.renderMode = to.path.startsWith('/spa') ? 'spa' : 'ssr'
})
