import { useState } from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
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
      <Card className="login-card">
        {/* 登录卡片头部 */}
        <div className="login-header">
          <div className="login-logo">
            <LockOutlined />
          </div>
          <h1 className="login-title">Sentry Admin</h1>
          <p className="login-desc">前端错误信息收集管理系统</p>
        </div>
        
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
            <Input
              placeholder="admin"
              prefix={<UserOutlined className="site-form-item-icon" />}
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              placeholder="123456"
              prefix={<LockOutlined className="site-form-item-icon" />}
              visibilityToggle
            />
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
