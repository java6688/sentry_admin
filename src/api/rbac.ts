import request from '../utils/request'
import type { ApiResponse, PaginationResponse } from '../api'

export interface Permission {
  id: number
  name: string
  description?: string
  code?: string
  parentId?: number
}

export interface Role {
  id: number
  name: string
  description?: string
}

export interface UserSummary {
  id: number
  username: string
  createdAt?: string
  roles?: string[]
  disabled?: boolean
}

export const RBAC_API_PATHS = {
  roleList: '/roles',
  roleCreate: '/roles',
  roleUpdate: '/roles',
  roleDelete: '/roles',
  permissionTree: '/permissions',
  permissionList: '/permissions',
  permissionCreate: '/permissions',
  permissionUpdate: '/permissions',
  permissionDelete: '/permissions',
  userList: '/auth/users',
  userRoleAssign: '/roles/assign',
  userRoleRemove: '/roles/remove',
  userRoleGet: '/auth/users/roles',
  rolePermissionAssignOne: '/roles/permissions/assign',
  rolePermissionRemoveOne: '/roles/permissions/remove',
  rolePermissionsByRole: '/roles',
  userRolesByUser: '/auth/users',
}

export interface GetRoleListParams {
  page?: number
  pageSize?: number
  q?: string
}

export const getRoleList = (params: GetRoleListParams = {}): Promise<PaginationResponse<Role>> => {
  const final = { page: 1, pageSize: 10, ...params }
  return request.get(RBAC_API_PATHS.roleList, { params: final }).then((res: unknown) => {
    const raw = (res as any)?.data ?? res
    // case 1: { list: Role[], pagination: {...} }
    if (typeof raw === 'object' && raw !== null) {
      const obj = raw as { list?: unknown; pagination?: unknown; items?: unknown; total?: number }
      if (Array.isArray(obj.list) && typeof obj.pagination === 'object' && obj.pagination !== null) {
        const p = obj.pagination as { page?: number; pageSize?: number; total?: number; totalPages?: number }
        const page = typeof p.page === 'number' ? p.page : final.page
        const pageSize = typeof p.pageSize === 'number' ? p.pageSize : final.pageSize
        const total = typeof p.total === 'number' ? p.total : (Array.isArray(obj.list) ? obj.list.length : 0)
        const pagination = { page, pageSize, total, totalPages: typeof p.totalPages === 'number' ? p.totalPages : Math.ceil(total / pageSize) }
        return { success: true, data: { list: obj.list as Role[], pagination } }
      }
      // case 2: { items: Role[], total?: number }
      if (Array.isArray(obj.items)) {
        const list = obj.items as Role[]
        const total = typeof obj.total === 'number' ? obj.total : list.length
        const pagination = { page: final.page, pageSize: final.pageSize, total, totalPages: Math.ceil(total / final.pageSize) }
        const sliced = list.slice((final.page - 1) * final.pageSize, final.page * final.pageSize)
        return { success: true, data: { list: sliced, pagination } }
      }
    }
    // case 3: Role[]
    const list = Array.isArray(raw) ? (raw as Role[]) : []
    const total = list.length
    const pagination = { page: final.page, pageSize: final.pageSize, total, totalPages: Math.ceil(total / final.pageSize) }
    const sliced = list.slice((final.page - 1) * final.pageSize, final.page * final.pageSize)
    return { success: true, data: { list: sliced, pagination } }
  })
}

export const createRole = (body: { name: string; description?: string }): Promise<ApiResponse<Role>> => {
  return request.post(RBAC_API_PATHS.roleCreate, body)
}

export const updateRole = (id: number, body: Partial<{ name: string; description?: string }>): Promise<ApiResponse<Role>> => {
  return request.patch(`${RBAC_API_PATHS.roleUpdate}/${id}`, body)
}

export const deleteRole = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`${RBAC_API_PATHS.roleDelete}/${id}`)
}

