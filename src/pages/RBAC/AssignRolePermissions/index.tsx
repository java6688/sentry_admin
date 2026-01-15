import { useEffect, useState } from 'react'
import { Card, Select, Space, Button, message } from 'antd'
import type { TransferItem } from 'antd/es/transfer'
import { getRoleList, getAllPermissionsWithAssigned, setRolePermissions, type Role, roleAssignPermission, roleRemovePermission } from '../../../api/rbac'
import TransferSelector from '../../../components/RBAC/TransferSelector'
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
      setItems(res.data.map(p => ({ key: String(p.id), title: `${p.name}${p.description ? `（${p.description}）` : ''}` })))
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
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
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
          <TransferSelector
            data={items}
            targetKeys={targetKeys}
            onChange={(nextTargetKeys, direction, moveKeys) => {
              setTargetKeys(nextTargetKeys.map(String))
              if (!roleId || !moveKeys || moveKeys.length === 0) return
              const ids = moveKeys.map(k => Number(k))
              if (direction === 'right') {
                Promise.all(ids.map(id => roleAssignPermission(roleId, id)))
                  .then(() => message.success('已分配所选权限'))
                  .catch(() => {
                    message.error('分配权限失败，请重试')
                    setTargetKeys(prev => prev.filter(k => !moveKeys.includes(k)))
                  })
              } else if (direction === 'left') {
                Promise.all(ids.map(id => roleRemovePermission(roleId, id)))
                  .then(() => message.success('已移除所选权限'))
                  .catch(() => {
                    message.error('移除权限失败，请重试')
                    setTargetKeys(prev => Array.from(new Set([...prev, ...moveKeys.map(String)])))
                  })
              }
            }}
            listHeight={450}
            fluid
          />
        </Card>
      </Space>
    </div>
  )
}
