<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  badge: string
}>()
</script>

<template>
  <section class="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-950/30 md:p-12">
    <div class="mb-8 flex flex-wrap items-center gap-3">
      <span class="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-xs font-semibold tracking-[0.25em] text-cyan-200 uppercase">
        {{ eyebrow }}
      </span>
      <span class="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-4 py-1 text-xs font-semibold text-fuchsia-100">
        {{ badge }}
      </span>
    </div>

    <div class="max-w-3xl">
      <h1 class="text-4xl font-black tracking-tight text-white md:text-6xl">
        {{ title }}
      </h1>
      <p class="mt-6 text-lg leading-8 text-slate-300 md:text-xl">
        {{ description }}
      </p>
    </div>
  </section>
</template>
