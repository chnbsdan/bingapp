// composables/images.ts
import type { BingImageMeta } from '~/types'

const state = reactive({
  hasMore: true,
  isFetching: false,
  imageMap: new Map<string, BingImageMeta>(),
})

// 原有的 loadImages 函数保持不变
async function loadImages(query: { idx: number, count: number, mkt: string }) {
  if (state.isFetching || !state.hasMore)
    return

  state.isFetching = true
  const images = await $fetch('/api/images', { query })
  state.isFetching = false
  state.hasMore = images.length >= query.count - 2
  images.forEach(image => state.imageMap.set(image.date, image))
}

// ========== 新增：加载中国区汇总数据 ==========
async function loadChinaHistory() {
  if (state.isFetching) return

  state.isFetching = true
  try {
    const response = await fetch('/archive/data.json')
    if (!response.ok) {
      throw new Error('Failed to fetch China history')
    }
    const data = await response.json()

    // data 格式: { "20100102": {...}, "20100103": {...}, ... }
    // 转换为 BingImageMeta 格式
    const images: BingImageMeta[] = Object.keys(data)
      .sort((a, b) => b.localeCompare(a)) // 最新的在前
      .map(startdate => {
        const item = data[startdate]
        // 将 startdate (YYYYMMDD) 转换为 date (YYYY-MM-DD)
        const date = `${startdate.slice(0, 4)}-${startdate.slice(4, 6)}-${startdate.slice(6, 8)}`

        // 构建完整URL
        let url = ''
        if (item.urlbase) {
          if (item.urlbase.startsWith('http')) {
            url = item.urlbase
          } else if (item.urlbase.startsWith('/th?id=')) {
            url = `https://www.bing.com${item.urlbase}_1920x1080.jpg`
          } else {
            url = item.urlbase
          }
        } else if (item.url) {
          url = item.url
        }

        return {
          url: url,
          date: date,
          title: item.title || '',
          copyright: item.copyright || '',
          copyrightlink: item.copyrightlink || '',
        }
      })

    // 清空并填充 imageMap
    state.imageMap = new Map()
    images.forEach(image => state.imageMap.set(image.date, image))
    state.hasMore = false // 历史数据一次性加载完

    console.log(`📚 加载了中国区汇总数据: ${images.length} 条`)

  } catch (error) {
    console.error('加载中国区汇总失败:', error)
    state.imageMap = new Map()
    state.hasMore = false
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
    loadChinaHistory, // 导出新函数
    resetImages,
    getImageByKey,
  }
}
