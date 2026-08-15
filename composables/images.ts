// composables/images.ts
import type { BingImageMeta } from '~/types'

const state = reactive({
  hasMore: true,
  isFetching: false,
  imageMap: new Map<string, BingImageMeta>(),
  chinaAllData: [] as BingImageMeta[],
  chinaDisplayCount: 30,
  chinaHasMore: true,
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

// ========== 构建图片 URL ==========
function buildImageUrl(item: any): string {
    if (item.thumb) {
        if (item.thumb.startsWith('/')) {
            return `https://www.bing.com${item.thumb}`;
        }
        return item.thumb;
    }
    if (item.url) {
        return item.url;
    }
    if (item.urlbase) {
        let url = item.urlbase;
        if (url.startsWith('/')) {
            return `https://www.bing.com${url}`;
        }
        if (url.startsWith('http')) {
            return url;
        }
        return `https://www.bing.com/${url}`;
    }
    return '';
}

// ========== 转换历史数据 ==========
function transformHistoryItem(item: any): BingImageMeta {
    let date = item.startdate || '';
    if (date && date.length === 8) {
        date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    }
    
    let url = buildImageUrl(item);
    // 如果 URL 是必应图片，添加分辨率参数
    if (url.includes('/th?id=') && !url.includes('&w=')) {
        url = `${url}&w=480&h=270`;
    }
    
    return {
        url: url,
        date: date,
        title: item.title || '无标题',
        copyright: item.copyright || '',
        copyrightlink: item.copyrightlink || '',
    };
}

// ========== 中国区汇总：分页加载 ==========
async function loadChinaHistory(reset: boolean = true) {
  if (state.isFetching) return
  
  if (reset) {
    state.imageMap = new Map()
    state.chinaAllData = []
    state.chinaDisplayCount = 30
    state.chinaHasMore = true
  }

  if (!state.chinaHasMore && !reset) {
    console.log('📭 已全部显示');
    return
  }

  // 首次加载：获取全部数据
  if (state.chinaAllData.length === 0) {
    state.isFetching = true
    try {
      const response = await fetch('/data/data.json')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = await response.json()

      if (!Array.isArray(data) || data.length === 0) {
        console.log('📭 没有中国区历史数据');
        state.chinaHasMore = false;
        state.isFetching = false;
        return;
      }

      state.chinaAllData = data.map((item: any) => transformHistoryItem(item))
        .filter(item => item.url);

      console.log(`📊 总数据量: ${state.chinaAllData.length} 条`)
      state.isFetching = false
    } catch (error) {
      console.error('加载中国区汇总失败:', error)
      state.chinaHasMore = false
      state.isFetching = false
      return
    }
  }

  if (state.chinaDisplayCount >= state.chinaAllData.length) {
    state.chinaHasMore = false
    console.log('📭 已全部显示');
    return
  }

  const newCount = Math.min(state.chinaDisplayCount + 30, state.chinaAllData.length)
  const batch = state.chinaAllData.slice(state.chinaDisplayCount, newCount)

  batch.forEach(image => {
    state.imageMap.set(image.date, image)
  })

  state.chinaDisplayCount = newCount
  state.chinaHasMore = state.chinaDisplayCount < state.chinaAllData.length

  console.log(`📚 已显示: ${state.chinaDisplayCount} / ${state.chinaAllData.length} 条`)
}

function resetImages() {
  state.imageMap = new Map()
  state.hasMore = true
  state.isFetching = false
  state.chinaAllData = []
  state.chinaDisplayCount = 30
  state.chinaHasMore = true
}

async function getImageByKey(date: string, mkt: string) {
  if (!date) return null

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
    loadChinaHistory,
    resetImages,
    getImageByKey,
  }
}
