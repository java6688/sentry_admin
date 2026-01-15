import { Modal, Space, message, Input, Checkbox, List } from 'antd'
import { useEffect, useState } from 'react'
import { getAllPermissionsWithAssigned, roleAssignPermission, roleRemovePermission } from '../../api/rbac'

interface Props {
  open: boolean
  roleId: number
  onCancel: () => void
  onOk: () => void
}

export default function AssignPermissionsModal({ open, roleId, onCancel, onOk }: Props) {
  const [options, setOptions] = useState<Array<{ value: number; label: string; assigned: boolean }>>([])
  const [filter, setFilter] = useState('')
  const [itemLoading, setItemLoading] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!roleId) return
    getAllPermissionsWithAssigned(roleId).then(res => {
      const opts = res.data.map(p => ({ value: p.id, label: `${p.name}${p.description ? `（${p.description}）` : ''}` , assigned: p.assigned }))
      setOptions(opts)
    })
  }, [roleId, open])

  return (
    <Modal
      title="分配权限"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="完成"
      cancelText="取消"
      destroyOnHidden
      width={640}
    >
      <Space orientation="vertical" size={12} style={{ width: '100%' }}>
        <Input
          placeholder="搜索权限（支持 name/description）"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          allowClear
          style={{ width: 360 }}
        />
        <List
          bordered
          style={{ maxHeight: 420, overflow: 'auto' }}
          dataSource={options.filter(o => o.label.includes(filter))}
          renderItem={(item) => (
            <List.Item>
              <Checkbox
                checked={item.assigned}
                disabled={!!itemLoading[item.value]}
                onChange={async (e) => {
                  const checked = e.target.checked
                  setItemLoading(prev => ({ ...prev, [item.value]: true }))
                  const prevAssigned = item.assigned
                  // 先更新本地状态以提升响应速度
                  setOptions(prev => prev.map(o => o.value === item.value ? { ...o, assigned: checked } : o))
                  try {
                    if (checked) {
                      await roleAssignPermission(roleId, item.value)
                      message.success('已分配')
                    } else {
                      await roleRemovePermission(roleId, item.value)
                      message.success('已移除')
                    }
                  } catch {
                    // 回滚
                    setOptions(prev => prev.map(o => o.value === item.value ? { ...o, assigned: prevAssigned } : o))
                    message.error('操作失败，请重试')
                  } finally {
                    setItemLoading(prev => ({ ...prev, [item.value]: false }))
                  }
                }}
              >
                {item.label}
              </Checkbox>
            </List.Item>
          )}
        />
      </Space>
    </Modal>
  )
}
