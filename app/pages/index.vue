<script setup lang="ts">
import { useInfiniteProductsStore, useProductsCategories } from '~/shared/model/queries'

const { categories } = useProductsCategories()

const getCategory = (slug: string) => categories.value?.find(c => c.slug === slug)

const route = useRoute()

const search = useRouteQuery('search', '')

const currentCategory = computed(() => {
  const category = route.query.category
  if (!category) return 'all'

  return category.toString()
})

const categoriesLinks = computed(() => {
  const all = [
    {
      label: 'All',
      to: {
        path: '/',
        query: {
          ...route.query,
          category: 'all',
        },
      },
      active: currentCategory.value === 'all',
    },
  ]

  const links = categories.value.map(category => ({
    label: category.name,
    to: {
      path: '/',
      query: {
        ...route.query,
        category: category.slug,
      },
    },
    active: currentCategory.value === category.slug,
  }))

  return [...all, ...links]
})

const { useInfiniteProducts } = useInfiniteProductsStore()
const { products, isPending, isLoading, error, status, hasNextPage, loadMore } = useInfiniteProducts(currentCategory, search)

useAsyncData(async () => {
  await loadMore()
})

const loadMoreArea = useTemplateRef('loadMoreArea')

const observerRef = shallowRef<IntersectionObserver | null>(null)

onMounted(() => {
  if (!import.meta.client) return

  const observer = new IntersectionObserver(([entry], observer) => {
    console.log('new IntersectionObserver', observer)
    if (!entry || !entry.isIntersecting) return
    console.log('load more')
    loadMore()
  })

  observer.observe(loadMoreArea.value!)

  observerRef.value = observer
})

onUnmounted(() => {
  observerRef.value?.disconnect()
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
      <template #default>
        {{ currentCategory }} {{ search }}
        <div
          ref="root"
          class="flex flex-col items-center relative my-10"
        >
          {{ status }}
          <UPageGrid
            v-if="isPending"
            class="w-full"
          >
            <USkeleton
              v-for="n in 12"
              :key="n"
              class="h-47 rounded-lg"
            />
          </UPageGrid>

          <div
            v-if="error"
            class="text-red-500"
          >
            An error occurred: {{ error.message }}
          </div>

          <UPageGrid
            v-else-if="products.length > 0"
            class="w-full"
          >
            <UPageCard
              v-for="product in products"
              :key="product.id"
              :title="product.price.toString() + ' Р'"
              :description="product.title"
              :to="`/products/${product.id}`"
            >
              <template #header>
                <NuxtImg :src="product.thumbnail" />
              </template>

              <template #footer>
                <UBadge
                  v-if="categories.length > 0"
                  variant="outline"
                  color="neutral"
                >
                  {{ getCategory(product.category)?.name }}
                </UBadge>
              </template>
            </UPageCard>
          </UPageGrid>

          <div
            ref="loadMoreArea"
            class="absolute -z-1 bottom-0 h-40 w-full"
          />

          <UButton
            v-if="hasNextPage"
            class="justify-self-center mt-10"
            :loading="isLoading"
            @click="() => { loadMore() }"
          >
            Показать больше
          </UButton>
        </div>
      </template>
    </UPage>
  </UContainer>
</template>
