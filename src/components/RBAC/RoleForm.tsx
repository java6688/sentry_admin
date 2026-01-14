import { Form, Input, Button, Space } from 'antd'

export interface RoleFormValues {
  name: string
  description?: string
}

interface Props {
  initialValues?: RoleFormValues
  onSubmit: (values: RoleFormValues) => void
  onCancel: () => void
}

export default function RoleForm({ initialValues, onSubmit, onCancel }: Props) {
  const [form] = Form.useForm<RoleFormValues>()
  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onSubmit}>
      <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
        <Input placeholder="例如：管理员" />
      </Form.Item>
      <Form.Item name="description" label="描述">
        <Input.TextArea placeholder="角色用途说明" />
      </Form.Item>
      <Space>
        <Button type="primary" htmlType="submit">保存</Button>
        <Button onClick={onCancel}>取消</Button>
      </Space>
    </Form>
  )
}
