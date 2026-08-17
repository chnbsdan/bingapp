<script setup lang="ts">
const { mkt } = useMarket()

// Props 接收日期类型和参数
const props = defineProps<{
  dateType?: string
  dateParam?: string
}>()

const loadMoreRef = ref<HTMLElement>()
const { isFetching, imageMap, loadImages, resetImages } = useImages()

// 核心：根据日期类型过滤图片
const images = computed(() => {
  let allImages = [...imageMap.value.values()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // 如果没有日期参数，返回全部
  if (!props.dateParam || props.dateType === 'default') {
    return allImages
  }

  // 按年过滤 (YYYY)
  if (props.dateType === 'year') {
    const year = props.dateParam
    return allImages.filter(img => img.date.startsWith(year))
  }

  // 按月过滤 (YYYYMM)
  if (props.dateType === 'month') {
    const yearMonth = props.dateParam
    return allImages.filter(img => img.date.replace(/-/g, '').startsWith(yearMonth))
  }

  // 按日过滤 (YYYY-MM-DD)
  if (props.dateType === 'day') {
    const date = props.dateParam
    return allImages.filter(img => img.date === date)
  }

  return allImages
})

// ★★★ 核心修改：将 count 从 366 改为 9999
async function initialLoad() {
  if (props.dateType === 'year' || props.dateType === 'month') {
    // 年月搜索加载所有数据
    await loadImages({ idx: 0, count: 9999, mkt: mkt.value })
  } else {
    // 默认或日搜索加载最近30张
    await loadImages({ idx: 0, count: 30, mkt: mkt.value })
  }
}

await initialLoad()

onMounted(async () => {
  useIntersectionObserver(loadMoreRef, (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        // ★★★ 核心修改：将 count 从 366 改为 9999
        const count = (props.dateType === 'year' || props.dateType === 'month') ? 9999 : 30
        await loadImages({ idx: images.value.length, count, mkt: mkt.value })
      }
    })
  })
})

watch(() => mkt.value, resetImages)

// 当日期参数变化时重新加载
watch(() => [props.dateParam, props.dateType], async () => {
  resetImages()
  await initialLoad()
})
</script>

<template>
  <section class="mx-1 flex-1 md:mx-4">
    <!-- 显示当前搜索的标题 -->
    <div v-if="dateParam && dateType !== 'default'" class="mb-4 text-center">
      <h2 class="text-2xl font-bold">
        <span v-if="dateType === 'year'">{{ dateParam }} 年全部壁纸</span>
        <span v-else-if="dateType === 'month'">{{ dateParam.slice(0,4) }} 年 {{ dateParam.slice(4,6) }} 月壁纸</span>
        <span v-else-if="dateType === 'day'">{{ dateParam }} 壁纸</span>
      </h2>
      <p class="text-sm op-50">共 {{ images.length }} 张</p>
    </div>

    <!-- 空状态提示 -->
    <div v-if="images.length === 0 && dateParam && dateType !== 'default'" class="text-center py-12">
      <div class="i-system-uicons-search text-6xl op-30" />
      <p class="mt-4 text-lg op-50">
        <span v-if="dateType === 'year'">未找到 {{ dateParam }} 年的壁纸数据</span>
        <span v-else-if="dateType === 'month'">未找到 {{ dateParam.slice(0,4) }} 年 {{ dateParam.slice(4,6) }} 月的壁纸数据</span>
        <span v-else-if="dateType === 'day'">未找到 {{ dateParam }} 的壁纸数据</span>
      </p>
      <p class="text-sm op-30 mt-2">请尝试其他日期或返回首页</p>
    </div>

    <!-- 图片网格 -->
    <div v-else class="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-3">
      <nuxt-link 
        v-for="image in images" 
        :key="image.url" 
        :to="{ params: { date: image.date }, query: { mkt } }"
      >
        <image-card :image="image" />
      </nuxt-link>
    </div>

    <!-- 日搜索单张图片的提示 -->
    <div v-if="dateType === 'day' && images.length === 1" class="mt-4 text-center text-sm op-50">
      点击图片查看大图
    </div>

    <!-- 加载更多 -->
    <div v-if="images.length > 0" ref="loadMoreRef" class="grid place-items-center">
      <span v-show="isFetching" class="i-system-uicons-loader mt-1 animate-spin text-3xl md:mt-2" />
    </div>
  </section>
</template>
