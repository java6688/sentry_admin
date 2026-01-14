import axios from 'axios'
import { message, Modal } from 'antd'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.success) {
      return data
    }
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    console.error(error)
    if (error.response) {
      const { status, data } = error.response
      switch (status) {
        case 400:
          message.error(data.message || '请求参数错误')
          break
        case 401:
          Modal.confirm({
            title: '登录过期',
            content: '您的登录已过期，是否重新登录？',
            okText: '重新登录',
            cancelText: '取消',
            onOk() {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            },
            onCancel() {
              // 不执行任何操作
            }
          });
          break
        case 403:
          message.error('没有权限访问')
          break
        case 404:
          message.error('请求的资源不存在')
          break
        case 500:
          message.error('服务器错误')
          break
        default:
          message.error(data.message || '请求失败')
      }
    } else if (error.request) {
      message.error('网络请求失败，请检查网络连接')
    } else {
      message.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export type Http = {
  get<T = any>(url: string, config?: unknown): Promise<T>
  post<T = any>(url: string, data?: unknown, config?: unknown): Promise<T>
  patch<T = any>(url: string, data?: unknown, config?: unknown): Promise<T>
  delete<T = any>(url: string, config?: unknown): Promise<T>
}
export default request as unknown as Http
