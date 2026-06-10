<script setup lang="ts">
const route = useRoute()
const counter = ref(0)
const mountedAt = ref('')

onMounted(() => {
  mountedAt.value = new Date().toLocaleString()
})

useHead({
  title: 'SPA Route | Nuxt SSR / SPA Hybrid',
})
</script>

<template>
  <div class="space-y-10">
    <AppHero
      eyebrow="SPA route"
      badge="routeRules: ssr false"
      title="This section is intentionally client-rendered."
      description="Use this pattern for dashboard-like screens, highly interactive tools, or browser-only experiences."
    />

    <section class="grid gap-6 lg:grid-cols-3">
      <article class="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <p class="text-sm font-semibold text-fuchsia-200">Route mode</p>
        <p class="mt-4 text-4xl font-black text-white">
          {{ route.meta.renderMode }}
        </p>
      </article>

      <article class="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <p class="text-sm font-semibold text-fuchsia-200">Mounted at</p>
        <p class="mt-4 text-lg font-bold text-white">
          {{ mountedAt || 'Waiting for client mount...' }}
        </p>
      </article>

      <article class="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
        <p class="text-sm font-semibold text-fuchsia-200">Interactive counter</p>
        <div class="mt-4 flex items-center gap-4">
          <button
            class="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
            type="button"
            @click="counter++"
          >
            Count {{ counter }}
          </button>
          <button
            class="rounded-full border border-white/15 px-5 py-3 font-bold text-white transition hover:bg-white/10"
            type="button"
            @click="counter = 0"
          >
            Reset
          </button>
        </div>
      </article>
    </section>
  </div>
</template>
