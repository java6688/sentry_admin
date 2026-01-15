import { Modal } from 'antd'
import { useEffect, useState } from 'react'
import type { TransferItem } from 'antd/es/transfer'
import { getAllUserRolesWithAssigned } from '../../api/rbac'
import TransferSelector from './TransferSelector'

interface Props {
  open: boolean
  userId: number
  value: number[]
  onChange: (ids: number[]) => void
  onCancel: () => void
  onOk: () => void
}

export default function AssignRolesModal({ open, userId, value, onChange, onCancel, onOk }: Props) {
  const [items, setItems] = useState<TransferItem[]>([])

  useEffect(() => {
    if (!userId || !open) return
    getAllUserRolesWithAssigned(userId).then(res => {
      setItems(res.data.map(r => ({ key: String(r.id), title: r.name })))
      const checked = res.data.filter(r => r.assigned).map(r => r.id)
      onChange(checked)
    })
  }, [userId, open, onChange])

  return (
    <Modal
      title="绑定角色"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="保存"
      cancelText="取消"
      destroyOnHidden
      wrapClassName="modal-fit"
    >
      <TransferSelector
        data={items}
        targetKeys={value.map(id => String(id))}
        onChange={(nextKeys) => onChange(nextKeys.map(k => Number(k)))}
        listHeight={450}
        fluid
      />
    </Modal>
  )
}
