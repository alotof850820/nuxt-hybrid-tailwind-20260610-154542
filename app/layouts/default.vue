<template>
  <div class="min-h-screen bg-[var(--color-background-tertiary)] text-slate-900">
    <div class="flex h-screen overflow-hidden">
      <aside
        class="relative flex shrink-0 flex-col bg-[#18202f] text-slate-100 transition-[width] duration-200"
        :class="isCollapsed ? 'w-[52px]' : 'w-[210px]'"
      >
        <button
          class="absolute top-1/2 -right-2.5 z-10 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#263044] text-[#7a8fa8] transition hover:bg-blue-500 hover:text-white"
          type="button"
          :aria-label="isCollapsed ? '展開側邊欄' : '收合側邊欄'"
          @click="isCollapsed = !isCollapsed"
        >
          <IconChevronRight v-if="isCollapsed" class="size-3.5" :stroke="2" />
          <IconChevronLeft v-else class="size-3.5" :stroke="2" />
        </button>

        <div class="border-b border-white/[0.07] px-3.5 pb-3.5 pt-[18px]">
          <NuxtLink to="/" class="flex items-center gap-[9px] overflow-hidden">
            <span class="grid size-[30px] shrink-0 place-items-center rounded-[7px] bg-blue-500 text-sm font-medium text-white">
              P
            </span>
            <span
              class="min-w-0 whitespace-nowrap transition-all duration-200"
              :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100'"
            >
              <span class="block text-sm font-medium text-slate-100">PlanLab</span>
              <span class="mt-px block text-[11px] text-slate-600">Investment Workspace</span>
            </span>
          </NuxtLink>
        </div>

        <nav class="flex-1 space-y-0.5 px-2 py-2.5" aria-label="主要導覽">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-[9px] overflow-hidden rounded-[7px] px-2 py-2 text-[13px] text-[#7a8fa8] transition hover:bg-white/[0.06] hover:text-slate-300"
            active-class="bg-blue-500/15 text-blue-300"
          >
            <component :is="item.icon" class="size-[17px] shrink-0" :stroke="1.9" aria-hidden="true" />
            <span
              class="whitespace-nowrap transition-all duration-200"
              :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-36 opacity-100'"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </nav>

        <div class="border-t border-white/[0.07] px-2 pb-3.5 pt-2.5">
          <NuxtLink
            v-for="item in footerItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-[9px] overflow-hidden rounded-[7px] px-2 py-2 text-[13px] text-[#7a8fa8] transition hover:bg-white/[0.06] hover:text-slate-300"
            active-class="bg-blue-500/15 text-blue-300"
          >
            <component :is="item.icon" class="size-[17px] shrink-0" :stroke="1.9" aria-hidden="true" />
            <span
              class="whitespace-nowrap transition-all duration-200"
              :class="isCollapsed ? 'max-w-0 opacity-0' : 'max-w-36 opacity-100'"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </div>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header class="flex h-[50px] shrink-0 items-center gap-2.5 border-b border-slate-200 bg-white px-5">
          <div class="flex flex-1 items-center gap-1.5 text-[13px] text-slate-500">
            <component :is="currentIcon" class="size-3.5 text-slate-400" :stroke="1.9" aria-hidden="true" />
            <IconChevronRight class="size-3 text-slate-300" :stroke="2" aria-hidden="true" />
            <span class="font-medium text-slate-900">{{ currentTitle }}</span>
          </div>
          <button
            class="flex size-[30px] items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            type="button"
            aria-label="通知"
          >
            <IconBell class="size-4" :stroke="1.8" />
          </button>
          <button
            class="grid size-7 place-items-center rounded-full bg-blue-500 text-[11px] font-medium text-white"
            type="button"
            aria-label="帳戶"
          >
            我
          </button>
        </header>

        <main class="min-h-0 flex-1 overflow-y-auto p-5">
          <slot />
        </main>

        <footer class="flex h-9 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 text-[11px] text-slate-500">
          <span>© 2026 PlanLab. All rights reserved.</span>
          <span>v0.3 shell</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconBell from '@tabler/icons-vue/dist/esm/icons/IconBell.mjs'
import IconBuildingBank from '@tabler/icons-vue/dist/esm/icons/IconBuildingBank.mjs'
import IconChartCandle from '@tabler/icons-vue/dist/esm/icons/IconChartCandle.mjs'
import IconChevronLeft from '@tabler/icons-vue/dist/esm/icons/IconChevronLeft.mjs'
import IconChevronRight from '@tabler/icons-vue/dist/esm/icons/IconChevronRight.mjs'
import IconLayoutDashboard from '@tabler/icons-vue/dist/esm/icons/IconLayoutDashboard.mjs'
import IconListDetails from '@tabler/icons-vue/dist/esm/icons/IconListDetails.mjs'
import IconSettings from '@tabler/icons-vue/dist/esm/icons/IconSettings.mjs'

const route = useRoute()
const isCollapsed = ref(false)

const navItems = [
  { to: '/', label: '首頁', icon: IconLayoutDashboard },
  { to: '/stocks', label: '股票', icon: IconChartCandle },
  { to: '/house', label: '買房規劃', icon: IconBuildingBank },
  { to: '/details', label: '明細', icon: IconListDetails },
]

const footerItems = [{ to: '/settings', label: '設定', icon: IconSettings }]

const activeItem = computed(() => {
  return [...navItems, ...footerItems].find((item) => item.to === route.path) ?? navItems[0]
})

const currentTitle = computed(() => activeItem.value.label)
const currentIcon = computed(() => activeItem.value.icon)
</script>
