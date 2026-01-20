import request from '../utils/request'
import type { ApiResponse, PaginationResponse } from './index'

export enum BugPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum BugStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export const BugPriorityMap: Record<BugPriority, string> = {
  [BugPriority.LOW]: '低',
  [BugPriority.MEDIUM]: '中',
  [BugPriority.HIGH]: '高',
  [BugPriority.CRITICAL]: '紧急',
}

export const BugStatusMap: Record<BugStatus, string> = {
  [BugStatus.OPEN]: '待解决',
  [BugStatus.IN_PROGRESS]: '处理中',
  [BugStatus.RESOLVED]: '已解决',
  [BugStatus.CLOSED]: '已关闭',
}

export interface BugReport {
  id: string
  title: string
  description: string
  priority: BugPriority
  status: BugStatus
  assigneeId?: number
  reporterId: number
  createdAt: string
  updatedAt: string
  // Add other potential fields from response if needed
}

export interface CreateBugReportDto {
  title: string
  description: string
  priority?: BugPriority
  assigneeId?: number
}

export interface UpdateBugReportDto extends Partial<CreateBugReportDto> {
  status?: BugStatus
}

export interface AssignBugReportDto {
  assigneeId: number
}

export interface GetBugReportListParams {
  page?: number
  limit?: number
  status?: BugStatus
  priority?: BugPriority
  reporterId?: number
  assigneeId?: number
}

export const BUG_REPORT_API_PATHS = {
  list: '/bug-reports',
  create: '/bug-reports',
  detail: '/bug-reports', // + /:id
  update: '/bug-reports', // + /:id
  delete: '/bug-reports', // + /:id
  assign: '/bug-reports', // + /:id/assign
  upload: '/upload/image',
}

export const getBugReportList = (params: GetBugReportListParams = {}): Promise<PaginationResponse<BugReport>> => {
  return request.get(BUG_REPORT_API_PATHS.list, { params })
}

export const getBugReportDetail = (id: string): Promise<ApiResponse<BugReport>> => {
  return request.get(`${BUG_REPORT_API_PATHS.detail}/${id}`)
}

export const createBugReport = (data: CreateBugReportDto): Promise<ApiResponse<BugReport>> => {
  return request.post(BUG_REPORT_API_PATHS.create, data)
}

export const updateBugReport = (id: string, data: UpdateBugReportDto): Promise<ApiResponse<BugReport>> => {
  return request.patch(`${BUG_REPORT_API_PATHS.update}/${id}`, data)
}

export const deleteBugReport = (id: string): Promise<ApiResponse<void>> => {
  return request.delete(`${BUG_REPORT_API_PATHS.delete}/${id}`)
}

export const assignBugReport = (id: string, data: AssignBugReportDto): Promise<ApiResponse<void>> => {
  return request.post(`${BUG_REPORT_API_PATHS.assign}/${id}/assign`, data)
}

export const uploadBugImage = (file: File): Promise<ApiResponse<string>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(BUG_REPORT_API_PATHS.upload, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
