<script setup lang="ts">
const { mkt } = useMarket()

const props = defineProps<{
  dateType?: string
  dateParam?: string
}>()

const loadMoreRef = ref<HTMLElement>()
const { isFetching, imageMap, loadImages, resetImages } = useImages()

// ★★★ 新增：当前已加载的图片数量（用于分页）
const loadedCount = ref(0)
const pageSize = 30

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

// ★★★ 加载数据函数
async function loadData() {
  if (isFetching.value) return

  // 对于年份和月份，使用分页加载
  if (props.dateType === 'year' || props.dateType === 'month') {
    await loadImages({ idx: loadedCount.value, count: pageSize, mkt: mkt.value })
    loadedCount.value += pageSize
  } else {
    // 默认加载30张
    await loadImages({ idx: 0, count: 30, mkt: mkt.value })
  }
}

// ★★★ 重置函数
function resetAndLoad() {
  resetImages()
  loadedCount.value = 0
  loadData()
}

await resetAndLoad()

// ★★★ 滚动加载
onMounted(() => {
  useIntersectionObserver(loadMoreRef, (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting && !isFetching.value) {
        await loadData()
      }
    })
  })
})

watch(() => mkt.value, resetAndLoad)

watch(() => [props.dateParam, props.dateType], resetAndLoad)
</script>

<template>
  <section class="mx-1 flex-1 md:mx-4">
    <!-- 标题 -->
    <div v-if="dateParam && dateType !== 'default'" class="mb-4 text-center">
      <h2 class="text-2xl font-bold">
        <span v-if="dateType === 'year'">{{ dateParam }} 年全部壁纸</span>
        <span v-else-if="dateType === 'month'">{{ dateParam.slice(0,4) }} 年 {{ dateParam.slice(4,6) }} 月壁纸</span>
        <span v-else-if="dateType === 'day'">{{ dateParam }} 壁纸</span>
      </h2>
      <p class="text-sm op-50">共 {{ images.length }} 张</p>
    </div>

    <!-- 空状态 -->
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

    <!-- ★★★ 加载更多（只有年份/月份搜索且有更多数据时才显示） -->
    <div 
      v-if="(dateType === 'year' || dateType === 'month') && images.length > 0" 
      ref="loadMoreRef" 
      class="grid place-items-center py-4"
    >
      <span v-show="isFetching" class="i-system-uicons-loader animate-spin text-3xl" />
      <span v-if="!isFetching" class="text-sm op-50">滚动加载更多...</span>
    </div>

    <!-- 日搜索单张图片的提示 -->
    <div v-if="dateType === 'day' && images.length === 1" class="mt-4 text-center text-sm op-50">
      点击图片查看大图
    </div>

    <!-- 默认首页的加载更多 -->
    <div v-if="dateType === 'default' && images.length > 0" ref="loadMoreRef" class="grid place-items-center">
      <span v-show="isFetching" class="i-system-uicons-loader mt-1 animate-spin text-3xl md:mt-2" />
    </div>
  </section>
</template>
