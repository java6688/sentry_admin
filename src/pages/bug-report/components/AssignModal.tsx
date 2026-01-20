import { useEffect, useState, useRef } from 'react'
import { Modal, Form, Select, message, Spin } from 'antd'
import { assignBugReport, type BugReport } from '../../../api/bug-report'
import { getUserList, type UserSummary } from '../../../api/rbac'

interface AssignModalProps {
  open: boolean
  bugReport: BugReport | null
  onClose: () => void
  onSuccess: () => void
}

export default function AssignModal({ open, bugReport, onClose, onSuccess }: AssignModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [users, setUsers] = useState<UserSummary[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchUserList = async (username: string = '') => {
    setFetching(true)
    try {
      const res = await getUserList({ page: 1, pageSize: 50, username })
      setUsers(res.data.list)
    } catch (error) {
      console.error(error)
      message.error('获取用户列表失败')
    } finally {
      setFetching(false)
    }
  }

  const handleSearch = (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      fetchUserList(value)
    }, 500)
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
      fetchUserList('')
      if (bugReport?.assigneeId) {
        form.setFieldValue('assigneeId', bugReport.assigneeId)
      }
    }
  }, [open, bugReport, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (!bugReport) return

      setLoading(true)
      await assignBugReport(bugReport.id, { assigneeId: values.assigneeId })
      message.success('指派成功')
      onSuccess()
    } catch (error) {
      console.error(error)
      // Form or API error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="指派给用户"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="assigneeId"
          label="选择用户"
          rules={[{ required: true, message: '请选择用户' }]}
        >
          <Select
            showSearch
            placeholder="搜索用户名"
            notFoundContent={fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={handleSearch}
            options={users.map(user => ({
              label: user.username,
              value: user.id,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
