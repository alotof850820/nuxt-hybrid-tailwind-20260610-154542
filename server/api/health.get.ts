export default defineEventHandler(() => ({
  ok: true,
  mode: 'nitro-server',
  timestamp: new Date().toISOString(),
  runtime: process.versions.node,
}))
