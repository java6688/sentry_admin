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

export interface GetErrorListParams {
  status?: ErrorStatus;
  createdAt?: string;
  project?: Project;
  environment?: Environment;
  page?: number;
  pageSize?: number;
}

export interface ErrorListResponse {
  success: boolean;
  data: {
    list: ErrorItem[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  };
}

export const getErrorList = (params: GetErrorListParams): Promise<ErrorListResponse> => {
  return request.get('/error/list', {
    params: {
      page: 1, // 默认值
      pageSize: 10, // 默认值
      ...params
    }
  })
}

export const updateErrorStatus = (id: number, status: ErrorStatus): Promise<void> => {
  return request.patch(`/error/${id}/status`, { status })
}

export const getErrorDetail = (id: number): Promise<ErrorItem> => {
  return request.get(`/error/${id}`)
}
