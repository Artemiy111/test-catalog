<script setup lang="ts">
import { useProduct } from '~/shared/model/queries'
import { QrcodeSvg } from 'qrcode.vue'

const id = computed(() => Number(useRoute('products-id').params.id))
const { product, error } = useProduct(id)
const url = useRequestURL()
const route = useRoute()

const qrUrl = computed(() => url.origin + route.fullPath)
</script>

<template>
  <UContainer>
    <UPage>
      <template v-if="error">
        <div class="text-red-500">
          Error: {{ error.message }}
        </div>
      </template>
      <template v-else-if="product">
        <div class="my-10">
          <h1 class="text-3xl font-bold">
            {{ product.title }}
          </h1>
          <UCarousel
            v-slot="{ item }"
            :items="product.images"
          >
            <NuxtImg :src="item" />
          </UCarousel>

          <QrcodeSvg
            class="p-5 bg-white"
            :value="qrUrl"
            :size="200"
            background="#fff"
          />
        </div>
      </template>
    </UPage>
  </UContainer>
</template>
