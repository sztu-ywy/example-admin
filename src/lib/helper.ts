// import dayjs from 'dayjs'

// function bytesToSize(bytes: number) {
//   if (bytes === 0)
//     return '0 B'

//   const k = 1024

//   const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

//   const i = Math.floor(Math.log(bytes) / Math.log(k))

//   return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
// }

// function downloadCsv(header: any, data: any[], fileName: string) {
//   if (!header || !Array.isArray(header) || !Array.isArray(data) || !header.length)
//     return

//   let csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
//   const _header = header.map(h => h.title).join(',')
//   const keys = header.map(item => item.key)

//   csvContent += `${_header}\n`
//   data.forEach((item, index) => {
//     let dataString = ''
//     for (let i = 0; i < keys.length; i++)
//       dataString += `${item[keys[i]]},`

//     csvContent += index < data.length ? dataString.replace(/,$/, '\n') : dataString.replace(/,$/, '')
//   })

//   const a = document.createElement('a')

//   a.href = encodeURI(csvContent)
//   a.download = fileName
//   a.click()
//   window.URL.revokeObjectURL(csvContent)
// }

// function getThumbnail(filename: string | undefined) {
//   const ext = filename?.match(/\.[^/.]+$/)?.[0]
//   switch (ext?.toLowerCase()) {
//     case '.pdf':
//       return filename?.replace(ext, '.jpg')
//     default:
//       return undefined
//   }
// }

// const supportThumbnail = ['application/pdf', 'video/mp4']

// function formatDate(t: number) {
//   return dayjs.unix(t).format('YYYY.MM.DD')
// }

// function formatDateTime(t: number) {
//   return dayjs.unix(t).format('YYYY-MM-DD HH:mm:ss')
// }

// function urlJoin(...args: string[]) {
//   return args
//     .join('/')
//     .replace(/\/+/g, '/')
//     .replace(/^(.+):\//, '$1://')
//     .replace(/^file:/, 'file:/')
//     .replace(/\/(\?|&|#[^!])/g, '$1')
//     .replace(/\?/g, '&')
//     .replace('&', '?')
// }

// function getPaypalUrl(orderId: string) {
//   const paypalUrl = import.meta.env.MODE === 'production' ? 'www.paypal.com' : 'www.sandbox.paypal.com'
//   return `https://${paypalUrl}/activity/payment/${orderId}`
// }

// function getStripeUrl(orderId: string) {
//   const stripeUrl = import.meta.env.MODE === 'production' ? 'https://dashboard.stripe.com' : 'https://dashboard.stripe.com/test'
//   return `${stripeUrl}/payments/${orderId}`
// }

// export {
//   bytesToSize,
//   downloadCsv,
//   formatDate,
//   formatDateTime,
//   getPaypalUrl,
//   getStripeUrl,
//   getThumbnail,
//   supportThumbnail,
//   urlJoin,
// }
