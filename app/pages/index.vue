<script setup lang="ts">
import { useInfiniteProducts, useProductsCategories } from '~/shared/model/queries'

const { categories, isPending: isPendingCategories } = useProductsCategories()

const route = useRoute()

const search = useRouteQuery('search', '')

const currentCategory = computed(() => {
  const category = route.query.category
  if (!category) return 'All'

  return category.toString()
})

const categoriesLinks = computed(() => {
  const all = [{
    label: 'All',
    to: {
      query: {
        ...route.query,
        category: 'All',
      },
    },
    active: currentCategory.value === 'All',
  }]

  const links = categories.value?.map(category => ({
    label: category.name,
    to: {
      query: {
        ...route.query,
        category: category.slug,
      },
    },
    active: currentCategory.value === category.slug,
  }))

  return [...all, ...links]
})

const { productsPages, isPending, isLoading, error, loadMore } = useInfiniteProducts()

onMounted(() => {
  loadMore()
})
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside class="">
          <h2 class="text-lg font-medium mb-4">
            Categories
          </h2>
          <UPageLinks :links="categoriesLinks" />
        </UPageAside>
      </template>

      <UPageGrid class="mt-10">
        <template v-if="isPending || isLoading ">
          <USkeleton
            v-for="n in 12"
            :key="n"
            class="h-47 rounded-lg"
          />
        </template>
        <template v-else-if="error">
          <div class="text-red-500 mt-10">
            An error occurred: {{ error.message }}
          </div>
        </template>
        <template v-else>
          <UPageCard
            v-for="product in productsPages.data"
            :key="product.id"
            :title="product.price.toString() + ' Р'"
            :description="product.title"
          >
            <template #header>
              <NuxtLink :to="`/products/${product.id}`">
                <NuxtImg :src="product.thumbnail" />
              </NuxtLink>
            </template>
          </UPageCard>
        </template>
      </UPageGrid>
    </UPage>
  </UContainer>
</template>
