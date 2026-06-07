import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const adminApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  getStats: () => api.get('/admin/stats'),
  getQuestions: () => api.get('/admin/questions'),
  addQuestion: (data: any) => api.post('/admin/questions', data),
  updateQuestion: (id: string, data: any) => api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id: string) => api.delete(`/admin/questions/${id}`),
  getTestCases: (slug: string) => api.get(`/admin/questions/${slug}/testcases`),
  addTestCase: (slug: string, data: any) => api.post(`/admin/questions/${slug}/testcases`, data),
  updateTestCase: (id: string, data: any) => api.put(`/admin/testcases/${id}`, data),
  deleteTestCase: (id: string) => api.delete(`/admin/testcases/${id}`),
  getCheatSheets: () => api.get('/admin/cheatsheets'),
  getCheatSheet: (id: string) => api.get(`/admin/cheatsheets/${id}`),
  addCheatSheet: (data: any) => api.post('/admin/cheatsheets', data),
  updateCheatSheet: (id: string, data: any) => api.put(`/admin/cheatsheets/${id}`, data),
  getTopics: () => api.get('/topics'),
  addTopic: (data: any) => api.post('/admin/topics', data),
  updateTopic: (id: string, data: any) => api.put(`/admin/topics/${id}`, data),
  deleteTopic: (id: string) => api.delete(`/admin/topics/${id}`),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  getPayments: () => api.get('/payments/requests'),
  verifyPayment: (payment_id: string, action: string) => api.post('/payments/admin-verify', { payment_id, action }),
  uploadImage: (formData: FormData) => api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBase64: (data: string) => api.post('/upload-base64', { data }),
  aiChat: (messages: Array<{ role: string; content: string }>) => api.post('/admin/ai-chat', { messages }),
  getPatterns: () => api.get('/admin/patterns'),
  getPattern: (slug: string) => api.get(`/admin/patterns/${slug}`),
  addPattern: (data: any) => api.post('/admin/patterns', data),
  updatePattern: (slug: string, data: any) => api.put(`/admin/patterns/${slug}`, data),
  deletePattern: (slug: string) => api.delete(`/admin/patterns/${slug}`),
  getProducts: () => api.get('/admin/shop/products'),
  getProduct: (id: string) => api.get(`/admin/shop/products/${id}`),
  addProduct: (data: any) => api.post('/admin/shop/products', data),
  updateProduct: (id: string, data: any) => api.put(`/admin/shop/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/shop/products/${id}`),
}
