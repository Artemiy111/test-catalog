import z from 'zod'

import { productCategorySchema, productSchema } from '../types'
import { ofetch } from './core'

export const getPaginatedProductsResponseSchema = z.object({
  products: z.array(productSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
})

export type GetPaginatedProductsResponse = z.infer<typeof getPaginatedProductsResponseSchema>

export const products = {
  getPaginatedProducts: async ({ limit, skip, search }: {
    limit: number
    skip: number
    search: string
  }) => {
    const res = await ofetch('/products/search', {
      query: { limit, skip, q: search },
    })
    const validated = getPaginatedProductsResponseSchema.parse(res)
    return validated
  },

  getPaginatedProductsByCategory: async ({ categorySlug, limit, skip }: {
    categorySlug: string
    limit: number
    skip: number
  }) => {
    const res = await ofetch(`/products/category/${categorySlug}`, {
      query: { limit, skip },
    })
    const validated = getPaginatedProductsResponseSchema.parse(res)
    return validated
  },

  getById: async (id: number) => {
    const res = await ofetch(`/products/${id}`)
    const validated = productSchema.parse(res)
    return validated
  },

  getProductsCategories: async () => {
    const res = await ofetch('/products/categories')
    const validated = z.array(productCategorySchema).parse(res)
    return validated
  },
}
