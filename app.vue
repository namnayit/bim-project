<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/vue";
</script>

<template>
    <div class="min-h-screen bg-zinc-100 dark:bg-zinc-900">
        <NuxtLayout>
            <SpeedInsights />
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
