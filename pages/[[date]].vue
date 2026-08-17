<script setup lang="ts">
const { height: windowHeight, width: windowWidth } = useWindowSize()
const { y: scrollY, x: scrollX } = useWindowScroll({ behavior: 'smooth' })

// 解析路由参数
const route = useRoute()
const dateParam = route.params.date as string || ''

// 判断参数类型
const dateType = computed(() => {
  if (!dateParam) return 'default'
  
  // 匹配 YYYY (4位数字) - 年份
  if (/^\d{4}$/.test(dateParam)) return 'year'
  
  // 匹配 YYYYMM (6位数字) - 年月
  if (/^\d{6}$/.test(dateParam)) return 'month'
  
  // 匹配 YYYYMMDD (8位数字) - 日期（纯数字格式）
  if (/^\d{8}$/.test(dateParam)) return 'day'
  
  // 匹配 YYYY-MM-DD (带横杠的日期) - 日期
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return 'day'
  
  return 'default'
})

// 标准化日期参数（统一转为 YYYY-MM-DD 格式）
const normalizedDate = computed(() => {
  // 如果是8位纯数字日期，转为带横杠格式
  if (dateType.value === 'day' && /^\d{8}$/.test(dateParam)) {
    return `${dateParam.slice(0, 4)}-${dateParam.slice(4, 6)}-${dateParam.slice(6, 8)}`
  }
  return dateParam
})

// 提供给子组件使用
provide('dateParam', normalizedDate)
provide('dateType', dateType)

provide('isMobile', computed(() => {
  return windowWidth.value < 730
}))

const isBackTopVisible = computed(() => {
  return scrollY.value > windowHeight.value * 0.5
})

function scrollTo({ x = 0, y = 0 }: { x?: number, y?: number } = {}) {
  scrollX.value = x
  scrollY.value = y
}

const requestUrl = useRequestURL()
const { market } = useMarket()

useHead({
  htmlAttrs: {
    lang: market.value.lang,
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.ico' },
    { rel: 'canonical', href: `${requestUrl.toString()}` },
  ],
  meta: [
    { name: 'keywords', content: market.value.keywords },
    { name: 'viewport', content: 'width=device-width,user-scalable=no,initial-scale=1,maximum-scale=1,minimum-scale=1,viewport-fit=cover' },
    { name: 'theme-color', content: 'black' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black' },
  ],
})

useCustomSeoMeta({
  title: market.value.title,
  description: market.value.description,
  ogUrl: requestUrl.toString(),
  ogImage: `${requestUrl.origin}/og.jpeg`,
})
</script>

<template>
  <div class="min-h-screen flex flex-col gap-1 md:gap-2">
    <header class="sticky top-0 z-10 mx-1 border-b-1 rounded-b px-4 py-2 shadow backdrop-blur md:mx-4 bg-base">
      <div class="flex items-center">
        <img src="/favicon.ico" alt="Logo" class="h-6 w-auto" />
        <div class="mx-1 flex items-center">
          <h1 class="font-bold">
            {{ market.title }}
          </h1>
          <span class="mx-1 hidden sm:inline">-</span>
          <span class="hidden sm:inline">{{ market.description }}</span>
        </div>

        <market-select />
        <date-picker />

        <div class="ml-auto" />

        <button
          v-show="isBackTopVisible" class="rounded-full p-2 text-2xl hover:bg-black:10"
          @click="() => scrollTo({ y: 0 })"
        >
          <div class="i-system-uicons-arrow-up-circle m--2px text-28px" />
        </button>

        <div class="rounded-full p-2 text-2xl hover:bg-black:10">
          <nuxt-link
            class="i-system-uicons-document block text-inherit" target="_blank"
            to="https://bing.api.hangdn.com/api"
          />
        </div>
      </div>
    </header>

    <!-- ★★★ 核心修改：使用 ClientOnly + :key 强制刷新 ★★★ -->
    <ClientOnly>
      <image-grid 
        :key="route.fullPath" 
        :date-type="dateType" 
        :date-param="normalizedDate" 
      />
      <image-preview />
    </ClientOnly>

    <footer class="py-4 text-center bg-base">
      <span class="text-xs op-50">© {{ new Date().getFullYear() }} · 由小史先生维护 | All pictures on this site are from Bing search</span>
    </footer>
  </div>
</template>
