<!-- components/image-grid.vue -->
<script setup lang="ts">
const { mkt } = useMarket()

const loadMoreRef = ref<HTMLElement>()
const { isFetching, imageMap, loadImages, loadChinaHistory, resetImages } = useImages()

const images = computed(() => {
  return [...imageMap.value.values()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const isChinaHistory = computed(() => mkt.value === 'zh-CN-history')

async function loadData() {
  resetImages()
  if (isChinaHistory.value) {
    await loadChinaHistory()
  } else {
    await loadImages({ idx: 0, count: 30, mkt: mkt.value })
  }
}

await loadData()

watch(() => mkt.value, loadData)

onMounted(() => {
  useIntersectionObserver(loadMoreRef, async (entries) => {
    if (isChinaHistory.value) return
    entries.forEach(async (entry) => {
      if (entry.isIntersecting && !isFetching.value) {
        await loadImages({ idx: images.value.length, count: 30, mkt: mkt.value })
      }
    })
  })
})
</script>

<template>
  <section class="mx-1 flex-1 md:mx-4">
    <div v-if="isChinaHistory && images.length > 0" class="mb-3 text-sm text-gray-500">
      📚 共 {{ images.length }} 张壁纸（2010年12月31日至今）
    </div>

    <div class="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-3">
      <nuxt-link
        v-for="image in images"
        :key="image.url"
        :to="{ params: { date: image.date }, query: { mkt } }"
      >
        <image-card :image="image" />
      </nuxt-link>
    </div>

    <div ref="loadMoreRef" class="grid place-items-center py-4">
      <span v-show="isFetching" class="i-system-uicons-loader mt-1 animate-spin text-3xl md:mt-2" />
      <span
        v-if="!isFetching && isChinaHistory && images.length > 0"
        class="mt-2 text-sm text-gray-400"
      >
        ─ 已全部加载（共 {{ images.length }} 张） ─
      </span>
    </div>
  </section>
</template>
