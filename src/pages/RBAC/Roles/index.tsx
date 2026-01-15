import { useCallback, useEffect, useState } from 'react'
import { Table, Button, Space, Drawer, Modal, message, Tag, Spin } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  type Role,
  type Permission,
  getRolePermissions,
} from '../../../api/rbac'
import RoleForm, { type RoleFormValues } from '../../../components/RBAC/RoleForm'
import AssignPermissionsModal from '../../../components/RBAC/AssignPermissionsModal'
import './index.css'

export default function Roles() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Role[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [permModal, setPermModal] = useState<{ open: boolean; role: Role | null }>({ open: false, role: null })
  const [permDrawer, setPermDrawer] = useState<{ open: boolean; role: Role | null }>({ open: false, role: null })
  const [permDrawerLoading, setPermDrawerLoading] = useState(false)
  const [permList, setPermList] = useState<Permission[]>([])

  const loadRoleList = useCallback((p = page, ps = pageSize) => {
    getRoleList({ page: p, pageSize: ps })
      .then(res => {
        setData(res.data.list)
        setTotal(res.data.pagination.total)
        setPage(res.data.pagination.page)
        setPageSize(res.data.pagination.pageSize)
      })
      .finally(() => setLoading(false))
  }, [page, pageSize])

  useEffect(() => {
    loadRoleList(1, pageSize)
  }, [pageSize, loadRoleList])

  const columns: ColumnsType<Role> = [
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '权限',
      render: (_, record) => (
        <Button type="link" onClick={() => onViewPerms(record)}>查看权限</Button>
      )
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>编辑</Button>
          <Button type="link" onClick={() => onAssignPerms(record)}>分配权限</Button>
          <Button type="link" onClick={() => window.location.href = '/rbac/assign-permissions'}>批量分配</Button>
          <Button type="link" danger onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ]

  const onCreate = () => {
    setEditing(null)
    setShowForm(true)
  }

  const onEdit = (role: Role) => {
    setEditing(role)
    setShowForm(true)
  }

  const onSubmitForm = (values: RoleFormValues) => {
    const action = editing ? updateRole(editing.id, values) : createRole(values)
    action.then(() => {
      message.success('保存成功')
      setShowForm(false)
      setEditing(null)
      loadRoleList(page, pageSize)
    })
  }

  const onDelete = (role: Role) => {
    Modal.confirm({
      title: '确认删除该角色？',
      onOk: () => {
        return deleteRole(role.id).then(() => {
          message.success('删除成功')
          loadRoleList(page, pageSize)
        })
      }
    })
  }

  const onAssignPerms = (role: Role) => {
    setPermModal({ open: true, role })
  }

  const onViewPerms = (role: Role) => {
    setPermDrawer({ open: true, role })
    setPermDrawerLoading(true)
    setPermList([])
    getRolePermissions(role.id)
      .then(res => setPermList(res.data))
      .finally(() => setPermDrawerLoading(false))
  }

  const onClosePerms = () => {
    setPermModal({ open: false, role: null })
  }

  return (
    <div className="roles-page">
      <div className="toolbar">
        <Button type="primary" onClick={onCreate}>新建角色</Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setLoading(true); loadRoleList(p, ps) },
          showSizeChanger: true
        }}
      />
      <Drawer
        title={editing ? '编辑角色' : '新建角色'}
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null) }}
        destroyOnHidden
        size={480}
      >
        <RoleForm
          initialValues={editing ? { name: editing.name, description: editing.description } : undefined}
          onSubmit={onSubmitForm}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      </Drawer>
      <Drawer
        title={permDrawer.role ? `【${permDrawer.role.name}】的权限` : '角色权限'}
        open={permDrawer.open}
        onClose={() => setPermDrawer({ open: false, role: null })}
        destroyOnHidden
        width={640}
      >
        {permDrawerLoading ? (
          <Spin />
        ) : (
          <Space size={[8, 8]} wrap>
            {permList.length === 0 ? (
              <span>暂无权限</span>
            ) : (
              permList.map(p => <Tag key={p.id}>{`${p.name}${p.description ? `（${p.description}）` : ''}`}</Tag>)
            )}
          </Space>
        )}
      </Drawer>
      {permModal.role && (
        <AssignPermissionsModal
          open={permModal.open}
          roleId={permModal.role.id}
          onCancel={onClosePerms}
          onOk={onClosePerms}
        />
      )}
    </div>
  )
}
