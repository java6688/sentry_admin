import request from '../utils/request'
import { ErrorStatus } from '../enum'

export interface ErrorItem {
  id: number
  type: string
  message: string
  createdAt: string
  category: string
  status?: string
}

export const getErrorList = (status?: ErrorStatus): Promise<ErrorItem[]> => {
  return request.get('/error/list', { params: { status } })
}

export const updateErrorStatus = (id: number, status: ErrorStatus): Promise<void> => {
  return request.patch(`/error/${id}/status`, { status })
}

export const getErrorDetail = (id: number): Promise<ErrorItem> => {
  return request.get(`/error/${id}`)
}
