import { ref, watch, onMounted } from 'vue'

const STORAGE_KEY = 'theme-dark-mode'

// 全局共享状态（单例）
const isDark = ref(false)
let initialized = false

export function useDarkMode() {
  const initTheme = () => {
    if (initialized) return
    initialized = true

    // 优先读取用户保存的偏好
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      isDark.value = saved === 'true'
    } else {
      // 否则跟随系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    applyTheme()

    // 监听系统主题变化（仅在用户未手动设置时生效）
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem(STORAGE_KEY) === null) {
        isDark.value = e.matches
      }
    })
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const toggleDark = () => {
    isDark.value = !isDark.value
    localStorage.setItem(STORAGE_KEY, String(isDark.value))
  }

  // 监听 isDark 变化，实时应用主题
  watch(isDark, () => {
    applyTheme()
  })

  onMounted(() => {
    initTheme()
  })

  return {
    isDark,
    toggleDark
  }
}
