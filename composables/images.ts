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

// ========== 工具函数：构建图片 URL ==========
function buildImageUrl(item: any): string {
    // 1. 优先使用 thumb（缩略图，历史数据专用）
    if (item.thumb) {
        if (item.thumb.startsWith('/')) {
            return `https://www.bing.com${item.thumb}`;
        }
        return item.thumb;
    }

    // 2. 使用 url 字段
    if (item.url) {
        return item.url;
    }

    // 3. 处理 urlbase 字段
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

    // 4. 都没有，返回空字符串
    return '';
}

// ========== 转换历史数据 ==========
function transformHistoryItem(item: any): BingImageMeta | null {
    if (!item.startdate) return null;
    
    let date = item.startdate;
    if (date.length === 8) {
        date = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    } else if (!date.includes('-')) {
        return null;
    }
    
    let url = buildImageUrl(item);
    if (!url) return null;
    
    // 添加缩略图参数（400x240）
    if (url.includes('/th?id=') && !url.includes('&w=')) {
        url = `${url}&w=400&h=240`;
    }
    
    return {
        url: url,
        date: date,
        title: item.title || '无标题',
        copyright: item.copyright || '',
        copyrightlink: item.copyrightlink || '',
    };
}

// ========== 加载中国区汇总数据 ==========
async function loadChinaHistory() {
  if (state.isFetching) return

  state.isFetching = true
  try {
    // 通过 API 接口获取数据
    const data = await $fetch('/api/data')
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('📭 没有中国区历史数据');
      state.imageMap = new Map();
      state.hasMore = false;
      return;
    }

    // 转换数据，过滤无效条目
    const images = data
      .map((item: any) => transformHistoryItem(item))
      .filter((item): item is BingImageMeta => item !== null);

    console.log(`📊 有效数据: ${images.length} 条`);

    // 按日期降序排序（最新的在前）
    images.sort((a, b) => b.date.localeCompare(a.date));

    // 清空并填充 imageMap
    state.imageMap = new Map();
    images.forEach(image => {
      state.imageMap.set(image.date, image);
    });
    state.hasMore = false;

    console.log(`📅 最新日期: ${images[0]?.date}`);
    console.log(`📅 最旧日期: ${images[images.length - 1]?.date}`);
    console.log(`📚 加载了中国区汇总数据: ${state.imageMap.size} 条`);

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
