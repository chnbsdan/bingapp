<script setup lang="ts">
const { mkt } = useMarket()

// Props 接收日期类型和参数
const props = defineProps<{
  dateType?: string
  dateParam?: string
}>()

const loadMoreRef = ref<HTMLElement>()
const { isFetching, imageMap, loadImages, resetImages, loadImagesByYearMonth } = useImages()

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

// ★★★ 修复：增加 try-catch 错误处理
async function initialLoad() {
  try {
    if (props.dateType === 'day' && props.dateParam) {
      const yearMonth = props.dateParam.replace(/-/g, '').slice(0, 6)
      const year = yearMonth.slice(0, 4)
      const month = yearMonth.slice(4, 6)
      await loadImagesByYearMonth(year, month, mkt.value)
    } 
    else if (props.dateType === 'year' || props.dateType === 'month') {
      await loadImages({ idx: 0, count: 366, mkt: mkt.value })
    } 
    else {
      await loadImages({ idx: 0, count: 30, mkt: mkt.value })
    }
  } catch (error) {
    console.error('ImageGrid 数据加载失败:', error)
  }
}

await initialLoad()

onMounted(async () => {
  useIntersectionObserver(loadMoreRef, (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        if (props.dateType === 'day') return
        const count = (props.dateType === 'year' || props.dateType === 'month') ? 366 : 30
        await loadImages({ idx: images.value.length, count, mkt: mkt.value })
      }
    })
  })
})

watch(() => mkt.value, resetImages)

watch(() => [props.dateParam, props.dateType], async () => {
  resetImages()
  await initialLoad()
})
</script>
