<script setup lang="ts">
const appMeta = useAppMeta()
const { data: health, pending, error } = await useFetch('/api/health')

useHead({
  title: `${appMeta.name} | SSR Home`,
})
</script>

<template>
  <div class="space-y-10">
    <AppHero
      eyebrow="SSR default"
      badge="Nuxt + Tailwind"
      title="Server-rendered where it matters, SPA where it feels right."
      :description="appMeta.description"
    />

    <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="item in appMeta.stack"
        :key="item"
        class="rounded-3xl border border-white/10 bg-slate-900/70 p-6"
      >
        <p class="text-sm font-semibold text-cyan-200">{{ item }}</p>
        <p class="mt-3 text-sm leading-6 text-slate-400">
          Ready for Nuxt auto-imports, server routes, Vue SFCs, and utility-first styling.
        </p>
      </article>
    </section>

    <section class="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div class="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 class="text-2xl font-bold text-white">Hybrid route map</h2>
        <div class="mt-5 space-y-4">
          <NuxtLink
            v-for="route in appMeta.routes"
            :key="route.path"
            :to="route.path"
            class="block rounded-2xl border border-white/10 bg-slate-950/50 p-4 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
          >
            <div class="flex items-center justify-between gap-4">
              <span class="font-mono text-cyan-100">{{ route.path }}</span>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                {{ route.mode }}
              </span>
            </div>
            <p class="mt-2 text-sm text-slate-400">{{ route.description }}</p>
          </NuxtLink>
        </div>
      </div>

      <div class="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
        <h2 class="text-2xl font-bold text-white">Nitro health check</h2>
        <p class="mt-2 text-sm text-slate-400">
          This block is fetched during SSR with <code class="text-cyan-200">useFetch('/api/health')</code>.
        </p>

        <pre class="mt-5 overflow-auto rounded-2xl border border-cyan-300/20 bg-black/40 p-4 text-sm text-cyan-100"><code v-if="pending">Loading health check...</code><code v-else-if="error">{{ error.message }}</code><code v-else>{{ health }}</code></pre>
      </div>
    </section>
  </div>
</template>
