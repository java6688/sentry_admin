import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { useUser } from '../../hooks/useUser'
import { login } from '../../api/index'
import './index.css'

function Login() {
  const [loading, setLoading] = useState(false)
  const { login: userLogin } = useUser()

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      console.log('values1', values)
      const response = await login(values)
      console.log('response2', response)
      if (response.success) {
        message.success(response.message)
        // 调用UserContext的登录方法，传递用户信息和token
        userLogin({
          id: response.data.user.id,
          username: response.data.user.username,
          email: '',
          avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=' + response.data.user.username
        }, response.data.accessToken)
      }
    } finally {
      setLoading(false)
    }
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
