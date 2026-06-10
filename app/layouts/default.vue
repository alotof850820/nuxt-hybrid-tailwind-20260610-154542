<template>
  <div class="min-h-screen bg-[#f6f8fa] text-slate-900">
    <div class="grid min-h-screen grid-cols-[240px_1fr]">
      <aside class="flex min-h-screen flex-col bg-[#263241] text-slate-100">
        <div class="px-7 py-6">
          <NuxtLink to="/" class="block text-xl font-bold text-white">
            PlanLab
          </NuxtLink>
          <p class="mt-1 text-xs font-medium text-slate-300">Investment Workspace</p>
        </div>

        <div class="mx-6 h-px bg-slate-600/70" />

        <nav class="flex-1 space-y-2 px-4 py-6" aria-label="主要導覽">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
            active-class="bg-[#1f2a37] text-white"
          >
            <span
              class="grid size-7 place-items-center rounded-md bg-slate-600 text-xs font-bold text-white"
              :class="item.accent"
            >
              {{ item.icon }}
            </span>
            <span>{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="mx-6 h-px bg-slate-600/70" />
        <div class="px-7 py-6 text-xs font-medium text-slate-400">v0.2 shell</div>
      </aside>

      <div class="grid min-h-screen grid-rows-[64px_1fr_72px]">
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-7">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ currentTitle }}</p>
            <p class="mt-0.5 text-xs font-medium text-slate-500">Blank main page</p>
          </div>
        </header>

        <main class="min-h-0 bg-[#f6f8fa] p-8">
          <slot />
        </main>

        <footer class="flex items-center justify-between border-t border-slate-200 bg-white px-7 text-sm font-medium text-slate-500">
          <span>Footer</span>
          <span>Status / links / metadata</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/', label: '首頁', icon: '首', accent: 'bg-[#24b3a7]' },
  { to: '/stocks', label: '股票', icon: '股', accent: 'bg-slate-600' },
]

const currentTitle = computed(() => {
  return navItems.find((item) => item.to === route.path)?.label ?? '首頁'
})
</script>
