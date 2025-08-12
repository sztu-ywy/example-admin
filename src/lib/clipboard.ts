/**
 * 兼容性复制到剪贴板函数
 * 支持现代浏览器的 Clipboard API 和旧版浏览器的 execCommand 方式
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
  }
  catch {
    // Clipboard API 失败，回退到 execCommand
  }

  // 回退到 execCommand 方式
  return new Promise((resolve, reject) => {
    try {
      // 创建临时文本区域
      const textArea = document.createElement('textarea')
      textArea.value = text

      // 设置样式使其不可见
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'

      document.body.appendChild(textArea)

      // 选择文本
      textArea.focus()
      textArea.select()
      textArea.setSelectionRange(0, text.length)

      // 执行复制命令
      const successful = document.execCommand('copy')

      // 清理
      document.body.removeChild(textArea)

      if (successful) {
        resolve()
      }
      else {
        reject(new Error('execCommand copy failed'))
      }
    }
    catch (error) {
      reject(error)
    }
  })
}

/**
 * 安全的复制函数，包含错误处理
 */
export async function safeCopyToClipboard(text: string): Promise<boolean> {
  try {
    await copyToClipboard(text)
    return true
  }
  catch {
    // 复制失败，返回 false
    return false
  }
}
