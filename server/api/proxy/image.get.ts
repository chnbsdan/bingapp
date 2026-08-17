// server/api/proxy/image.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const imageUrl = query.url as string

  if (!imageUrl) {
    throw createError({ statusCode: 400, message: 'Missing url parameter' })
  }

  try {
    // 请求原图
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw createError({ statusCode: response.status, message: 'Failed to fetch image' })
    }

    const imageBuffer = await response.arrayBuffer()

    // 设置缓存头，Cloudflare 会自动缓存
    setHeaders(event, {
      'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=2592000', // 缓存30天
      'CDN-Cache-Control': 'public, max-age=2592000',
    })

    return new Uint8Array(imageBuffer)
  } catch (error) {
    console.error('代理图片失败:', error)
    throw createError({ statusCode: 500, message: 'Failed to proxy image' })
  }
})
