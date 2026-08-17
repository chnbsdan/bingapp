<template>
  <input
    type="text"
    :value="inputValue"
    @input="onInput"
    @keydown.enter="onSearch"
    @blur="onBlur"
    :placeholder="placeholder"
    class="date-input"
  />
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const inputValue = ref('')
const placeholder = ref('输入日期或年份')

watch(
  () => route.params.date,
  (newDate) => {
    if (typeof newDate === 'string' && newDate.includes('-')) {
      inputValue.value = newDate
    } else {
      inputValue.value = ''
    }
  },
  { immediate: true }
)

// 判断格式
const isYear = (val: string): boolean => /^\d{4}$/.test(val)
const isYearMonth = (val: string): boolean => /^\d{6}$/.test(val)
const isFullDate = (val: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(val)
const isDateNoSep = (val: string): boolean => /^\d{8}$/.test(val)

const doSearch = (val: string) => {
  if (!val) {
    router.push('/')
    return
  }
  
  const trimmed = val.trim()
  const currentMkt = route.query.mkt || 'zh-CN'
  let targetUrl = ''
  
  // 统一跳转到 /{输入值}，由页面根据格式判断类型
  if (isYear(trimmed) || isYearMonth(trimmed)) {
    targetUrl = `/${trimmed}?mkt=${currentMkt}`
  } else if (isFullDate(trimmed)) {
    targetUrl = `/${trimmed}?mkt=${currentMkt}`
  } else if (isDateNoSep(trimmed)) {
    const d = `${trimmed.slice(0, 4)}-${trimmed.slice(4, 6)}-${trimmed.slice(6, 8)}`
    targetUrl = `/${d}?mkt=${currentMkt}`
  } else {
    targetUrl = `/${trimmed}?mkt=${currentMkt}`
  }
  
  // ★★★ 核心修改：使用 window.location.href 强制刷新
  // 对于年份和月份，使用强制刷新；对于日期，使用 router.push（SPA跳转）
  if (isYear(trimmed) || isYearMonth(trimmed)) {
    window.location.href = targetUrl
  } else {
    router.push(targetUrl)
  }
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
}

const onSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  doSearch(target.value)
}

const onBlur = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.value) {
    doSearch(target.value)
  }
}
</script>

<style scoped>
.date-input {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: transparent;
  font-size: 14px;
  color: inherit;
  max-width: 160px;
}
.date-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
}
.date-input::placeholder {
  color: #999;
  font-size: 12px;
}
@media (max-width: 640px) {
  .date-input {
    max-width: 130px;
    font-size: 12px;
    padding: 2px 6px;
  }
}
</style>
