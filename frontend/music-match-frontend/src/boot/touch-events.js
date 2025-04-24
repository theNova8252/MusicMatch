import { boot } from 'quasar/wrappers'
import Vue3TouchEvents from 'vue3-touch-events'

export default boot(({ app }) => {
  app.use(Vue3TouchEvents)
})
