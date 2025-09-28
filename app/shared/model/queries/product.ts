import { useInfiniteQuery } from '@pinia/colada'
import { api } from '~/shared/api'
import { getPaginatedProductsResponseSchema } from '~/shared/api/products'
import type { Product } from '~/shared/types'

export const useProduct = (id: Ref<number>) => {
  const { data: product, ...rest } = useQuery({
    key: () => ['products', id.value],
    query: () => api.products.getById(id.value),
  })
  return { product, ...rest }
}

export const useProductsCategories = defineQuery(() => {
  const { data: _categories, ...rest } = useQuery({
    key: ['products-categories'],
    query: () => api.products.getProductsCategories(),
  })

  const categories = computed(() => _categories.value ?? [])

  return { categories, ...rest }
})

// К сожалению пока не работает сброс при обновлении ключа, поэтому костыльный обход с computed
// лучше бвло бы использовать @tanstack/vue-query

export const useInfiniteProductsBrocken = (category: Ref<string | 'all'>) => {
  const useInfiniteProductsByCategory = (category: string | 'all') => {
    const { data: productsPages, ...rest } = useInfiniteQuery({
      key: () => ['products', { category }],
      query: async (c) => {
        const { nextPage } = c
        if (nextPage === null) return null
        const res = category === 'all'
          ? await api.products.getPaginatedProducts({ limit: 30, skip: nextPage, search: '' })
          : await api.products.getPaginatedProductsByCategory({ categorySlug: category, limit: 4, skip: nextPage })
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

  const infiniteProducts = computed(() => useInfiniteProductsByCategory(category.value))

  return infiniteProducts
}

type InfiniteProductsData = {
  data: Product[]
  nextPage: number | null
  error: Error | null
  status: 'pending' | 'loading' | 'success' | 'error'
}

// Что-то типа @tanstack/vue-query на минималках

export const useInfiniteProductsStore = defineStore('infinite-products', () => {
  const pagesByCategory: Ref<Record<string | 'all', {
    [search: string]: InfiniteProductsData
  }>> = ref({})

  const useInfiniteProducts = (categorySlug: Ref<string | 'all'>, search: Ref<string>) => {
    const getProductsPages = (categorySlug: string | 'all', search: string) => {
      const initial: InfiniteProductsData = {
        data: [],
        nextPage: null,
        error: null,
        status: 'pending',
      }

      if (!pagesByCategory.value[categorySlug]) {
        console.log(`init pagesByCategory[${categorySlug}]`)

        pagesByCategory.value[categorySlug] = {
          [search]: initial,
        }
      }
      else if (pagesByCategory.value[categorySlug] !== undefined && !pagesByCategory.value[categorySlug]![search]) {
        console.log(`init pagesByCategory[${categorySlug}][${search}]`)

        pagesByCategory.value[categorySlug]![search] = initial
      }

      const pages = pagesByCategory.value[categorySlug]![search]!

      console.log('pages', pages)

      return pages
    }

    const productsPages = computed({
      get() {
        return getProductsPages(categorySlug.value, search.value)
      },
      set(data) {
        pagesByCategory.value[categorySlug.value]![search.value] = data
      },
    })

    const loadMore = async () => {
      const nextPage = productsPages.value?.nextPage ?? 0

      const pages = getProductsPages(categorySlug.value, search.value)

      if (pages.status !== 'pending') pages.status = 'loading'

      try {
        const res = categorySlug.value === 'all'
          ? await api.products.getPaginatedProducts({ limit: 30, skip: nextPage, search: search.value })
          : await api.products.getPaginatedProductsByCategory({ categorySlug: categorySlug.value, limit: 4, skip: nextPage })

        const validated = getPaginatedProductsResponseSchema.parse(res)

        pagesByCategory.value[categorySlug.value]![search.value] = {
          ...pages,
          data: [...(productsPages.value?.data ?? []), ...validated.products],
          nextPage: validated.skip + validated.limit < validated.total ? validated.skip + validated.limit : null,
          error: null,
          status: 'success',
        }
      }
      catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))
        pagesByCategory.value[categorySlug.value]![search.value] = {
          ...pages,
          error,
          status: 'error',
        }
      }

      return getProductsPages(categorySlug.value, search.value)
    }

    watch(() => [categorySlug.value, search.value], () => {
      console.log('loadMore', categorySlug.value, search.value)
      loadMore()
    })

    const products = computed(() => productsPages.value.data.filter(p =>
      categorySlug.value === 'all'
        ? true
        : p.title.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()) || p.description.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
    ))

    const hasNextPage = computed(() => productsPages.value.nextPage !== null)
    const status = computed(() => productsPages.value.status)
    const error = computed(() => productsPages.value.error)
    const isPending = computed(() => productsPages.value.status === 'pending')
    const isLoading = computed(() => productsPages.value.status === 'loading')
    const isSuccess = computed(() => productsPages.value.status === 'success')

    return {
      products,
      hasNextPage,
      status,
      error,
      loadMore,
      isPending,
      isLoading,
      isSuccess,
    }
  }

  return {
    useInfiniteProducts,
  }
})
