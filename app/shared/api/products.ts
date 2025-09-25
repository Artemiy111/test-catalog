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
  getPaginatedProducts: async ({ limit, skip }: { limit: number, skip: number }) => {
    const res = await ofetch('/products', {
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
