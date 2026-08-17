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

  if (!props.dateParam || props.dateType === 'default') {
    return allImages
  }

  if (props.dateType === 'year') {
    const year = props.dateParam
    return allImages.filter(img => img.date.startsWith(year))
  }

  if (props.dateType === 'month') {
    const yearMonth = props.dateParam
    return allImages.filter(img => img.date.replace(/-/g, '').startsWith(yearMonth))
  }

  if (props.dateType === 'day') {
    const date = props.dateParam
    return allImages.filter(img => img.date === date)
  }

  return allImages
})

// ★★★ 提取为独立函数，方便多处调用
async function loadData() {
  try {
    if (props.dateType === 'year' || props.dateType === 'month') {
      await loadImages({ idx: 0, count: 9999, mkt: mkt.value })
    } else {
      await loadImages({ idx: 0, count: 30, mkt: mkt.value })
    }
  } catch (error) {
    console.error('数据加载失败:', error)
  }
}

// ★★★ 在 setup 中加载（服务端和客户端都会执行）
await loadData()

// ★★★ 核心修复：在 onMounted 中再次确保数据加载
onMounted(async () => {
  // 如果数据为空（比如 SSR 阶段未加载），重新加载
  if (imageMap.value.size === 0) {
    await loadData()
  }

  // 滚动加载更多
  useIntersectionObserver(loadMoreRef, (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        if (props.dateType === 'day') return
        const count = (props.dateType === 'year' || props.dateType === 'month') ? 9999 : 30
        await loadImages({ idx: images.value.length, count, mkt: mkt.value })
      }
    })
  })
})

watch(() => mkt.value, resetImages)

watch(() => [props.dateParam, props.dateType], async () => {
  resetImages()
  await loadData()
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
