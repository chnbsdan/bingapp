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

// ★★★ 核心修改：根据日期类型决定加载策略
async function initialLoad() {
  // 1. 如果是“日”搜索，加载对应月份的完整数据（最多31张）
  if (props.dateType === 'day' && props.dateParam) {
    // 从 YYYY-MM-DD 中提取 YYYYMM
    const yearMonth = props.dateParam.replace(/-/g, '').slice(0, 6)
    const year = yearMonth.slice(0, 4)
    const month = yearMonth.slice(4, 6)
    // 调用专门加载年月的方法，确保该月所有数据都被加载
    await loadImagesByYearMonth(year, month, mkt.value)
  } 
  // 2. 如果是“年”或“月”搜索，加载全年数据（最多366张）
  else if (props.dateType === 'year' || props.dateType === 'month') {
    await loadImages({ idx: 0, count: 366, mkt: mkt.value })
  } 
  // 3. 默认（首页）加载最近30张
  else {
    await loadImages({ idx: 0, count: 30, mkt: mkt.value })
  }
}

await initialLoad()

onMounted(async () => {
  useIntersectionObserver(loadMoreRef, (entries) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        // 对于“日”搜索，数据已一次性加载完，无需再加载更多
        if (props.dateType === 'day') return
        
        // 年月搜索一次性加载完所有数据
        const count = (props.dateType === 'year' || props.dateType === 'month') ? 366 : 30
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
