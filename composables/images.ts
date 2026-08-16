import type { BingImageMeta } from '~/types'

const state = reactive({
  hasMore: true,
  isFetching: false,
  imageMap: new Map<string, BingImageMeta>(),
})

async function loadImages(query: { idx: number, count: number, mkt: string }) {
  if (state.isFetching || !state.hasMore)
    return

  state.isFetching = true
  const images = await $fetch('/api/images', { query })
  state.isFetching = false
  state.hasMore = images.length >= query.count - 2
  images.forEach(image => state.imageMap.set(image.date, image))
}

// 新增：按年月加载所有图片（用于搜索）
async function loadImagesByYearMonth(year: string, month: string | null, mkt: string) {
  if (state.isFetching)
    return

  state.isFetching = true
  try {
    // 获取该语言的所有数据
    const images = await $fetch('/api/images', { 
      query: { idx: 0, count: 999, mkt } 
    })
    
    // 过滤出指定年月的数据
    const filteredImages = images.filter((img: BingImageMeta) => {
      const dateStr = img.date.replace(/-/g, '')
      if (month) {
        return dateStr.startsWith(year + month)
      }
      return dateStr.startsWith(year)
    })
    
    filteredImages.forEach(image => state.imageMap.set(image.date, image))
    state.hasMore = false // 一次性加载完成
  } finally {
    state.isFetching = false
  }
}

function resetImages() {
  state.imageMap = new Map()
  state.hasMore = true
  state.isFetching = false
}

async function getImageByKey(date: string, mkt: string) {
  if (!date)
    return null

  if (state.imageMap.has(date)) {
    return state.imageMap.get(date)!
  } else {
    try {
      const image = await $fetch('/api/image', { query: { date, mkt } })
      state.imageMap.set(date, image)
      return image
    } catch {
      return null
    }
  }
}

export function useImages() {
  return { 
    ...toRefs(state), 
    loadImages, 
    loadImagesByYearMonth,
    resetImages, 
    getImageByKey 
  }
}
