import { Modal, Select, Space, Button, message } from 'antd'
import { useEffect, useState } from 'react'
import { getAllPermissionsWithAssigned, roleAssignPermission, roleRemovePermission } from '../../api/rbac'

interface Props {
  open: boolean
  roleId: number
  value?: number
  onChange?: (id: number | undefined) => void
  onCancel: () => void
  onOk: () => void
}

export default function AssignPermissionsModal({ open, roleId, value, onChange, onCancel, onOk }: Props) {
  const [options, setOptions] = useState<Array<{ value: number; label: string; assigned: boolean }>>([])
  const [selected, setSelected] = useState<number | undefined>(value)

  useEffect(() => {
    if (!roleId) return
    getAllPermissionsWithAssigned(roleId).then(res => {
      const opts = res.data.map(p => ({ value: p.id, label: p.name, assigned: p.assigned }))
      setOptions(opts)
      setSelected(undefined)
      onChange?.(undefined)
    })
  }, [roleId, open, onChange])

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
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Select
          style={{ width: 360 }}
          placeholder="选择一个权限进行分配或移除"
          options={options.map(o => ({ value: o.value, label: o.label }))}
          value={selected}
          onChange={(v) => { setSelected(v); onChange?.(v) }}
          showSearch
        />
        <Space>
          <Button
            type="primary"
            disabled={!selected}
            onClick={() => {
              if (!selected) return
              roleAssignPermission(roleId, selected).then(() => message.success('已分配'))
            }}
          >
            分配
          </Button>
          <Button
            danger
            disabled={!selected}
            onClick={() => {
              if (!selected) return
              roleRemovePermission(roleId, selected).then(() => message.success('已移除'))
            }}
          >
            移除
          </Button>
        </Space>
      </Space>
    </Modal>
  )
}
