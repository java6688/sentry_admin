import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useUser } from '../../hooks/useUser'
import './index.css'

function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useUser()

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true)
    setTimeout(() => {
      if (values.username === 'admin' && values.password === '123456') {
        message.success('登录成功')
        // 调用UserContext的登录方法
        login({
          id: 1,
          username: values.username,
          email: 'admin@example.com',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin'
        })
      } else {
        message.error('用户名或密码错误')
      }
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="login-container">
      <Card title="系统登录" className="login-card">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="admin" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="123456" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Login
