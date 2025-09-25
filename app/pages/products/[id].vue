<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { api } from '~/shared/api'

// const id = computed(() => Number(useRoute('products-id').params.id))
// const { error, isPending, isLoading, refetch } = useQuery({
//   key: () => ['products', id.value],
//   query: () => api.products.getById(id.value),
//   enabled: false,
// })

// onMounted(() => {
//   refetch()
// })
</script>

<template>
  <UContainer>
    <UPage>
      666
      <!-- <template v-if="isPending || isLoading" />
      <template v-else-if="error">
        <div class="text-red-500">
          Error: {{ error.message }}
        </div>
      </template> -->
      <!-- <template v-else-if="data">
        <UCarousel :items="data.images" />
      </template> -->
    </UPage>
  </UContainer>
</template>
