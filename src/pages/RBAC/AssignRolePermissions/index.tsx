import { useEffect, useState } from 'react'
import { Card, Select, Transfer, Space, Button, message } from 'antd'
import type { TransferItem } from 'antd/es/transfer'
import { getRoleList, getAllPermissionsWithAssigned, setRolePermissions, type Role } from '../../../api/rbac'
import './index.css'

export default function AssignRolePermissions() {
  const [roles, setRoles] = useState<Role[]>([])
  const [roleId, setRoleId] = useState<number | undefined>(undefined)
  const [items, setItems] = useState<TransferItem[]>([])
  const [targetKeys, setTargetKeys] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRoleList({ page: 1, pageSize: 100 }).then(res => setRoles(res.data.list))
  }, [])

  const loadRolePerms = (rid: number) => {
    setLoading(true)
    getAllPermissionsWithAssigned(rid).then(res => {
      setItems(res.data.map(p => ({ key: String(p.id), title: p.name })))
      setTargetKeys(res.data.filter(p => p.assigned).map(p => String(p.id)))
    }).finally(() => setLoading(false))
  }

  const onSave = () => {
    if (!roleId) return
    const ids = targetKeys.map(k => Number(k))
    setRolePermissions(roleId, { permissionIds: ids }).then(() => {
      message.success('批量分配已保存')
    })
  }

  return (
    <div className="assign-role-perms-page">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Card>
          <Space size={12}>
            <span>选择角色：</span>
            <Select
              style={{ width: 280 }}
              placeholder="请选择角色"
              options={roles.map(r => ({ value: r.id, label: r.name }))}
              value={roleId}
              onChange={(rid) => { setRoleId(rid); loadRolePerms(rid) }}
              showSearch
            />
            <Button type="primary" disabled={!roleId} onClick={onSave}>保存</Button>
          </Space>
        </Card>
        <Card loading={loading} title="分配权限">
          <Transfer
            dataSource={items}
            targetKeys={targetKeys}
            onChange={setTargetKeys}
            render={item => item.title ?? ''}
            styles={{ list: { width: 320, height: 380 } }}
          />
        </Card>
      </Space>
    </div>
  )
}
