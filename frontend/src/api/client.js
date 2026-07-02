import axios from 'axios'

// En dev, le proxy Vite (vite.config.js) redirige /api vers le backend local,
// donc le chemin relatif suffit. En prod, frontend et backend sont sur des
// domaines différents (ex. Vercel + Render) : VITE_API_URL doit pointer vers
// l'URL complète du backend déployé.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('dc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dc_token')
      localStorage.removeItem('dc_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
