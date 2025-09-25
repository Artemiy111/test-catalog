import { createFetch } from 'ofetch'

export const ofetch = createFetch({
  defaults: {
    baseURL: 'https://dummyjson.com',
  },
})
