import { useInfiniteQuery } from '@pinia/colada'
import { api } from '~/shared/api'
import { getPaginatedProductsResponseSchema } from '~/shared/api/products'
import type { Product } from '~/shared/types'

// export const useProduct = (id: Ref<number>) => {
//   const { data: product, ...rest } = useQuery({
//     key: () => ['products', id.value],
//     query: () => api.products.getById(id.value),
//   })
//   return { product, ...rest }
// }

export const useProductsCategories = defineQuery(() => {
  const { data: _categories, ...rest } = useQuery({
    key: ['products-categories'],
    query: () => api.products.getProductsCategories(),
  })

  const categories = computed(() => _categories.value ?? [])

  return { categories, ...rest }
})

export const useInfiniteProducts = () => {
  const { data: productsPages, ...rest } = useInfiniteQuery({
    key: ['products'],
    query: async (c) => {
      const { nextPage } = c
      if (nextPage === null) return null
      const res = await api.products.getPaginatedProducts({ limit: 30, skip: nextPage })
      const validated = getPaginatedProductsResponseSchema.parse(res)
      return validated
    },
    initialPage: {
      data: [] as Product[],
      nextPage: 0 as number | null,
    },
    merge: (pages, newPage) => {
      if (!newPage) return pages

      return {
        data: [...pages.data, ...newPage.products],
        nextPage: newPage.skip + newPage.limit < newPage.total ? newPage.skip + newPage.limit : null,
      }
    },
  })

  return {
    productsPages,
    ...rest,
  }
}
