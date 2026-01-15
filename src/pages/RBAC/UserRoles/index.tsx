import { useCallback, useEffect, useState } from 'react'
import { Table, Button, Space, message, Tag, Input, Modal, Form, Switch } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  getUserList,
  getAllUserRolesWithAssigned,
  setUserRolesBatch,
  type UserSummary,
} from '../../../api/rbac'
import { enableUser, disableUser, register } from '../../../api'
import AssignRolesModal from '../../../components/RBAC/AssignRolesModal'
import { hasPerm } from '../../../utils/perm'
import './index.css'

export default function UserRoles() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<UserSummary[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [modal, setModal] = useState<{ open: boolean; userId: number | null }>({ open: false, userId: null })
  const [roleIds, setRoleIds] = useState<number[]>([])
  const [username, setUsername] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [form] = Form.useForm<{ username: string; password: string }>()

  const loadUserList = useCallback((p = page, ps = pageSize, searchName = username) => {
    getUserList({ page: p, pageSize: ps, username: searchName })
      .then(res => {
        setData(res.data.list)
        setTotal(res.data.pagination.total)
        setPage(res.data.pagination.page)
        setPageSize(res.data.pagination.pageSize)
      })
      .finally(() => setLoading(false))
  }, [page, pageSize, username])

  useEffect(() => {
    loadUserList(1, pageSize)
  }, [pageSize, loadUserList])


  const columns: ColumnsType<UserSummary> = [
    { title: '用户名', dataIndex: 'username' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (val?: string) => (val ? new Date(val).toLocaleString() : '')
    },
    {
      title: '状态',
      render: (_, record) => (
        hasPerm('user:disable') ? (
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            checked={!record.disabled}
            onChange={(checked) => {
              const action = checked ? enableUser(record.id) : disableUser(record.id)
              action.then(() => {
                message.success(checked ? '用户已启用' : '用户已禁用')
                loadUserList(page, pageSize, username)
              })
            }}
          />
        ) : (
          <span>{record.disabled ? '已禁用' : '已启用'}</span>
        )
      )
    },
    {
      title: '角色',
      dataIndex: 'roles',
      render: (val: string[] = []) => (
        <Space size={4} wrap>
          {val.map((name: string) => (
            <Tag key={name}>{name}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          {hasPerm('user:assignRoles') && <Button type="link" onClick={() => onAssign(record)}>分配/移除角色</Button>}
        </Space>
      )
    }
  ]

  const onAssign = (user: UserSummary) => {
    setModal({ open: true, userId: user.id })
    getAllUserRolesWithAssigned(user.id).then(res => {
      const checked = res.data.filter(r => r.assigned).map(r => r.id)
      setRoleIds(checked)
    })
  }

  const onSave = () => {
    if (!modal.userId) return
    setUserRolesBatch(modal.userId, { roleIds }).then(() => {
      message.success('角色绑定已更新')
      setModal({ open: false, userId: null })
      setRoleIds([])
      loadUserList(page, pageSize)
    })
  }

  return (
    <div className="user-roles-page">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <Space>
          <Input.Search
            allowClear
            placeholder="按用户名搜索"
            onSearch={(v) => { setUsername(v); setLoading(true); loadUserList(1, pageSize, v) }}
            style={{ width: 240 }}
          />
          {hasPerm('user:create') && <Button type="primary" onClick={() => { form.resetFields(); setShowCreate(true) }}>新增用户</Button>}
        </Space>
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
          onChange: (p, ps) => { setLoading(true); loadUserList(p, ps, username) },
          showSizeChanger: true
        }}
      />
      <AssignRolesModal
        open={modal.open}
        userId={modal.userId ?? 0}
        value={roleIds}
        onChange={setRoleIds}
        onCancel={() => setModal({ open: false, userId: null })}
        onOk={onSave}
      />
      <Modal
        title="新增用户"
        open={showCreate}
        onCancel={() => setShowCreate(false)}
        onOk={() => {
          form.validateFields().then(vals => {
            const payload = { username: vals.username, password: vals.password }
            register(payload).then(() => {
              message.success('添加成功')
              setShowCreate(false)
              loadUserList(page, pageSize, username)
            })
          })
        }}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }, { min: 4 }, { max: 20 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }, { min: 6 }, { max: 30 }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
