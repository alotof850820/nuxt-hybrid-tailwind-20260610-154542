<template>
  <div class="min-h-screen">
    <header class="border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="text-sm font-semibold tracking-[0.3em] text-cyan-200 uppercase">
          Hybrid Nuxt
        </NuxtLink>

        <div class="flex items-center gap-3 text-sm text-slate-300">
          <NuxtLink
            to="/"
            class="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
            active-class="bg-white/10 text-white"
          >
            SSR
          </NuxtLink>
          <NuxtLink
            to="/spa"
            class="rounded-full px-4 py-2 transition hover:bg-white/10 hover:text-white"
            active-class="bg-white/10 text-white"
          >
            SPA
          </NuxtLink>
        </div>
      </nav>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-12">
      <slot />
    </main>
  </div>
</template>
