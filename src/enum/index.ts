export enum ErrorCategory {
  API_ERROR = "API_ERROR",
  FRONTEND_ERROR = "FRONTEND_ERROR",
  OTHER = "OTHER",
}

export const ErrorCategoryLabels: Record<ErrorCategory, string> = {
  [ErrorCategory.API_ERROR]: 'API 错误',
  [ErrorCategory.FRONTEND_ERROR]: '前端错误',
  [ErrorCategory.OTHER]: '其他错误',
}

export enum ErrorStatus {
  UNRESOLVED = "UNRESOLVED",
  RESOLVED = "RESOLVED",
  IN_PROGRESS = "IN_PROGRESS",
}

export const ErrorStatusLabels: Record<ErrorStatus, string> = {
  [ErrorStatus.UNRESOLVED]: '未解决',
  [ErrorStatus.RESOLVED]: '已解决',
  [ErrorStatus.IN_PROGRESS]: '处理中',
}

export enum Project {
  TEST = "TEST",
  TENANT = "TENANT",
  DEVICE = "DEVICE"
}

export const ProjectLabels: Record<Project, string> = {
  [Project.TEST]: '测试系统',
  [Project.TENANT]: '租户系统',
  [Project.DEVICE]: '设备系统'
}

export enum Environment {
  PRODUCTION = "PRODUCTION",
  DEVELOPMENT = "DEVELOPMENT",
  TEST = "TEST"
}
export const EnvironmentLabels: Record<Environment, string> = {
  [Environment.PRODUCTION]: '生产环境',
  [Environment.DEVELOPMENT]: '开发环境',
  [Environment.TEST]: '测试环境',
}