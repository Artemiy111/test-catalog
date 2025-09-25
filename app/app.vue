<script setup lang="ts">
import { PiniaColadaDevtools } from '@pinia/colada-devtools'
import { useRouteQuery } from '@vueuse/router'

const router = useRouter()
const route = useRoute()
const search = useRouteQuery('search', '')
</script>

<template>
  <UApp>
    <UHeader title="Nuxt UI">
      <template #right>
        <UColorModeSelect />
      </template>
      <UInput
        :model-value="search"
        icon="i-lucide-search"
        size="md"
        variant="outline"
        placeholder="Search..."
        @change="(e) => router.push({ path: '/', query: { ...route.query, search: (e.target as HTMLInputElement).value } })"
      />
    </UHeader>

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <PiniaColadaDevtools />
  </UApp>
</template>
