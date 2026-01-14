import { useEffect, useState } from 'react'
import { Table, Button, Space, Modal, Form, Input, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getPermissionTree, createPermission, updatePermission, deletePermission, type Permission } from '../../../api/rbac'
import './index.css'

type PermissionFormValues = {
  name: string
  description?: string
}

export default function Permissions() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Permission[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Permission | null>(null)
  const [form] = Form.useForm<PermissionFormValues>()

  const loadPermissions = () => {
    getPermissionTree()
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPermissions()
  }, [])

  const columns: ColumnsType<Permission> = [
    { title: 'ID', dataIndex: 'id' },
    { title: '名称', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => onEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => onDelete(record)}>删除</Button>
        </Space>
      )
    }
  ]

  const onCreate = () => {
    setEditing(null)
    setShowForm(true)
    form.resetFields()
  }

  const onEdit = (perm: Permission) => {
    setEditing(perm)
    setShowForm(true)
    form.setFieldsValue({
      name: perm.name,
      description: perm.description,
    })
  }

  const onDelete = (perm: Permission) => {
    Modal.confirm({
      title: '确认删除该权限？',
      onOk: () => deletePermission(perm.id).then(() => {
        message.success('删除成功')
        loadPermissions()
      })
    })
  }

  const onSubmit = () => {
    form.validateFields().then(values => {
      if (editing) {
        const patch = { name: values.name, description: values.description }
        updatePermission(editing.id, patch).then(() => {
          message.success('更新成功')
          setShowForm(false)
          setEditing(null)
          loadPermissions()
        })
      } else {
        const payload = { name: values.name as string, description: values.description as string | undefined }
        createPermission(payload).then(() => {
          message.success('创建成功')
          setShowForm(false)
          loadPermissions()
        })
      }
    })
  }

  return (
    <div className="permissions-page">
      <div className="toolbar">
        <Button type="primary" onClick={onCreate}>新建权限</Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
      />
      <Modal
        title={editing ? '编辑权限' : '新建权限'}
        open={showForm}
        onCancel={() => { setShowForm(false); setEditing(null) }}
        onOk={onSubmit}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
