import { Layout, Menu, Typography, Avatar, Dropdown, Space } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { useUser } from '../../contexts/UserContext'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title } = Typography

interface LayoutProps {
  children: React.ReactNode
}

function MainLayout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUser()

  const getSelectedKey = () => {
    if (location.pathname === '/dashboard' || location.pathname.startsWith('/error/')) return '2'
    return '1'
  }

  const handleMenuClick = (key: string) => {
    if (key === '1') navigate('/home')
    if (key === '2') navigate('/dashboard')
  }

  // 退出登录处理
  const handleLogout = () => {
    logout()
  }

  // 下拉菜单选项
  const dropdownMenu = {
    items: [
      {
        key: '1',
        label: (
          <Space>
            <LogoutOutlined />
            退出登录
          </Space>
        ),
        onClick: handleLogout
      }
    ]
  }

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <Title level={4} className="main-logo">Sentry Admin</Title>
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            { key: '1', label: '首页' },
            { key: '2', label: '信息面板' },
          ]}
        />
        {/* 用户信息区域 */}
        {user && (
          <div className="user-info">
            <Dropdown menu={dropdownMenu} trigger={['hover']}>
              <Space>
                <Avatar src={user.avatar} alt={user.username} />
                <span className="username">{user.username}</span>
                <span className="arrow-icon">▼</span>
              </Space>
            </Dropdown>
          </div>
        )}
      </Header>
      <Content className="main-content">
        {children}
      </Content>
      <Footer className="main-footer">
        Sentry Admin ©2025 Created by Sentry
      </Footer>
    </Layout>
  )
}

export default MainLayout