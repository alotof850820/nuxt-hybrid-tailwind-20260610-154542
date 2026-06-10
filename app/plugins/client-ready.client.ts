export default defineNuxtPlugin(() => {
  const clientReady = useState('client-ready', () => true)

  return {
    provide: {
      clientReady,
    },
  }
})
