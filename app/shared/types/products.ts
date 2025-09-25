import { z } from 'zod'

export const reviewSchema = z.object({
  rating: z.number(),
  comment: z.string(),
  date: z.iso.datetime(),
  reviewerName: z.string(),
  reviewerEmail: z.email(),
})

export type Review = z.infer<typeof reviewSchema>

export const dimensionsSchema = z.object({
  width: z.number(),
  height: z.number(),
  depth: z.number(),
})

export type Dimensions = z.infer<typeof dimensionsSchema>

export const productMetaSchema = z.object({
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  barcode: z.string(),
  qrCode: z.string(),
})

export type ProductMeta = z.infer<typeof productMetaSchema>

export const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  discountPercentage: z.number(),
  rating: z.number(),
  stock: z.number(),
  tags: z.array(z.string()),
  brand: z.string().optional(),
  sku: z.string(),
  weight: z.number(),
  dimensions: dimensionsSchema,
  warrantyInformation: z.string(),
  shippingInformation: z.string(),
  availabilityStatus: z.string(),
  reviews: z.array(reviewSchema),
  returnPolicy: z.string(),
  minimumOrderQuantity: z.number(),
  meta: productMetaSchema,
  thumbnail: z.string(),
  images: z.array(z.string()),
})

export type Product = z.infer<typeof productSchema>

export const productCategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  url: z.url(),
})

export type ProductCategory = z.infer<typeof productCategorySchema>
