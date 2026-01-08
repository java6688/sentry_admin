import request from '../utils/request'
import { ErrorStatus, Project, Environment, ErrorCategory } from '../enum'

export interface ErrorItem {
  id: number
  type: string
  message: string
  createdAt: string
  category: ErrorCategory
  status: ErrorStatus
  project: Project
  environment: Environment
  url?: string
  method?: string
  statusCode?: number
  payload?: string
  responseData?: string
}

export const getErrorList = (status?: ErrorStatus, createdAt?: string, project?: Project, environment?: Environment): Promise<ErrorItem[]> => {
  return request.get('/error/list', { params: { status, createdAt, project, environment } })
}

export const updateErrorStatus = (id: number, status: ErrorStatus): Promise<void> => {
  return request.patch(`/error/${id}/status`, { status })
}

export const getErrorDetail = (id: number): Promise<ErrorItem> => {
  return request.get(`/error/${id}`)
}
