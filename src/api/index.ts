import request from '../utils/request'
import { ErrorStatus, Project, Environment, ErrorCategory } from '../enum'

// 通用分页信息类型
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 通用响应体类型
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// 通用分页响应类型
export type PaginationResponse<T> = ApiResponse<{
  list: T[];
  pagination: Pagination;
}>;

// 登录请求参数类型
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应用户信息类型
interface LoginUserInfo {
  id: number;
  username: string;
}

// 登录响应类型
export type LoginResponse = ApiResponse<{
  accessToken: string;
  user: LoginUserInfo;
}>;

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

// 错误列表响应类型
export type ErrorListResponse = PaginationResponse<ErrorItem>;

// 登录接口
export const login = (params: LoginParams): Promise<LoginResponse> => {
  return request.post('/auth/login', params);
};

export const getErrorList = (params: GetErrorListParams): Promise<ErrorListResponse> => {
  return request.get('/error/list', {
    params: {
      page: 1, // 默认值
      pageSize: 10, // 默认值
      ...params
    }
  })
}

export const updateErrorStatus = (id: number, status: ErrorStatus): Promise<ApiResponse<void>> => {
  return request.patch(`/error/${id}/status`, { status })
}

export const getErrorDetail = (id: number): Promise<ApiResponse<ErrorItem>> => {
  return request.get(`/error/${id}`)
}

// 退出登录接口
export const logout = (): Promise<ApiResponse<void>> => {
  return request.post('/auth/logout');
}

// 注册接口
export const register = (payload: { username: string; password: string }): Promise<ApiResponse<{ id: number; username: string }>> => {
  return request.post('/auth/register', payload)
}

// 当前用户信息
export const me = (): Promise<ApiResponse<{ id: number; username: string; roles?: string[]; disabled?: boolean }>> => {
  return request.get('/auth/me')
}

// 禁用用户
export const disableUser = (userId: number): Promise<ApiResponse<void>> => {
  return request.post(`/auth/disable/${userId}`)
}

// 启用用户
export const enableUser = (userId: number): Promise<ApiResponse<void>> => {
  return request.post(`/auth/enable/${userId}`)
}