export const getPermissionTree = (): Promise<ApiResponse<Permission[]>> => {
  return request.get(RBAC_API_PATHS.permissionList).then((res: ApiResponse<Array<{ id: number; name: string; description?: string; code?: string; parentId?: number }>>) => {
    const list = res.data.map(p => ({ id: p.id, name: p.name, description: p.description, code: p.code, parentId: p.parentId } as Permission))
    return { success: true, data: list }
  })
}

export const createPermission = (perm: { name: string; description?: string }): Promise<ApiResponse<Permission>> => {
  return request.post(RBAC_API_PATHS.permissionCreate, perm).then((res: ApiResponse<{ id: number; name: string; description?: string }>) => {
    const p = res.data
    const created: Permission = { id: p.id, name: p.name, description: p.description }
    return { success: true, data: created }
  })
}

export const updatePermission = (id: number, patch: Partial<{ name: string; description?: string }>): Promise<ApiResponse<Permission>> => {
  return request.patch(`${RBAC_API_PATHS.permissionUpdate}/${id}`, patch).then((res: ApiResponse<{ id: number; name: string; description?: string }>) => {
    const p = res.data
    const updated: Permission = { id: p.id, name: p.name, description: p.description }
    return { success: true, data: updated }
  })
}

export const deletePermission = (id: number): Promise<ApiResponse<void>> => {
  return request.delete(`${RBAC_API_PATHS.permissionDelete}/${id}`)
}

export interface GetUserListParams {
  page?: number
  pageSize?: number
  username?: string
}

export const getUserList = (params: GetUserListParams = {}): Promise<PaginationResponse<UserSummary>> => {
  const final = { page: 1, pageSize: 10, ...params }
  return request.get(RBAC_API_PATHS.userList, { params: final })
}

export const assignUserRole = (userId: number, roleId: number): Promise<ApiResponse<void>> => {
  return request.post(`${RBAC_API_PATHS.userRoleAssign}/${userId}/${roleId}`)
}

export const removeUserRole = (userId: number, roleId: number): Promise<ApiResponse<void>> => {
  return request.post(`${RBAC_API_PATHS.userRoleRemove}/${userId}/${roleId}`)
}

export const getUserRoles = (userId: number): Promise<ApiResponse<string[]>> => {
  return request.get(`${RBAC_API_PATHS.userRoleGet}/${userId}`)
}

export const getAllUserRolesWithAssigned = (userId: number): Promise<ApiResponse<Array<Role & { assigned: boolean }>>> => {
  return request.get(`${RBAC_API_PATHS.userRolesByUser}/${userId}/roles/all`)
}

export const setUserRolesBatch = (userId: number, payload: { roleIds: number[] }): Promise<ApiResponse<void>> => {
  return request.post(`${RBAC_API_PATHS.userRolesByUser}/${userId}/roles/batch`, payload)
}

export const roleAssignPermission = (roleId: number, permissionId: number): Promise<ApiResponse<void>> => {
  return request.post(`${RBAC_API_PATHS.rolePermissionAssignOne}/${roleId}/${permissionId}`)
}

export const roleRemovePermission = (roleId: number, permissionId: number): Promise<ApiResponse<void>> => {
  return request.post(`${RBAC_API_PATHS.rolePermissionRemoveOne}/${roleId}/${permissionId}`)
}

export const getRolePermissions = (roleId: number): Promise<ApiResponse<Permission[]>> => {
  return request.get(`${RBAC_API_PATHS.rolePermissionsByRole}/${roleId}/permissions`)
}

export const getAllPermissionsWithAssigned = (roleId: number): Promise<ApiResponse<Array<Permission & { assigned: boolean }>>> => {
  return request.get(`${RBAC_API_PATHS.rolePermissionsByRole}/${roleId}/permissions/all`)
}

export const setRolePermissions = (roleId: number, payload: { permissionIds: number[] }): Promise<ApiResponse<void>> => {
  return request.post(`${RBAC_API_PATHS.rolePermissionsByRole}/${roleId}/permissions/batch`, payload)
}
