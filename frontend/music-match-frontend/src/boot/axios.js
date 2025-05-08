import { boot } from 'quasar/wrappers'
import axios from 'axios'


const api = axios.create({ baseURL: process.env.VITE_API_URL })

export default boot(({ app }) => {
  app.config.globalProperties.$api = api
})

export { api }
