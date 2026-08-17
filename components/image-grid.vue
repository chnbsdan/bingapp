<script setup lang="ts">
const { mkt } = useMarket()

const props = defineProps<{
  dateType?: string
  dateParam?: string
}>()

const loadMoreRef = ref<HTMLElement>()
const { isFetching, imageMap, loadImages, resetImages } = useImages()

const isLoading = ref(true)

// ★★★ 新增：分页控制
const pageSize = 30
const currentPage = ref(1)
const allImages = ref<any[]>([]) // 存储全部过滤后的图片

// 核心：根据日期类型过滤图片
const images = computed(() => {
  // 如果有日期参数，从 allImages 中分页取数据
  if (props.dateParam && props.dateType !== 'default') {
    const start = 0
    const end = currentPage.value * pageSize
    return allImages.value.slice(start, end)
  }
  
  // 首页：从 imageMap 取数据
  let all = [...imageMap.value.values()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return all
})

// ★★★ 数据加载函数
async function loadData() {
  isLoading.value = true
  try {
    if (props.dateType === 'year' || props.dateType === 'month') {
      await loadImages({ idx: 0, count: 9999, mkt: mkt.value })
      
      // ★★★ 过滤并保存到 allImages
      let filtered: any[] = []
      if (props.dateType === 'year') {
        filtered = [...imageMap.value.values()]
          .filter(img => img.date.startsWith(props.dateParam || ''))
      } else if (props.dateType === 'month') {
        const yearMonth = props.dateParam || ''
        filtered = [...imageMap.value.values()]
          .filter(img => img.date.replace(/-/g, '').startsWith(yearMonth))
      }
      allImages.value = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      currentPage.value = 1 // 重置分页
    } else {
      await loadImages({ idx: 0, count: 30, mkt: mkt.value })
    }
  } catch (error) {
    console.error('数据加载失败:', error)
  } finally {
    isLoading.value = false
  }
}

await loadData()

// ★★★ 加载更多（分页）
function loadMore() {
  if (props.dateType === 'year' || props.dateType === 'month') {
    if (currentPage.value * pageSize < allImages.value.length) {
      currentPage.value++
    }
  } else {
    // 首页滚动加载
    loadImages({ idx: images.value.length, count: 30, mkt: mkt.value })
  }
}

onMounted(() => {
  useIntersectionObserver(loadMoreRef, (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        loadMore()
      }
    })
  })
})

watch(() => mkt.value, resetImages)

watch(() => [props.dateParam, props.dateType], async () => {
  resetImages()
  allImages.value = []
  currentPage.value = 1
  await loadData()
})
</script>

<template>
  <section class="mx-1 flex-1 md:mx-4">
    <div v-if="isLoading" class="text-center py-12">
      <span class="i-system-uicons-loader animate-spin text-3xl" />
      <p class="mt-2 text-sm op-50">加载中...</p>
    </div>

    <template v-else>
      <div v-if="dateParam && dateType !== 'default'" class="mb-4 text-center">
        <h2 class="text-2xl font-bold">
          <span v-if="dateType === 'year'">{{ dateParam }} 年全部壁纸</span>
          <span v-else-if="dateType === 'month'">{{ dateParam.slice(0,4) }} 年 {{ dateParam.slice(4,6) }} 月壁纸</span>
          <span v-else-if="dateType === 'day'">{{ dateParam }} 壁纸</span>
        </h2>
        <p class="text-sm op-50">共 {{ allImages.length }} 张</p>
      </div>

      <div v-if="images.length === 0 && dateParam && dateType !== 'default'" class="text-center py-12">
        <div class="i-system-uicons-search text-6xl op-30" />
        <p class="mt-4 text-lg op-50">
          <span v-if="dateType === 'year'">未找到 {{ dateParam }} 年的壁纸数据</span>
          <span v-else-if="dateType === 'month'">未找到 {{ dateParam.slice(0,4) }} 年 {{ dateParam.slice(4,6) }} 月的壁纸数据</span>
          <span v-else-if="dateType === 'day'">未找到 {{ dateParam }} 的壁纸数据</span>
        </p>
        <p class="text-sm op-30 mt-2">请尝试其他日期或返回首页</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-2 lg:grid-cols-5 md:grid-cols-3">
        <nuxt-link 
          v-for="image in images" 
          :key="image.url" 
          :to="{ params: { date: image.date }, query: { mkt } }"
        >
          <image-card :image="image" />
        </nuxt-link>
      </div>

      <div v-if="dateType === 'day' && images.length === 1" class="mt-4 text-center text-sm op-50">
        点击图片查看大图
      </div>

      <!-- ★★★ 加载更多 -->
      <div v-if="images.length > 0" ref="loadMoreRef" class="grid place-items-center py-4">
        <span v-show="isFetching" class="i-system-uicons-loader animate-spin text-3xl" />
        <!-- ★★★ 显示加载状态文字 -->
        <span v-if="!isFetching && dateType !== 'default' && currentPage * pageSize < allImages.length" class="text-sm op-50">
          滚动加载更多...
        </span>
        <span v-if="!isFetching && dateType !== 'default' && currentPage * pageSize >= allImages.length && allImages.length > 0" class="text-sm op-30">
          已加载全部 {{ allImages.length }} 张
        </span>
      </div>
    </template>
  </section>
</template>
