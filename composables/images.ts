// composables/images.ts
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

// ========== 修改：直接请求静态文件 ==========
async function loadChinaHistory() {
  if (state.isFetching) return

  state.isFetching = true
  try {
    // 直接请求静态文件（通过 publicAssets 复制到 public）
    const response = await fetch('/archive/data.json')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const data = await response.json()

    // data 是数组格式: [{ startdate, urlbase, title, copyright }, ...]
    if (!Array.isArray(data) || data.length === 0) {
      console.log('📭 没有中国区历史数据');
      state.imageMap = new Map();
      state.hasMore = false;
      return;
    }

    // 转换为 BingImageMeta 格式
    const images: BingImageMeta[] = data.map((item: any) => {
      // 日期格式转换：YYYYMMDD -> YYYY-MM-DD
      let date = item.startdate || '';
      if (date && date.length === 8) {
        date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      }
      
      // 处理 urlbase
      let url = item.urlbase || '';
      if (url && url.startsWith('/')) {
        url = `https://www.bing.com${url}`;
      }

      return {
        url: url,
        date: date,
        title: item.title || '',
        copyright: item.copyright || '',
        copyrightlink: item.copyrightlink || '',
      };
    });

    state.imageMap = new Map();
    images.forEach(image => state.imageMap.set(image.date, image));
    state.hasMore = false;

    console.log(`📚 加载了中国区汇总数据: ${images.length} 条`);

  } catch (error) {
    console.error('加载中国区汇总失败:', error);
    state.imageMap = new Map();
    state.hasMore = false;
  } finally {
    state.isFetching = false;
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
    loadChinaHistory,
    resetImages,
    getImageByKey,
  }
}
